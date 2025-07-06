import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import ChatLoadingMessage from './ChatLoadingMessage';
import MessageLoading from './MessageLoading';
import { useEnhancedChat } from '../contexts/EnhancedChatContext';

const ChatHistory = ({ messages, isLoading, onDownload, loadingSessionId, selectedSessionId }) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { isEnhancedProcessing, processingSteps, chatMode } = useEnhancedChat();

  // Tự động scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Theo dõi scroll để hiện nút quay về cuối
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      // Nếu user scroll lên trên quá 200px so với đáy thì hiện nút
      setShowScrollToBottom(scrollHeight - scrollTop - clientHeight > 200);
    };
    const ref = containerRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (ref) ref.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Loading khi chuyển session
  if ((isLoading || loadingSessionId === selectedSessionId) && messages.length === 0) {
    return <MessageLoading />;
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 my-10">
        Chưa có tin nhắn nào trong cuộc trò chuyện này.
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-2 max-h-[calc(100vh-220px)]"
        style={{ height: '100%' }}
      >
        {messages.map((msg, idx) => (
          <Message 
            key={msg.id || idx} 
            message={msg} 
            onDownload={onDownload} 
            className={`
              font-sans
              ${msg.sender === 'user' ? 'text-base font-medium text-blue-900' : 'text-base font-semibold text-gray-900'}
              leading-relaxed
            `}
          />
        ))}
        {/* Hiển thị process status dưới tin nhắn cuối cùng khi đang xử lý enhanced chat */}
        {isEnhancedProcessing && chatMode === 'enhanced' && (
          <div className="w-full flex flex-col items-center my-4">
            <div className="w-full max-w-md bg-white border border-blue-200 rounded-xl shadow p-4 animate-pulse">
              <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Đang xử lý enhanced chat...
              </div>
              <div className="space-y-2">
                {processingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Hiển thị loading message khi đang chờ AI trả lời (chỉ khi không phải enhanced) */}
        {isLoading && messages.length > 0 && !(isEnhancedProcessing && chatMode === 'enhanced') && (
          <ChatLoadingMessage />
        )}
        <div ref={bottomRef} />
      </div>
      {showScrollToBottom && (
        <button
          onClick={handleScrollToBottom}
          className="absolute right-6 bottom-8 z-10 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-all"
        >
          Quay về tin nhắn mới nhất
        </button>
      )}
    </div>
  );
};

export default ChatHistory; 