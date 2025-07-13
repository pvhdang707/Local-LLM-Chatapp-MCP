import React, { useState, useRef, useEffect } from 'react';
import { useEnhancedChat } from '../contexts/EnhancedChatContext';
import EnhancedChatToggle from './EnhancedChatToggle';

const ChatInput = ({ 
  placeholder = "Nhập tin nhắn của bạn...",
  disabled = false,
  onSend,
  className = "",
  isLoading = false,
  showToggle = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  
  const { chatMode, isEnhancedProcessing } = useEnhancedChat();

  // Auto focus khi component mount
  useEffect(() => {
    if (inputRef.current && !disabled && !isLoading) {
      inputRef.current.focus();
    }
  }, [disabled, isLoading]);

  // Auto resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputValue]);

  // Handle typing state
  useEffect(() => {
    if (inputValue.trim()) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [inputValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = inputValue.trim();
    if (!message || disabled || isLoading || isEnhancedProcessing) return;
    setInputValue('');
    if (onSend) await onSend(message, chatMode);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`chat-input-container ${className}`}>
      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
        <div className="flex  gap-3">
          {/* Toggle bên trái */}
          {showToggle && (
            <div className="flex-shrink-0 items-center justify-center">
              <EnhancedChatToggle />
            </div>
          )}
          <div className="relative flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isLoading || isEnhancedProcessing 
                  ? "AI đang suy nghĩ..." 
                  : chatMode === 'enhanced'
                    ? "Nhập tin nhắn để tìm kiếm và phân tích file..."
                    : placeholder
              }
              disabled={disabled || isLoading || isEnhancedProcessing}
              rows={1}
              className={`
                w-full px-6 py-4 pr-16 text-base leading-relaxed
                border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-all duration-200 resize-none overflow-hidden
                ${disabled || isLoading
                  ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                  : 'bg-transparent text-gray-900 placeholder-gray-500'}
                ${isTyping && !isLoading ? 'ring-2 ring-blue-200' : ''}
              `}
              style={{
                minHeight: '56px',
                maxHeight: '150px'
              }}
            />
            {/* Send Button */}
            <button
              type="submit"
              disabled={disabled || !inputValue.trim() || isLoading || isEnhancedProcessing}
              className={`
                absolute right-3 top-1/2 transform -translate-y-1/2 p-2.5 rounded-xl transition-all duration-200
                ${disabled || !inputValue.trim() || isLoading || isEnhancedProcessing
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:scale-105'}
              `}
            >
              {(isLoading || isEnhancedProcessing) ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Status Bar */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 px-2">
          <div className="flex items-center space-x-4">
            {disabled && !isLoading && (
              <span className="text-orange-500 flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Chọn hoặc bắt đầu cuộc trò chuyện để gửi tin nhắn</span>
              </span>
            )}
            {(isLoading || isEnhancedProcessing) && (
              <span className="text-blue-500 flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                <span>AI đang suy nghĩ...</span>
              </span>
            )}
            
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline">Enter để gửi, Shift+Enter để xuống dòng</span>
            {isTyping && !isLoading && (
              <span className="text-blue-500 flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Đang nhập...</span>
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
