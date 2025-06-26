import React from 'react';

const Message = ({ text, isUser, timestamp }) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-4 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}
      >
        <p className="text-sm">{text}</p>
        <span className="mt-1 block text-xs opacity-70">{formattedTime}</span>
      </div>
    </div>
  );
};

export default Message; 