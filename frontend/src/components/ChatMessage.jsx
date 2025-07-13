import React from 'react';
import EnhancedChatMessage from './EnhancedChatMessage';

const ChatMessage = ({ isUser, message, enhanced = null, agentic = null, onDownload }) => {
  // Ưu tiên agentic nếu có
  const enhancedData = agentic || enhanced;

  // Xử lý nội dung tin nhắn
  let displayMessage = '';
  if (isUser) {
    displayMessage = message.user_request || message.text || '';
  } else {
    if (message.response) {
      displayMessage = message.response;
    } else if (message.execution_results?.chain_of_thought) {
      displayMessage = message.execution_results.chain_of_thought;
    } else if (message.summary) {
      displayMessage = message.summary;
    } else {
      displayMessage = 'Hệ thống đã xử lý yêu cầu của bạn.';
    }
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
        {/* Enhanced/Agentic Chat Results */}
        {!isUser && enhancedData && (
          <EnhancedChatMessage 
            message={displayMessage} 
            enhanced={enhancedData} 
            onDownload={onDownload}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
  