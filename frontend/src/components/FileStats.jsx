import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFilesComplete, getFileGroups } from '../services/fileApi';

// SVG ICONS
const ICONS = {
  stats: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  department: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  classification: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 11h.01m-.01 4h.01m8-8h.01m.01 4h.01m-.01 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  cloud: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  file: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 4a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      <path d="M14 2v6h6" />
    </svg>
  ),
  spinner: (
    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
};

const FileStats = () => {
  const { user, userDepartment, isAdmin } = useAuth();
  const [files, setFiles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    byDepartment: {},
    byClassification: {},
    byFileType: {},
    cloudSyncStatus: { synced: 0, notSynced: 0 },
    recentUploads: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filesData, groupsData] = await Promise.all([
        getUserFilesComplete(),
        getFileGroups()
      ]);
      
      setFiles(filesData);
      setGroups(groupsData);
      calculateStats(filesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (filesData) => {
    const stats = {
      totalFiles: filesData.length,
      totalSize: 0,
      byDepartment: {},
      byClassification: {},
      byFileType: {},
      cloudSyncStatus: { synced: 0, notSynced: 0 },
      recentUploads: 0
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    filesData.forEach(file => {
      // Total size
      stats.totalSize += file.file_size || 0;

      // By department
      const dept = file.department || 'Không có department';
      stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;

      // By classification
      if (file.classification?.group_name) {
        const groupName = file.classification.group_name;
        stats.byClassification[groupName] = (stats.byClassification[groupName] || 0) + 1;
      }

      // By file type
      const ext = file.original_name.split('.').pop()?.toLowerCase() || 'unknown';
      stats.byFileType[ext] = (stats.byFileType[ext] || 0) + 1;

      // Cloud sync status
      if (file.cloud_metadata?.synced) {
        stats.cloudSyncStatus.synced++;
      } else {
        stats.cloudSyncStatus.notSynced++;
      }

      // Recent uploads (last 7 days)
      const uploadDate = new Date(file.uploaded_at);
      if (uploadDate > oneWeekAgo) {
        stats.recentUploads++;
      }
    });

    setStats(stats);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type color
  const getFileTypeColor = (ext) => {
    const colorMap = {
      'pdf': 'bg-red-100 text-red-800',
      'doc': 'bg-blue-100 text-blue-800',
      'docx': 'bg-blue-100 text-blue-800',
      'xls': 'bg-green-100 text-green-800',
      'xlsx': 'bg-green-100 text-green-800',
      'ppt': 'bg-yellow-100 text-yellow-800',
      'pptx': 'bg-yellow-100 text-yellow-800',
      'txt': 'bg-gray-100 text-gray-800',
      'png': 'bg-purple-100 text-purple-800',
      'jpg': 'bg-purple-100 text-purple-800',
      'jpeg': 'bg-purple-100 text-purple-800',
      'gif': 'bg-purple-100 text-purple-800'
    };
    return colorMap[ext] || 'bg-gray-100 text-gray-800';
  };

  // Get department color
  const getDepartmentColor = (dept) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    const index = dept.length % colors.length;
    return colors[index];
  };

  // Kiểm tra authentication
  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
        <p className="text-gray-600 mb-4">
          Bạn cần đăng nhập để có thể xem thống kê files. Vui lòng đăng nhập và thử lại.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-800">
            💡 <strong>Lưu ý:</strong> Chỉ người dùng đã đăng nhập mới có thể xem thống kê files.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        {ICONS.spinner}
        <span className="ml-3 text-gray-600">Đang tải thống kê...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 mb-2">Lỗi: {error}</div>
        <button 
          onClick={loadData}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Info Banner */}
      {userDepartment && !isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">📋</span>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Phòng ban của bạn: <span className="font-bold">{userDepartment}</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Thống kê chỉ hiển thị file trong phòng ban này
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Info Banner */}
      {isAdmin && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-purple-600">👑</span>
            <div>
              <p className="text-sm font-medium text-purple-900">
                Quyền Admin
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Thống kê hiển thị tất cả file trong hệ thống
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              {ICONS.file}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng số file</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              {ICONS.stats}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng dung lượng</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              {ICONS.cloud}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đã đồng bộ cloud</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cloudSyncStatus.synced}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              {ICONS.stats}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Upload tuần này</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentUploads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Department */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            {ICONS.department}
            <h3 className="ml-2 text-lg font-medium text-gray-900">Theo phòng ban</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.byDepartment)
              .sort(([,a], [,b]) => b - a)
              .map(([dept, count]) => (
                <div key={dept} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDepartmentColor(dept)}`}>
                      {dept}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* By Classification */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            {ICONS.classification}
            <h3 className="ml-2 text-lg font-medium text-gray-900">Theo phân loại</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.byClassification)
              .sort(([,a], [,b]) => b - a)
              .map(([group, count]) => (
                <div key={group} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {group}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            {Object.keys(stats.byClassification).length === 0 && (
              <p className="text-sm text-gray-500">Chưa có file được phân loại</p>
            )}
          </div>
        </div>

        {/* By File Type */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            {ICONS.file}
            <h3 className="ml-2 text-lg font-medium text-gray-900">Theo loại file</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.byFileType)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([ext, count]) => (
                <div key={ext} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getFileTypeColor(ext)}`}>
                      .{ext}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Cloud Sync Status */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            {ICONS.cloud}
            <h3 className="ml-2 text-lg font-medium text-gray-900">Trạng thái đồng bộ</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Đã đồng bộ
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.cloudSyncStatus.synced}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Chưa đồng bộ
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.cloudSyncStatus.notSynced}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={loadData}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
        >
          {ICONS.stats}
          <span className="ml-2">Làm mới thống kê</span>
        </button>
      </div>
    </div>
  );
};

export default FileStats; 