import React from 'react';
import Message from './Message';

const ChatHistory = ({ messages = [] }) => {
  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          text={message.text}
          isUser={message.sender === 'user'}
          timestamp={message.timestamp}
        />
      ))}
    </div>
  );
};

export default ChatHistory; 