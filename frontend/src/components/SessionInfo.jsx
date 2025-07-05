import React from 'react';

const SessionInfo = ({ session, messageCount = 0 }) => {
  if (!session) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-800">
            {session.title || 'Cuộc trò chuyện'}
          </h3>
          <p className="text-sm text-blue-600">
            Tạo lúc: {formatDate(session.createdAt)}
          </p>
          <p className="text-sm text-blue-600">
            Cập nhật: {formatDate(session.updatedAt)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {messageCount}
          </div>
          <div className="text-xs text-blue-500">
            tin nhắn
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionInfo; 