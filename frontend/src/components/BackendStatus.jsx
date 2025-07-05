import React, { useState, useEffect } from 'react';
import { checkBackendStatus } from '../services/chatApi';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  const checkStatus = async () => {
    setStatus('checking');
    try {
      const isOk = await checkBackendStatus();
      setStatus(isOk ? 'online' : 'offline');
      setLastCheck(new Date());
    } catch (error) {
      setStatus('offline');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkStatus();
    // Kiểm tra mỗi 30 giây
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'offline':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'checking':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'offline':
        return '🔴';
      case 'checking':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Backend Online';
      case 'offline':
        return 'Backend Offline';
      case 'checking':
        return 'Đang kiểm tra...';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor()}`}>
      <div className="flex items-center space-x-1">
        <span>{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
        <button
          onClick={checkStatus}
          className="ml-1 hover:opacity-70"
          title="Kiểm tra lại"
        >
          🔄
        </button>
      </div>
    </div>
  );
};

export default BackendStatus; 