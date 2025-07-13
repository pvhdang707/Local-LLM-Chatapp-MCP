import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import ChatLoadingMessage from './ChatLoadingMessage';
import MessageLoading from './MessageLoading';
import { useEnhancedChat } from '../contexts/EnhancedChatContext';

const ChatHistory = ({ messages, isLoading, onDownload, loadingSessionId, selectedSessionId }) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { isEnhancedProcessing, chatMode } = useEnhancedChat();

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

  // Debug log để kiểm tra dữ liệu
  console.log('Raw messages from API:', messages);

  // Kiểm tra nếu messages đã được xử lý từ ChatSessionContext
  const isProcessedMessages = messages.length > 0 && messages[0].sender !== undefined;

  let processedMessages;
  
  if (isProcessedMessages) {
    // Messages đã được xử lý trong ChatSessionContext, chỉ cần format lại
    processedMessages = messages.map((msg, idx) => ({
      id: msg.id || idx,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
      agentic: msg.agentic,
      isFailed: msg.sender === 'bot' && (msg.text.includes('❌') || msg.text.includes('Xử lý thất bại')),
      isCompleted: msg.sender === 'bot' && (msg.text.includes('✅') || msg.text.includes('Đã hoàn thành')),
      error_message: null
    }));
  } 
  // else {
  //   // Messages chưa được xử lý, xử lý như logic cũ
  //   processedMessages = messages.map((msg, idx) => {
  //     const isUser = msg.message_type === 'user';
      
  //     // Xử lý nội dung tin nhắn
  //     let messageText = '';
  //     if (isUser) {
  //       messageText = msg.user_request || '';
  //     } else {
  //       // Tin nhắn từ assistant - ưu tiên theo thứ tự:
  //       // 1. response (nếu có và không null)
  //       // 2. execution_results summary hoặc chain_of_thought
  //       // 3. fallback message
        
  //       if (msg.response && msg.response.trim() && msg.response !== 'null') {
  //         messageText = msg.response;
  //       } else if (msg.execution_results?.summary) {
  //         // Tạo summary từ execution_results
  //         const summary = msg.execution_results.summary;
  //         const steps = summary.total_steps_completed || 0;
  //         const filesProcessed = summary.files_processed || 0;
          
  //         messageText = msg.text
          
  //         // Thêm thông tin chi tiết các action
  //         if (summary.actions_performed && summary.actions_performed.length > 0) {
  //           messageText += '\n\n🔧 **Các hành động đã thực hiện:**\n';
  //           summary.actions_performed.forEach((action, index) => {
  //             messageText += `  • ${action.description}: ${action.status === 'success' ? '✅ Thành công' : '❌ Thất bại'}\n`;
  //           });
  //         }
          
  //         // Thêm chain of thought nếu có
  //         if (msg.execution_results.chain_of_thought) {
  //           messageText += `\n\n🧠 **Quá trình suy nghĩ:**\n${msg.execution_results.chain_of_thought}`;
  //         }
  //       } else if (msg.execution_results?.chain_of_thought) {
  //         messageText = `🧠 **Quá trình xử lý:**\n${msg.execution_results.chain_of_thought}`;
  //       } else if (msg.summary) {
  //         messageText = msg.summary;
  //       } else if (msg.status === 'failed') {
  //         messageText = msg.text
  //       } else if (msg.status === 'completed') {
  //         messageText = msg.text
  //       } else {
  //         messageText = msg.text 
  //       }
  //     }

  //     // Xử lý timestamp - ưu tiên completed_at cho tin nhắn bot
  //     const timestamp = isUser ? msg.created_at : (msg.completed_at || msg.created_at);

  //     // Xử lý trạng thái
  //     const isFailed = msg.status === 'failed';
  //     const isCompleted = msg.status === 'completed';

  //     return {
  //       id: msg.id || idx,
  //       sender: isUser ? 'user' : 'bot',
  //       text: messageText,
  //       timestamp: timestamp,
  //       status: msg.status,
  //       isFailed: isFailed,
  //       isCompleted: isCompleted,
  //       // Dữ liệu agentic nếu có
  //       agentic: (msg.execution_results || msg.plan || msg.summary) ? {
  //         execution_results: msg.execution_results,
  //         plan: msg.plan,
  //         summary: msg.summary,
  //         user_request: msg.user_request,
  //         response: msg.response
  //       } : null,
  //       // Thông tin lỗi nếu có
  //       error_message: msg.error_message,
  //       // Thông tin thời gian
  //       created_at: msg.created_at,
  //       completed_at: msg.completed_at
  //     };
  //   });
  // }

  console.log('Processed messages:', processedMessages);

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-2 max-h-[calc(100vh-220px)]"
        style={{ height: '100%' }}
      >
        {processedMessages.map((msg, idx) => (
          <Message 
            key={msg.id || idx} 
            message={{
              ...msg,
              sender: msg.sender,
              text: msg.text,
              timestamp: msg.timestamp,
              agentic: msg.agentic,
              isFailed: msg.isFailed,
              isCompleted: msg.isCompleted,
              error_message: msg.error_message
            }}
            onDownload={onDownload} 
            className={`
              font-sans
              ${msg.sender === 'user' ? 'text-base font-medium text-blue-900' : 'text-base font-semibold text-gray-900'}
              leading-relaxed
            `}
          />
        ))}
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