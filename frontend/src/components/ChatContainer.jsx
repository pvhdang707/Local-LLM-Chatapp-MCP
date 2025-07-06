import React, { useEffect, useState } from 'react';
import { useChatSession } from '../contexts/ChatSessionContext';
import { useEnhancedChat } from '../contexts/EnhancedChatContext';
import { useAuth } from '../contexts/AuthContext';
import ChatSessionList from './ChatSessionList';
import ChatHistory from './ChatHistory';
import Welcome from './Welcome';
import Loading from './Loading';
import ChatStatus from './ChatStatus';
import ChatInput from './ChatInput';
import EnhancedChatToggle from './EnhancedChatToggle';
import EnhancedProcessingModal from './EnhancedProcessingModal';
import DebugPanel from './DebugPanel';
import ChatAreaLoading from './ChatAreaLoading';
import SessionLoading from './SessionLoading';
import FileUploadPage from '../pages/FileUploadPage';
import AdminPage from '../pages/AdminPage';
import '../utils/debugUtils'; // Load debug functions

import logo from '../assets/logo.png';

const ChatContainer = () => {
  const {
    sessions,
    selectedSessionId,
    messages,
    isLoading,
    isLoadingSessions,
    isLoadingChat,
    error,
    loadSessions,
    selectSession,
    sendMessage,
    createSession,
    startNewSession,
    isComposingNew,
    updateSession,
    loadingSessionId
  } = useChatSession();

  const { chatMode, isEnhancedProcessing } = useEnhancedChat();
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Tab state: 'chat', 'files', 'admin'
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Thêm state để control sidebar
  const [hasLoadedSessions, setHasLoadedSessions] = useState(false); // Track việc đã load sessions

  // Sidebar tab config
  const sidebarTabs = [
    {
      key: 'chat',
      label: 'Trò chuyện',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      key: 'files',
      label: 'Quản lý File',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6" />
        </svg>
      ),
    },
    ...(isAdmin ? [{
      key: 'admin',
      label: 'Quản trị viên',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7m-7-7h14" />
        </svg>
      ),
    }] : [])
  ];

  const [showDebugPanel, setShowDebugPanel] = useState(true); // Bật debug panel
  const [loading, setLoading] = useState(false);

  // Khi đổi tab, nếu là chat thì load lại session nếu chưa có
  useEffect(() => {
    if (activeTab === 'chat' && sessions.length === 0 && !isLoadingSessions && !hasLoadedSessions) {
      console.log('[CHAT CONTAINER] Loading sessions for the first time');
      setHasLoadedSessions(true);
      loadSessions();
    }
  }, [activeTab, sessions.length, isLoadingSessions, hasLoadedSessions]); // Loại bỏ loadSessions khỏi dependency

  // Tự động bật trạng thái soạn mới khi không có session
  useEffect(() => {
    if (activeTab === 'chat' && !selectedSessionId && sessions.length > 0 && !isComposingNew) {
      startNewSession();
    }
  }, [activeTab, selectedSessionId, sessions.length, isComposingNew]);

  // Khi user bấm "Cuộc trò chuyện mới"
  const handleNewChat = () => {
    startNewSession();
  };

  // Khi user chọn session cũ
  const handleSelectSession = (sessionId) => {
    selectSession(sessionId);
  };

  // Handle delete chat
  const handleDeleteChat = async (chatId) => {
    console.log('[CHAT CONTAINER] Xóa chat:', chatId);
    try {
      // Nếu đang chọn session bị xóa, bỏ chọn
      if (selectedSessionId === chatId) {
        await selectSession(null);
      }
      // Reload danh sách sessions để cập nhật UI
      await loadSessions();
    } catch (error) {
      console.error('[CHAT CONTAINER] Lỗi xóa chat:', error);
    }
  };

  // Handle update session title
  const handleUpdateSession = async (sessionId, newTitle) => {
    console.log('[CHAT CONTAINER] Cập nhật session:', sessionId, newTitle);
    try {
      await updateSession(sessionId, newTitle);
    } catch (error) {
      console.error('[CHAT CONTAINER] Lỗi cập nhật session:', error);
    }
  };

  // Handle download file
  const handleDownload = async (url, filename) => {
    console.log('[CHAT CONTAINER] Download file:', { url, filename });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Không thể tải file');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('[CHAT CONTAINER] File đã download thành công:', filename);
    } catch (error) {
      console.error('[CHAT CONTAINER] Lỗi download file:', error);
    }
  };

  // Gửi tin nhắn (context sẽ tự tạo session nếu cần)
  const handleSendMessage = async (msg, mode) => {
    await sendMessage(msg, mode);
  };

  // Lấy session đang chọn
  const currentSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="fixed inset-0 flex bg-gray-50">
      {/* Sidebar - Left */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-gray-900 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
        {/* Project Name Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 select-none border-b border-gray-700">
          <div className="flex items-center gap-2">
            
            <img src={logo} alt="logo" className="w-7 h-7" />
            <span className="text-xl font-bold text-white tracking-wide">Local LLM Chat</span>
          </div>
          {/* Nút đóng/mở sidebar cho mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs đầu sidebar */}
        <div className="py-2 px-2 border-b border-gray-700">
          {sidebarTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 my-2 rounded-lg mb-1 text-left transition-all duration-200
                ${activeTab === tab.key 
                  ? 'bg-blue-600 text-white font-semibold shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Sessions List */}
        {activeTab === 'chat' && (
          <div className="flex-1 overflow-hidden">
            {(authLoading || isLoadingSessions) ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Đang tải cuộc trò chuyện...</p>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <ChatSessionList
                  sessions={sessions}
                  selectedSessionId={selectedSessionId}
                  onSelectSession={handleSelectSession}
                  onCreateSession={handleNewChat}
                  onDeleteChat={handleDeleteChat}
                  onUpdateSession={handleUpdateSession}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Nếu là tab khác thì vẫn giữ sidebar chiều cao */}
        {activeTab !== 'chat' && <div className="flex-1" />}

        {/* User Menu - Bottom of Sidebar */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.username || 'User'}</div>
              <div className="text-gray-400 text-xs truncate">{user?.email || user?.role || ''}</div>
            </div>
            {/* Nút logout */}
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
              title="Đăng xuất"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Right */}
      <div className="flex-1 flex flex-col bg-white items-center ">
        {/* Top Bar */}
        {/* <div className=" h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-white w-full max-w-5xl mx-auto">
          {/* <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {activeTab === 'chat' && (
                selectedSessionId
                  ? (currentSession?.title || 'Cuộc trò chuyện mới')
                  : 'Chọn cuộc trò chuyện'
              )}
              {activeTab === 'files' && 'Quản lý File'}
              {activeTab === 'admin' && 'Quản trị viên'}
            </h1>
          </div> *
        </div> */}

        {/* Main Content Area */}
        <div className="flex-1 w-full flex flex-col items-center overflow-hidden ">
          <div className="w-full max-w-5xl flex-1 flex flex-col">
            {activeTab === 'chat' && (
              isLoadingChat && !selectedSessionId ? (
                <ChatAreaLoading message="Đang tải cuộc trò chuyện..." />
              ) : (
                <div className="h-full flex flex-col">
                  {error && (
                    <div className="p-4 bg-red-50 border-b border-red-200">
                      <ChatStatus 
                        status={error.type} 
                        message={error.message}
                      />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    {selectedSessionId ? (
                      <ChatHistory 
                        messages={messages} 
                        onDownload={handleDownload}
                        isLoading={isLoadingChat}
                        loadingSessionId={loadingSessionId}
                        selectedSessionId={selectedSessionId}
                      />
                    ) : (
                      <Welcome onCreateNewChat={handleNewChat} />
                    )}
                  </div>
                </div>
              )
            )}
            {activeTab === 'files' && (
              <div className="h-full bg-gray-50">
                <FileUploadPage embedded />
              </div>
            )}
            {activeTab === 'admin' && isAdmin && (
              <div className="h-full bg-gray-50">
                <AdminPage embedded />
              </div>
            )}
          </div>
        </div>

        {/* Chat Input - Bottom */}
        {activeTab === 'chat' && sessions.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-6 w-full flex justify-center">
            <div className="w-full max-w-3xl">
              <ChatInput 
                onSend={handleSendMessage}
                disabled={isLoadingChat}
                isLoading={isLoadingChat}
                showToggle={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Debug Panel */}
      {/* <DebugPanel isVisible={showDebugPanel} /> */}
    </div>
  );
};

export default ChatContainer; 