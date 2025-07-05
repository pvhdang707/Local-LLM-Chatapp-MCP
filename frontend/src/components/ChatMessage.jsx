import React from 'react';
import EnhancedChatMessage from './EnhancedChatMessage';

const ChatMessage = ({ isUser, message, enhanced = null, onDownload }) => {
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
          {message}
        </div>
        
        {/* Enhanced Chat Results */}
        {!isUser && enhanced && (
          <EnhancedChatMessage 
            message={message} 
            enhanced={enhanced} 
            onDownload={onDownload}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
  