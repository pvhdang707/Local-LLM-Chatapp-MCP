import React from 'react';
import ChatMessage from './ChatMessage';
import logo from '../assets/logo.png';
import logo_user from '../assets/user.png';

const Message = ({ message, onDownload }) => {
  if (!message) return null;
  const { sender, text, timestamp, enhanced, mode } = message;
  const isUser = sender === 'user';
  
  // Avatar: chữ cái đầu hoặc icon
  const avatar = isUser
    ? <div className="w-8 h-8 rounded-full  flex items-center justify-center text-white font-bold text-base shadow">
      <img src={logo_user} alt="logo" className="w-8 h-8" />
    </div>
    : <div className="w-8 h-8 rounded-full  flex items-center justify-center text-gray-700 font-bold text-base shadow">
      <img src={logo} alt="logo" className="w-8 h-8" />
    </div>;

  return (
    <div className={`flex w-full mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!isUser && <div className="mr-2 flex-shrink-0 flex items-end">{avatar}</div>}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        <ChatMessage 
          isUser={isUser} 
          message={text} 
          enhanced={enhanced}
          onDownload={onDownload}
        />
        <div className={`text-[11px] text-gray-400 select-none pt-1 ${isUser ? 'text-right pr-2' : 'text-left pl-2'}`}>
          <div className="flex items-center space-x-2">
            <span>{timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            {mode === 'enhanced' && !isUser && (
              <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-green-100 text-green-800">
                🔍 Enhanced
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Avatar user */}
      {isUser && <div className="ml-2 flex-shrink-0 flex items-end">{avatar}</div>}
    </div>
  );
};

export default Message; 