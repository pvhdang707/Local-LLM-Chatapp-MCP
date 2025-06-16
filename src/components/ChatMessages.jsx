import ChatMessage from './ChatMessage';

const ChatMessages = ({ messages }) => (
  <div className="space-y-4">
    {messages.map((msg, index) => (
      <ChatMessage key={index} isUser={msg.isUser} message={msg.text} />
    ))}
  </div>
);
export default ChatMessages;
