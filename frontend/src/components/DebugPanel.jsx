import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChatSession } from '../contexts/ChatSessionContext';

const DebugPanel = ({ isVisible }) => {
  const { user, isAuthenticated } = useAuth();
  const { sessions, selectedSessionId, messages, isLoading, error, isComposingNew } = useChatSession();
  const [expanded, setExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">🔧 Debug Panel</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
        >
          {expanded ? 'Thu gọn' : 'Mở rộng'}
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
            <span className="text-blue-600">{user.username} ({user.role})</span>
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
        
        {error && (
          <div className="flex justify-between">
            <span>Error:</span>
            <span className="text-red-600">{error.type}</span>
          </div>
        )}
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs">
            <div className="font-semibold mb-1">Sessions:</div>
            {sessions?.map(session => (
              <div key={session.id} className="ml-2 text-gray-600">
                • {session.title || session.id.slice(-8)} 
                {selectedSessionId === session.id && ' (selected)'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 