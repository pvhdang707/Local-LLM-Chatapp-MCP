import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatHistory from '../components/ChatHistory';
import Welcome from '../components/Welcome';
import Loading from '../components/Loading';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username] = useState(localStorage.getItem('username'));

  // Tạo phiên chat mới
  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'Cuộc trò chuyện mới',
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMessages([]);
  };

  // Chọn phiên chat
  const handleSelectChat = (chatId) => {
    const selectedChat = chats.find((chat) => chat.id === chatId);
    if (selectedChat) {
      setActiveChatId(chatId);
      setMessages(selectedChat.messages);
    }
  };

  // Xóa phiên chat
  const handleDeleteChat = (chatId) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  };

  // Cập nhật tiêu đề chat dựa trên tin nhắn đầu tiên
  const updateChatTitle = (chatId, firstMessage) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, title: firstMessage.text.slice(0, 30) + '...' }
          : chat
      )
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    // Nếu chưa có phiên chat nào, tạo mới
    if (!activeChatId) {
      handleNewChat();
    }

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, newMessage, botMessage];
      setMessages(updatedMessages);

      // Cập nhật tin nhắn trong phiên chat
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: updatedMessages }
            : chat
        )
      );

      // Cập nhật tiêu đề nếu là tin nhắn đầu tiên
      if (messages.length === 0) {
        updateChatTitle(activeChatId, newMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar username={username} />
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
                />
                <button
                  type="submit"
                  disabled={isLoading}
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
