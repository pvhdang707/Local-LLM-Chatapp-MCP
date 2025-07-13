import React from 'react';
import EnhancedChatMessage from './EnhancedChatMessage';
import AgenticChatMessage from './AgenticChatMessage';

const ChatMessage = ({ isUser, message, enhanced = null, agentic = null, onDownload }) => {
  // Xử lý nội dung tin nhắn
  let displayMessage = '';
  if (isUser) {
    // For user messages, use the text directly
    displayMessage = message.text || '';
  } else {
    // For bot messages, use the text directly since it's already processed
    displayMessage = message.text || 'Hệ thống đã xử lý yêu cầu của bạn.';
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-full px-5 py-3 rounded-2xl shadow-md text-base leading-relaxed break-words
          ${isUser
            ? 'bg-blue-600 text-white rounded-br-md rounded-tr-2xl rounded-tl-2xl'
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md rounded-tl-2xl rounded-tr-2xl'}
        `}
        style={{ minWidth: 60 }}
      >
        <div className="message-content whitespace-pre-line">
          {displayMessage}
        </div>
        {/* Agentic Chat Results - ưu tiên cao nhất */}
        {!isUser && agentic && (
          <AgenticChatMessage 
            message={displayMessage} 
            agentic={agentic} 
            onDownload={onDownload}
          />
        )}
        {/* Enhanced Chat Results - chỉ hiển thị khi không có agentic */}
        {!isUser && enhanced && !agentic && (
          <EnhancedChatMessage 
            message={displayMessage} 
            enhanced={enhanced} 
            onDownload={onDownload}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
  