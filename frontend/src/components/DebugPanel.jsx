import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChatSession } from '../contexts/ChatSessionContext';

const DebugPanel = ({ isVisible, onToggle }) => {
  const { user, isAuthenticated } = useAuth();
  const { sessions, selectedSessionId, messages, isLoading, isComposingNew } = useChatSession();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Debug Info</h3>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>Auth:</span>
          <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {isAuthenticated ? '✅ Đã đăng nhập' : '❌ Chưa đăng nhập'}
          </span>
        </div>
        
        {user && (
          <div className="flex justify-between">
            <span>User:</span>
            <span className="text-blue-600">
              {user.username} ({user.role})
              {user.department && ` - ${user.department}`}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Token:</span>
          <span className={localStorage.getItem('token') ? 'text-green-600' : 'text-red-600'}>
            {localStorage.getItem('token') ? '✅ Có' : '❌ Không có'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Sessions:</span>
          <span className="text-blue-600">{sessions?.length || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Selected:</span>
          <span className="text-blue-600">
            {selectedSessionId ? selectedSessionId.slice(-8) : 'None'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Messages:</span>
          <span className="text-blue-600">{messages?.length || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Loading:</span>
          <span className={isLoading ? 'text-yellow-600' : 'text-green-600'}>
            {isLoading ? '⏳ Đang tải' : '✅ Sẵn sàng'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>New Chat:</span>
          <span className={isComposingNew ? 'text-green-600' : 'text-gray-600'}>
            {isComposingNew ? '✅ Đang tạo mới' : '❌ Không'}
          </span>
        </div>
        
        {/* Thêm thông tin department */}
        {user && user.department && (
          <div className="flex justify-between">
            <span>Department:</span>
            <span className="text-green-600">{user.department}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel; 