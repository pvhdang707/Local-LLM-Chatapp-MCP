import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getChatSessions, getChatMessages, createChatSession, sendChatMessage, deleteChatSession } from '../services/api';
import { useEnhancedChat } from './EnhancedChatContext';

const ChatSessionContext = createContext();

export const ChatSessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [isComposingNew, setIsComposingNew] = useState(false);
  
  // Enhanced Chat Integration
  const { processEnhancedChat, chatMode } = useEnhancedChat();

  // Ref để track việc đã load sessions
  const hasLoadedSessionsRef = useRef(false);

  // Load danh sách session khi vào trang
  const loadSessions = useCallback(async (force = false) => {
    // Nếu đã load rồi và không force reload thì skip
    if (hasLoadedSessionsRef.current && !force) {
      console.log('[CHAT SESSION] Sessions already loaded, skipping...');
      return;
    }

    // Nếu đang loading thì skip
    if (isLoadingSessions) {
      console.log('[CHAT SESSION] Already loading sessions, skipping...');
      return;
    }

    setIsLoadingSessions(true);
    setError(null);
    try {
      // Debug: kiểm tra token
      const token = localStorage.getItem('token');
      console.log('[CHAT SESSION] Loading sessions, token:', token ? 'exists' : 'missing');
      
      const data = await getChatSessions();
      console.log('[CHAT SESSION] Sessions loaded:', data);
      setSessions(data);
      hasLoadedSessionsRef.current = true;
    } catch (err) {
      console.error('[CHAT SESSION] Error loading sessions:', err);
      setError({ type: 'load_sessions', message: 'Lỗi tải danh sách chat.' });
    } finally {
      setIsLoadingSessions(false);
    }
  }, [isLoadingSessions]);

  // Chọn session cũ, load messages
  const selectSession = useCallback(async (sessionId) => {
    setIsLoadingChat(true);
    setLoadingSessionId(sessionId);
    setError(null);
    setSelectedSessionId(sessionId);
    setIsComposingNew(false);
    setMessages([]);
    try {
      const msgsRaw = await getChatMessages(sessionId);
      // Chuẩn hóa: mỗi object thành 2 message (user và bot)
      const msgs = [];
      msgsRaw.forEach(msg => {
        if (msg.message) {
          msgs.push({
            sender: 'user',
            text: msg.message,
            timestamp: msg.created_at || null,
          });
        }
        if (msg.response && msg.response.trim() !== '') {
          msgs.push({
            sender: 'bot',
            text: msg.response,
            timestamp: msg.created_at || null,
          });
        }
      });
      setMessages(prev => (selectedSessionId === sessionId ? msgs : prev));
    } catch (err) {
      setError({ type: 'load_messages', message: 'Lỗi tải tin nhắn.' });
      setMessages([]);
    } finally {
      setIsLoadingChat(false);
      setLoadingSessionId(null);
    }
  }, [selectedSessionId]);

  // Bắt đầu chat mới (chưa tạo session)
  const startNewSession = useCallback(() => {
    setSelectedSessionId(null);
    setMessages([]);
    setIsComposingNew(true);
    setError(null);
  }, []);

  // Tạo session mới (khi gửi tin nhắn đầu tiên hoặc bấm nút)
  const createSession = useCallback(async () => {
    setIsLoadingChat(true);
    setError(null);
    try {
      console.log('[LOG] Gọi createChatSession với title mặc định');
      const session = await createChatSession();
      console.log('[LOG] Kết quả createChatSession:', session);
      setSelectedSessionId(session.id);
      setMessages([]);
      setIsComposingNew(false);
      await loadSessions(true);
      return session;
    } catch (err) {
      setError({ type: 'create_session', message: 'Lỗi tạo cuộc trò chuyện mới.' });
      throw err;
    } finally {
      setIsLoadingChat(false);
    }
  }, [loadSessions]);

  // Gửi tin nhắn (tự tạo session nếu đang ở trang mới)
  const sendMessage = useCallback(async (text, mode = 'normal') => {
    setIsLoadingChat(true);
    setError(null);
    let sessionId = selectedSessionId;
    let createdSession = null;
    let justCreatedSession = false;

    try {
      if (!sessionId && isComposingNew) {
        console.log('[LOG] Chưa có session, tạo session mới trước khi gửi message:', text);
        createdSession = await createSession();
        sessionId = createdSession.id;
        justCreatedSession = true;
        console.log('[LOG] Đã tạo session mới, id:', sessionId);
      }
      if (!sessionId) throw new Error('Chưa chọn cuộc trò chuyện.');

      // 1. Hiển thị ngay tin nhắn user lên UI (optimistic update)
      const userMsg = {
        sender: 'user',
        text,
        timestamp: new Date().toISOString(),
        mode: mode
      };
      setMessages(prev => [...prev, userMsg]);
      console.log('[LOG] Đã thêm message user vào UI:', userMsg);

      // 2. Thêm message bot tạm thời (loading)
      const loadingBotMsg = {
        sender: 'bot',
        text: 'AI đang suy nghĩ...',
        timestamp: new Date().toISOString(),
        mode: mode,
        isLoading: true
      };
      setMessages(prev => [...prev, loadingBotMsg]);

      // 3. Xử lý tin nhắn dựa trên mode
      let res;
      if (mode === 'enhanced') {
        console.log('[LOG] Gửi message enhanced:', text, 'với sessionId:', sessionId);
        const enhancedResult = await processEnhancedChat(text, sessionId);
        res = {
          response: enhancedResult.response?.response || enhancedResult.response?.text || 'Không có phản hồi',
          enhanced: enhancedResult.response
        };
      } else {
        console.log('[LOG] Gửi message thường:', text, 'với sessionId:', sessionId);
        res = await sendChatMessage(sessionId, text);
      }
      console.log('[LOG] Kết quả trả về từ backend:', res);

      // 4. Khi có kết quả, thay thế message bot tạm thời bằng câu trả lời thật
      setMessages(prev => {
        // Tìm vị trí message bot loading cuối cùng
        const idx = prev.map(m => m.isLoading).lastIndexOf(true);
        if (idx !== -1) {
          const newMsgs = [...prev];
          newMsgs[idx] = {
            sender: 'bot',
            text: res.response || res.text,
            timestamp: new Date().toISOString(),
            enhanced: res.enhanced || null,
            mode: mode,
            isLoading: false
          };
          return newMsgs;
        } else {
          // Nếu không tìm thấy, thêm mới
          return [
            ...prev,
            {
              sender: 'bot',
              text: res.response || res.text,
              timestamp: new Date().toISOString(),
              enhanced: res.enhanced || null,
              mode: mode,
              isLoading: false
            }
          ];
        }
      });
      console.log('[LOG] Đã cập nhật/thay thế message bot loading bằng câu trả lời thật');

      if (justCreatedSession && createdSession) {
        setSelectedSessionId(createdSession.id);
        setIsComposingNew(false);
      }
    } catch (err) {
      console.error('[CHAT SESSION] Error sending message:', err);
      setError({ type: 'send_message', message: 'Lỗi gửi tin nhắn.' });
      // Nếu lỗi, loại bỏ message bot loading
      setMessages(prev => prev.filter(m => !m.isLoading));
    } finally {
      setIsLoadingChat(false);
    }
  }, [selectedSessionId, isComposingNew, createSession, processEnhancedChat]);

  // Cập nhật tiêu đề session
  const updateSession = useCallback(async (sessionId, newTitle) => {
    try {
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, title: newTitle }
            : session
        )
      );
    } catch (err) {
      console.error('[CHAT SESSION] Error updating session:', err);
      setError({ type: 'update_session', message: 'Lỗi cập nhật cuộc trò chuyện.' });
    }
  }, []);

  // Xóa session và reload lại danh sách
  const deleteSession = useCallback(async (sessionId) => {
    try {
      await deleteChatSession(sessionId);
      // Nếu session đang chọn bị xóa, bỏ chọn
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
        setMessages([]);
      }
      // Reload lại danh sách session
      await loadSessions(true);
    } catch (err) {
      setError({ type: 'delete_session', message: 'Lỗi xóa cuộc trò chuyện.' });
    }
  }, [selectedSessionId, loadSessions]);

  return (
    <ChatSessionContext.Provider
      value={{
        sessions,
        selectedSessionId,
        messages,
        isLoading,
        isLoadingSessions,
        isLoadingChat,
        loadingSessionId,
        error,
        isComposingNew,
        loadSessions,
        selectSession,
        sendMessage,
        createSession,
        startNewSession,
        updateSession,
        deleteSession, // Thêm vào context
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
};

export const useChatSession = () => useContext(ChatSessionContext); 