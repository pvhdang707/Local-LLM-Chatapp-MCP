import React from 'react';
import { formatDate } from './AdminUtils';

const DashboardTab = ({ systemStats, systemHealth, serverStatus, fileGroups }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <div className="text-blue-500 text-4xl font-bold">{systemStats?.totalUsers || 0}</div>
          <div className="text-gray-700 mt-2">Tổng số người dùng</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <div className="text-green-500 text-4xl font-bold">{systemStats?.totalFiles || 0}</div>
          <div className="text-gray-700 mt-2">Tổng số file</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg shadow">
          <div className="text-purple-500 text-4xl font-bold">{fileGroups.length}</div>
          <div className="text-gray-700 mt-2">Nhóm file</div>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg shadow">
          <div className="text-orange-500 text-4xl font-bold">
            {systemHealth?.status === 'healthy' ? '🟢' : '🔴'}
          </div>
          <div className="text-gray-700 mt-2">Trạng thái hệ thống</div>
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Sức khỏe hệ thống</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemHealth.components || {}).map(([component, status]) => (
              <div key={component} className="text-center">
                <div className={`text-2xl ${status === 'ok' ? 'text-green-500' : 'text-red-500'}`}>
                  {status === 'ok' ? '🟢' : '🔴'}
                </div>
                <div className="text-sm font-medium capitalize">{component}</div>
                <div className="text-xs text-gray-500">{status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Server Status */}
      {serverStatus && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Thông tin server</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Trạng thái</div>
              <div className="text-lg font-semibold">{serverStatus.status}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Phiên bản</div>
              <div className="text-lg font-semibold">{serverStatus.version}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Cập nhật lần cuối</div>
              <div className="text-lg font-semibold">{formatDate(serverStatus.timestamp)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab; 