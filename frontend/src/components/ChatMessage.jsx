const ChatMessage = ({ isUser, message }) => (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow 
        ${isUser 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}>
        {message}
      </div>
    </div>
  );
  export default ChatMessage;
  