import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getChatSessions, getChatMessages, createChatSession, sendChatMessage } from '../services/api';
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
      const session = await createChatSession();
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
    
    // 1. Hiển thị ngay tin nhắn user lên UI (optimistic update)
    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      mode: mode
    };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      if (!sessionId && isComposingNew) {
        // Tạo session mới trước khi gửi tin nhắn đầu tiên
        createdSession = await createSession();
        sessionId = createdSession.id;
        // Không thêm session thủ công vào mảng, chỉ load lại từ API
      }
      if (!sessionId) throw new Error('Chưa chọn cuộc trò chuyện.');
      
      // 2. Xử lý tin nhắn dựa trên mode
      let res;
      if (mode === 'enhanced') {
        // Enhanced Chat Processing
        const enhancedResult = await processEnhancedChat(text, sessionId);
        res = {
          response: enhancedResult.response?.response || enhancedResult.response?.text || 'Không có phản hồi',
          enhanced: enhancedResult.response
        };
      } else {
        // Normal Chat Processing
        res = await sendChatMessage(sessionId, text);
      }
      
      // 3. Nếu backend trả về response từ bot, push tiếp vào UI
      if (res && (res.response || res.text)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: res.response || res.text,
            timestamp: new Date().toISOString(),
            enhanced: res.enhanced || null,
            mode: mode
          }
        ]);
      }
      
      if (createdSession) {
        // Đã load lại session từ API trong createSession, không cần thêm thủ công
        setSelectedSessionId(createdSession.id);
        setIsComposingNew(false);
      }
    } catch (err) {
      console.error('[CHAT SESSION] Error sending message:', err);
      setError({ type: 'send_message', message: 'Lỗi gửi tin nhắn.' });
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
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
};

export const useChatSession = () => useContext(ChatSessionContext); 