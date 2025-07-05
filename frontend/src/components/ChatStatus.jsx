import React from 'react';

const ChatStatus = ({ status, message, onRetry }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'success':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  if (!status || !message) return null;

  return (
    <div className={`p-3 rounded-lg border ${getStatusColor()} mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="text-sm font-medium">{message}</span>
        </div>
        {status === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="text-sm underline hover:no-underline"
          >
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatStatus; 