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
  console.log('Is processed messages:', isProcessedMessages);

  let processedMessages;
  
  if (isProcessedMessages) {
    // Messages đã được xử lý trong ChatSessionContext - GIỮ NGUYÊN NỘI DUNG
    console.log('Messages already processed by ChatSessionContext, keeping original format');
    
    processedMessages = messages.map((msg, idx) => {
      console.log(`Keeping processed message ${idx}:`, msg);
      
      return {
        id: msg.id || idx,
        sender: msg.sender,
        text: msg.text, // GIỮ NGUYÊN text gốc, không thay thế
        timestamp: msg.timestamp,
        agentic: msg.agentic,
        enhanced: msg.enhanced,
        mode: msg.mode,
        isLoading: msg.isLoading || false,
        isFailed: msg.sender === 'bot' && (msg.text?.includes('❌') || msg.text?.includes('Xử lý thất bại') || msg.text?.includes('Thất bại')),
        isCompleted: msg.sender === 'bot' && (msg.text?.includes('✅') || msg.text?.includes('Đã hoàn thành') || msg.text?.includes('Hoàn thành')),
        error_message: msg.error_message || null
      };
    });
  } else {
    // Messages thô từ API - cần xử lý
    console.log('Raw messages from API detected, processing...');
    
    // Debug chi tiết từng message
    messages.forEach((msg, idx) => {
      console.log(`Raw Message ${idx}:`, {
        id: msg.id,
        message_type: msg.message_type,
        user_request: msg.user_request,
        text: msg.text,
        response: msg.response,
        status: msg.status,
        hasExecutionResults: !!msg.execution_results,
        allFields: Object.keys(msg)
      });
    });
    
    processedMessages = messages.map((msg, idx) => {
      const isUser = msg.message_type === 'user';
      
      console.log(`Processing raw message ${idx}:`, msg);
      
      // Xử lý nội dung tin nhắn
      let messageText = '';
      if (isUser) {
        // Tin nhắn từ user - kiểm tra tất cả các field có thể
        messageText = msg.user_request || 
                     msg.text || 
                     msg.content || 
                     msg.message || 
                     'Tin nhắn người dùng không có nội dung';
        
        console.log(`User message text: "${messageText}" from fields:`, {
          user_request: msg.user_request,
          text: msg.text,
          content: msg.content,
          message: msg.message
        });
      } else {
        // Tin nhắn từ assistant/bot
        if (msg.response && msg.response.trim() && msg.response !== 'null') {
          messageText = msg.response;
        } else if (msg.execution_results) {
          // Xử lý execution_results
          const execResults = msg.execution_results;
          
          // Bắt đầu với text gốc nếu có
          messageText = msg.text || '';
          
          // Thêm chain of thought nếu có
          if (execResults.chain_of_thought) {
            messageText += (messageText ? '\n\n' : '') + `🧠 **Quá trình suy nghĩ:**\n${execResults.chain_of_thought}`;
          }
          
          // Thêm summary nếu có
          if (execResults.summary) {
            const summary = execResults.summary;
            messageText += (messageText ? '\n\n' : '') + `📋 **Tóm tắt:**\n`;
            
            if (summary.total_steps_completed) {
              messageText += `• Số bước hoàn thành: ${summary.total_steps_completed}\n`;
            }
            if (summary.files_processed) {
              messageText += `• Số file đã xử lý: ${summary.files_processed}\n`;
            }
            
            // Thêm thông tin các action đã thực hiện
            if (summary.actions_performed && summary.actions_performed.length > 0) {
              messageText += `\n🔧 **Các hành động đã thực hiện:**\n`;
              summary.actions_performed.forEach((action) => {
                messageText += `  • ${action.description}: ${action.status === 'success' ? '✅ Thành công' : '❌ Thất bại'}\n`;
              });
            }
          }
          
          // Nếu không có nội dung nào, hiển thị trạng thái
          if (!messageText.trim()) {
            messageText = msg.status === 'completed' ? '✅ Đã hoàn thành' : 
                         msg.status === 'failed' ? '❌ Xử lý thất bại' :
                         'Đang xử lý...';
          }
        } else if (msg.summary) {
          messageText = msg.summary;
        } else if (msg.text) {
          messageText = msg.text;
        } else {
          // Fallback dựa trên status
          messageText = msg.status === 'completed' ? '✅ Đã hoàn thành' : 
                       msg.status === 'failed' ? '❌ Xử lý thất bại' :
                       'Tin nhắn không có nội dung';
        }
        
        console.log(`Bot message text: "${messageText}"`);
      }

      // Xử lý timestamp - ưu tiên completed_at cho tin nhắn bot
      const timestamp = isUser ? msg.created_at : (msg.completed_at || msg.created_at);

      // Xử lý trạng thái
      const isFailed = msg.status === 'failed' || messageText.includes('❌') || messageText.includes('Thất bại');
      const isCompleted = msg.status === 'completed' || messageText.includes('✅') || messageText.includes('Hoàn thành');

      const processed = {
        id: msg.id || idx,
        sender: isUser ? 'user' : 'bot',
        text: messageText,
        timestamp: timestamp,
        status: msg.status,
        isFailed: isFailed,
        isCompleted: isCompleted,
        // Dữ liệu agentic nếu có
        agentic: (msg.execution_results || msg.plan || msg.summary) ? {
          execution_results: msg.execution_results,
          plan: msg.plan,
          summary: msg.summary,
          user_request: msg.user_request,
          response: msg.response
        } : null,
        // Dữ liệu enhanced nếu có
        enhanced: msg.enhanced || null,
        // Thông tin lỗi nếu có
        error_message: msg.error_message,
        // Thông tin thời gian
        created_at: msg.created_at,
        completed_at: msg.completed_at,
        // Thông tin gốc để debug
        original: msg
      };
      
      console.log(`Processed message ${idx}:`, processed);
      return processed;
    });
  }

  console.log('Final processed messages:', processedMessages);
  console.log('Messages analysis:', {
    totalMessages: messages.length,
    isProcessedMessages,
    firstMessage: messages[0],
    processedCount: processedMessages.length,
    messageTypes: processedMessages.map(m => ({ 
      id: m.id, 
      sender: m.sender,
      hasText: !!m.text,
      textLength: m.text?.length || 0,
      textPreview: m.text?.substring(0, 50) + (m.text?.length > 50 ? '...' : ''),
      status: m.status
    }))
  });

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
              enhanced: msg.enhanced,
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