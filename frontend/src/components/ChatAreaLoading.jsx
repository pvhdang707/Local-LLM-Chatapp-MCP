import React from 'react';

const ChatAreaLoading = ({ message = 'Đang tải cuộc trò chuyện...' }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-4">
      <div className="bg-white rounded-lg shadow-md flex flex-col flex-1 min-h-0 h-full">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAreaLoading; 