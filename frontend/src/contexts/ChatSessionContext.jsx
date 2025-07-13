import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getChatSessions, getChatMessages, createChatSession, sendChatMessage, deleteChatSession } from '../services/api';
import { createAgenticSession, chatWithAgenticSession, getAgenticSessions, deleteAgenticSession } from '../services/agenticApi';
import { useEnhancedChat } from './EnhancedChatContext';
import { getAgenticSessionMessages } from '../services/agenticApi';
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
      
      // Load cả chat sessions và agentic sessions
      const [chatSessions, agenticSessions] = await Promise.all([
        getChatSessions(),
        getAgenticSessions()
      ]);
      
      // Kết hợp và phân loại sessions
      const allSessions = [
        ...(chatSessions || []).map(s => ({ ...s, type: 'normal' })),
        ...(agenticSessions?.sessions || []).map(s => ({ ...s, type: 'agentic' }))
      ];
      
      // Sắp xếp theo thời gian tạo mới nhất
      allSessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      console.log('[CHAT SESSION] All sessions loaded:', allSessions);
      setSessions(allSessions);
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
      // Xác định session type để load messages phù hợp
      const session = sessions.find(s => s.id === sessionId);
      
      let msgs = [];
      if (session?.type === 'agentic') {
        // Load Agentic AI messages
        const agenticMsgs = await getAgenticSessionMessages(sessionId);
        console.log('[DEBUG] Raw agentic messages:', agenticMsgs);
        
        // Xử lý messages từ Agentic API - mỗi message có cả user request và bot response
        (agenticMsgs?.messages || []).forEach(msg => {
          // Thêm user message
          if (msg.user_request) {
            msgs.push({
              sender: 'user',
              text: msg.user_request,
              timestamp: msg.created_at || null,
              agentic: null
            });
          }
          
          // Thêm bot response - ưu tiên response trước, sau đó execution_results
          if (msg.status === 'completed') {
            let botText = '';
            
            if (msg.response && msg.response.trim() && msg.response !== 'null') {
              // Có response trực tiếp
              botText = msg.response;
            } else if (msg.execution_results?.summary) {
              // Tạo summary từ execution_results
              const summary = msg.execution_results.summary;
              const steps = summary.total_steps_completed || 0;
              const filesProcessed = summary.files_processed || 0;
              
              botText = `✅ **Đã hoàn thành ${steps} bước xử lý**\n📁 **Đã xử lý ${filesProcessed} file**`;
              
              // Thêm thông tin chi tiết các action
              if (summary.actions_performed && summary.actions_performed.length > 0) {
                botText += '\n\n🔧 **Các hành động đã thực hiện:**\n';
                summary.actions_performed.forEach((action) => {
                  botText += `  • ${action.description}: ${action.status === 'success' ? '✅ Thành công' : '❌ Thất bại'}\n`;
                });
              }
              
              // Thêm chain of thought nếu có
              if (msg.execution_results.chain_of_thought) {
                botText += `\n\n🧠 **Quá trình suy nghĩ:**\n${msg.execution_results.chain_of_thought}`;
              }
            } else if (msg.execution_results?.chain_of_thought) {
              botText = `🧠 **Quá trình xử lý:**\n${msg.execution_results.chain_of_thought}`;
            } else {
              botText = '✅ **Đã hoàn thành xử lý yêu cầu của bạn.**';
            }
            
            msgs.push({
              sender: 'bot',
              text: botText,
              timestamp: msg.completed_at || msg.created_at || null,
              agentic: msg
            });
          } else if (msg.status === 'failed') {
            msgs.push({
              sender: 'bot',
              text: `❌ **Xử lý thất bại**\n${msg.error_message || 'Có lỗi xảy ra trong quá trình xử lý.'}`,
              timestamp: msg.created_at || null,
              agentic: msg
            });
          }
        });
      } else {
        // Load chat messages thường
        const msgsRaw = await getChatMessages(sessionId);
        // Chuẩn hóa: mỗi object thành 2 message (user và bot)
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
      }
      
      console.log('[DEBUG] Processed messages:', msgs);
      setMessages(prev => (selectedSessionId === sessionId ? msgs : prev));
    } catch (err) {
      setError({ type: 'load_messages', message: 'Lỗi tải tin nhắn.' });
      setMessages([]);
    } finally {
      setIsLoadingChat(false);
      setLoadingSessionId(null);
    }
  }, [selectedSessionId, sessions]);

  // Bắt đầu chat mới (chưa tạo session)
  const startNewSession = useCallback(() => {
    setSelectedSessionId(null);
    setMessages([]);
    setIsComposingNew(true);
    setError(null);
  }, []);

  // Tạo session mới (khi gửi tin nhắn đầu tiên hoặc bấm nút)
  const createSession = useCallback(async (sessionType = 'normal') => {
    setIsLoadingChat(true);
    setError(null);
    try {
      console.log('[LOG] Gọi createChatSession với sessionType:', sessionType);
      
      let session;
      if (sessionType === 'agentic') {
        // Tạo Agentic AI session
        session = await createAgenticSession();
        session.type = 'agentic'; // Thêm type để track
      } else if (sessionType === 'enhanced') {
        // Tạo enhanced chat session
        session = await createChatSession();
        session.type = 'enhanced';
      } else {
        // Tạo chat session thường
        session = await createChatSession();
        session.type = 'normal';
      }
      
      console.log('[LOG] Kết quả createSession:', session);
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

      // Lấy thông tin session hiện tại
      const currentSession = sessions.find(s => s.id === sessionId);

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

      // 3. Xử lý tin nhắn dựa trên mode và session type
      let res;
      const sessionType = currentSession?.type || createdSession?.type || 'normal';
      
      if (mode === 'enhanced' || sessionType === 'enhanced') {
        console.log('[LOG] Gửi message enhanced:', text, 'với sessionId:', sessionId);
        const enhancedResult = await processEnhancedChat(text, sessionId);
        res = {
          response: enhancedResult.response?.response || enhancedResult.response?.text || 'Không có phản hồi',
          enhanced: enhancedResult.response
        };
      } else if (sessionType === 'agentic') {
        // Xử lý Agentic AI session
        console.log('[LOG] Gửi message Agentic AI:', text, 'với sessionId:', sessionId);
        const agenticResult = await chatWithAgenticSession(sessionId, text);
        res = {
          response: agenticResult.response || 'Không có phản hồi',
          agentic: agenticResult
        };
      } else {
        console.log('[LOG] Gửi message thường:', text, 'với sessionId:', sessionId);
        res = await sendChatMessage(sessionId, text);
      }
      
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
            agentic: res.agentic || null,
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
              agentic: res.agentic || null,
              mode: mode,
              isLoading: false
            }
          ];
        }
      });
      console.log('[LOG] Kết quả trả về từ backend:', res);
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
      // Tìm session để xác định type
      const session = sessions.find(s => s.id === sessionId);
      
      if (session?.type === 'agentic') {
        await deleteAgenticSession(sessionId);
      } else {
        await deleteChatSession(sessionId);
      }
      
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
  }, [selectedSessionId, loadSessions, sessions]);

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