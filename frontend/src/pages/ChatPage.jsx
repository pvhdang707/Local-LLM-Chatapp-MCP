import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatHistory from '../components/ChatHistory';
import Welcome from '../components/Welcome';
import Loading from '../components/Loading';
import {
  createChatSession,
  getChatSessions,
  getChatMessages,
  sendMessage,
  deleteChatSession,
  updateSessionTitle
} from '../services/chatApi';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load danh sách session khi vào trang
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getChatSessions();
        if (data.sessions && data.sessions.length > 0) {
          setChats(data.sessions);
          setActiveChatId(data.sessions[0].id);
          // Tự động load messages của session đầu tiên
          await handleSelectChat(data.sessions[0].id);
        } else {
          // Nếu không có session nào, tự tạo mới
          await handleNewChat();
        }
      } catch (err) {
        setChats([]);
        await handleNewChat();
      }
    };
    fetchSessions();
    // eslint-disable-next-line
  }, []);

  // Khi chọn session, load messages
  const handleSelectChat = async (chatId) => {
    setActiveChatId(chatId);
    setIsLoading(true);
    try {
      const data = await getChatMessages(chatId);
      // Chuẩn hóa message cho ChatHistory
      const msgs = (data.messages || []).map((msg) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: msg.timestamp
      }));
      setMessages(msgs);
    } catch (err) {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Tạo phiên chat mới
  const handleNewChat = async () => {
    setIsLoading(true);
    try {
      const data = await createChatSession('Cuộc trò chuyện mới');
      const newChat = data.session;
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setMessages([]);
    } catch (err) {
      // Xử lý lỗi
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa phiên chat
  const handleDeleteChat = async (chatId) => {
    setIsLoading(true);
    try {
      await deleteChatSession(chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (err) {}
    setIsLoading(false);
  };

  // Gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChatId) return;
    const userMsg = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    try {
      // Gửi message lên server
      const data = await sendMessage(activeChatId, userMsg.text);
      // Lấy lại messages mới nhất
      await handleSelectChat(activeChatId);
    } catch (err) {
      // Xử lý lỗi
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex px-4 pb-4">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
        />
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow-md h-[calc(100vh-96px)] flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <Welcome />
              ) : (
                <ChatHistory messages={messages} />
              )}
            </div>
            {isLoading && <Loading />}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={!activeChatId || isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !activeChatId}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                  Gửi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
