import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { searchFiles, classifyFile, getFileMetadata } from '../services/fileApi';
import Notification from './Notification';

// SVG ICONS
const ICONS = {
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  file: (
    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M4 4a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      <path d="M14 2v6h6" />
    </svg>
  ),
  doc: (
    <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </svg>
  ),
  image: (
    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10.5" r="1.5" />
      <path d="M21 19l-5.5-5.5a2 2 0 00-2.8 0L3 19" />
    </svg>
  ),
  chart: (
    <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M3 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  classification: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 11h.01m-.01 4h.01m8-8h.01m.01 4h.01m-.01 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  department: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  cloud: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  spinner: (
    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
};

const FileSearchResults = ({ onAction }) => {
  const { user, userDepartment, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name' hoặc 'content'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classifyingFile, setClassifyingFile] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });
  const [showDepartment, setShowDepartment] = useState(true);
  const [showClassification, setShowClassification] = useState(true);
  const [showCloudMetadata, setShowCloudMetadata] = useState(true);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get file icon
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (["png","jpg","jpeg","gif"].includes(ext)) return ICONS.image;
    if (["pdf","txt"].includes(ext)) return ICONS.file;
    if (["doc","docx"].includes(ext)) return ICONS.doc;
    if (["xls","xlsx","ppt","pptx"].includes(ext)) return ICONS.chart;
    return ICONS.file;
  };

  // Get group color
  const getGroupColor = (groupId) => {
    const colorMap = {
      'A': 'bg-red-100 text-red-800 border-red-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'C': 'bg-green-100 text-green-800 border-green-200',
      'D': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'E': 'bg-purple-100 text-purple-800 border-purple-200',
      'F': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[groupId] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await searchFiles(searchTerm, searchType);
      setResults(searchResults);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle classify file
  const handleClassifyFile = async (fileId) => {
    try {
      setClassifyingFile(fileId);
      await classifyFile(fileId);
      // Reload search results để cập nhật thông tin phân loại
      if (searchTerm) {
        const searchResults = await searchFiles(searchTerm, searchType);
        setResults(searchResults);
      }
      setNotification({ open: true, message: 'Phân loại file thành công!', type: 'success' });
      if (onAction) onAction('Phân loại file thành công!', 'success');
    } catch (error) {
      setNotification({ open: true, message: 'Lỗi khi phân loại file: ' + error.message, type: 'error' });
      if (onAction) onAction('Lỗi khi phân loại file: ' + error.message, 'error');
    } finally {
      setClassifyingFile(null);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setError(null);
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Kiểm tra authentication
  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
        <p className="text-gray-600 mb-4">
          Bạn cần đăng nhập để có thể tìm kiếm files. Vui lòng đăng nhập và thử lại.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-800">
            💡 <strong>Lưu ý:</strong> Chỉ người dùng đã đăng nhập mới có thể tìm kiếm files.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Department Info Banner */}
      {userDepartment && !isAdmin && (
        <div className="bg-blue-50 border-b border-blue-200 p-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">📋</span>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Phòng ban của bạn: <span className="font-bold">{userDepartment}</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Kết quả tìm kiếm chỉ hiển thị file trong phòng ban này
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Info Banner */}
      {isAdmin && (
        <div className="bg-purple-50 border-b border-purple-200 p-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-purple-600">👑</span>
            <div>
              <p className="text-sm font-medium text-purple-900">
                Quyền Admin
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Kết quả tìm kiếm hiển thị tất cả file trong hệ thống
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {ICONS.search}
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {ICONS.close}
              </button>
            )}
          </div>

          {/* Search Type */}
          <div className="flex-shrink-0">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="name">Tên file</option>
              <option value="content">Nội dung</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>

          {/* Display Options */}
          <div className="flex-shrink-0 flex space-x-2">
            <button
              onClick={() => setShowDepartment(!showDepartment)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                showDepartment 
                  ? 'bg-blue-100 text-blue-700 border-blue-300' 
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}
              title="Hiển thị department"
            >
              {ICONS.department}
            </button>
            <button
              onClick={() => setShowClassification(!showClassification)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                showClassification 
                  ? 'bg-green-100 text-green-700 border-green-300' 
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}
              title="Hiển thị phân loại"
            >
              {ICONS.classification}
            </button>
            <button
              onClick={() => setShowCloudMetadata(!showCloudMetadata)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                showCloudMetadata 
                  ? 'bg-purple-100 text-purple-700 border-purple-300' 
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}
              title="Hiển thị cloud metadata"
            >
              {ICONS.cloud}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tìm kiếm...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <div className="text-red-800 mb-2">Lỗi: {error}</div>
            <button 
              onClick={() => setError(null)}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Đóng
            </button>
          </div>
        ) : results.length === 0 && searchTerm ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg font-medium mb-1">Không tìm thấy kết quả</p>
            <p className="text-sm">Thử tìm kiếm với từ khóa khác</p>
            {userDepartment && !isAdmin && (
              <p className="text-xs text-gray-400 mt-2">
                Chỉ tìm kiếm trong phòng ban: {userDepartment}
              </p>
            )}
          </div>
        ) : results.length > 0 ? (
          <div className="h-full overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {results.map(file => (
              <div key={file.id} className="rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200 bg-white">
                <div className="flex items-start space-x-3">
                  {/* File Icon */}
                  <div className="flex-shrink-0 text-2xl mt-1">
                    {getFileIcon(file.original_name)}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    {/* File name with tooltip for long names */}
                    <div className="group relative">
                      <h3 className="font-medium text-gray-900 truncate pr-2 text-sm sm:text-base">
                        {file.original_name}
                      </h3>
                      {/* Tooltip for long file names */}
                      {file.original_name.length > 50 && (
                        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs break-words hidden sm:block">
                          {file.original_name}
                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* File metadata */}
                    <div className="mt-1 flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex-shrink-0">{formatFileSize(file.file_size)}</span>
                      <span className="flex-shrink-0 hidden sm:inline">•</span>
                      <span className="flex-shrink-0 hidden sm:inline">{formatDate(file.uploaded_at)}</span>
                      <span className="flex-shrink-0 sm:hidden">{formatDate(file.uploaded_at).split(' ')[0]}</span>
                    </div>

                    {/* Search match info */}
                    {file.search_match && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <p className="font-medium text-yellow-800 mb-1">Kết quả tìm kiếm:</p>
                        <p className="text-yellow-700">{file.search_match}</p>
                      </div>
                    )}

                    {/* Department Info */}
                    {showDepartment && file.department && (
                      <div className="mt-2 flex items-center space-x-1">
                        {ICONS.department}
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {file.department}
                        </span>
                      </div>
                    )}

                    {/* Classification Info */}
                    {showClassification && file.classification && (
                      <div className="mt-2 flex items-center space-x-2">
                        {ICONS.classification}
                        <span className={`text-xs px-2 py-1 rounded-full border ${getGroupColor(file.classification.group_id)}`}>
                          {file.classification.group_name}
                          {file.classification.confidence && (
                            <span className="ml-1 text-xs opacity-75">
                              ({Math.round(file.classification.confidence * 100)}%)
                            </span>
                          )}
                        </span>
                        {file.classification.keywords && file.classification.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {file.classification.keywords.slice(0, 3).map((keyword, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cloud Metadata */}
                    {showCloudMetadata && file.cloud_metadata && (
                      <div className="mt-2 flex items-center space-x-1">
                        {ICONS.cloud}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          file.cloud_metadata.synced 
                            ? 'bg-green-50 text-green-600 border border-green-200' 
                            : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                        }`}>
                          {file.cloud_metadata.synced ? 'Đã đồng bộ' : 'Chưa đồng bộ'}
                          {file.cloud_metadata.last_sync && (
                            <span className="ml-1 opacity-75">
                              ({formatDate(file.cloud_metadata.last_sync).split(' ')[0]})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleClassifyFile(file.id)}
                      disabled={classifyingFile === file.id}
                      className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                      title="Phân loại file"
                    >
                      {classifyingFile === file.id ? ICONS.spinner : ICONS.classification}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg font-medium mb-1">Tìm kiếm file</p>
            <p className="text-sm">Nhập từ khóa để bắt đầu tìm kiếm</p>
            {userDepartment && !isAdmin && (
              <p className="text-xs text-gray-400 mt-2">
                Chỉ tìm kiếm trong phòng ban: {userDepartment}
              </p>
            )}
          </div>
        )}
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, open: false, message: '' })}
        duration={3000}
      />
    </div>
  );
};

export default FileSearchResults; 