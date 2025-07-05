import React from 'react';

const SessionLoading = () => {
  return (
    <div className="w-72 bg-white rounded-lg shadow-md p-4 mr-4 flex flex-col h-[calc(100vh-96px)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Danh sách chat</h3>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Đang tải danh sách chat...</p>
        </div>
      </div>
    </div>
  );
};

export default SessionLoading; 