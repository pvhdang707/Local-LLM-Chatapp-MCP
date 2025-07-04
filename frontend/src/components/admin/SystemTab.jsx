import React from 'react';
import { formatDate } from './AdminUtils';

const SystemTab = ({ 
  systemHealth, 
  serverStatus, 
  onRefreshData,
  onRestartSystem 
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quản lý hệ thống</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Sức khỏe hệ thống</h3>
          {systemHealth ? (
            <div>
              <div className="mb-4">
                <span className={`text-lg font-semibold ${
                  systemHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemHealth.status === 'healthy' ? '🟢 Khỏe mạnh' : '🔴 Có vấn đề'}
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(systemHealth.components || {}).map(([component, status]) => (
                  <div key={component} className="flex justify-between items-center">
                    <span className="capitalize">{component}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Cập nhật: {formatDate(systemHealth.timestamp)}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Không có dữ liệu</div>
          )}
        </div>

        {/* Server Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Trạng thái server</h3>
          {serverStatus ? (
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500">Trạng thái</div>
                <div className="text-lg font-semibold text-green-600">{serverStatus.status}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Phiên bản</div>
                <div className="text-lg font-semibold">{serverStatus.version}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Thời gian</div>
                <div className="text-sm">{formatDate(serverStatus.timestamp)}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Không có dữ liệu</div>
          )}
        </div>
      </div>

      {/* System Actions */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Hành động hệ thống</h3>
        <div className="flex space-x-4">
          <button
            onClick={onRefreshData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Làm mới dữ liệu
          </button>
          <button
            onClick={onRestartSystem}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Khởi động lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemTab; 