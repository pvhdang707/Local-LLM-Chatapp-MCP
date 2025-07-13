import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserFilesComplete, 
  deleteFile, 
  downloadFile, 
  getFileMetadata,
  getFileGroups,
  classifyFile,
  classifyFilesBatch,
  searchFiles
} from '../services/fileApi';
import Notification from './Notification';
import ConfirmModal from './ConfirmModal';

// SVG ICONS
const ICONS = {
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  folder: (
    <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 3h8a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
  ),
  file: (
    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 4a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /><path d="M14 2v6h6" /></svg>
  ),
  doc: (
    <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h4" /></svg>
  ),
  image: (
    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10.5" r="1.5" /><path d="M21 19l-5.5-5.5a2 2 0 00-2.8 0L3 19" /></svg>
  ),
  chart: (
    <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" /><rect x="13" y="13" width="8" height="8" rx="2" /></svg>
  ),
  download: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ),
  trash: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
  ),
  refresh: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
  ),
  spinner: (
    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
  ),
  department: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
  ),
  classification: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 11h.01m-.01 4h.01m8-8h.01m.01 4h.01m-.01 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  cloud: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
  )
};

const FileManager = ({ onAction }) => {
  const { user, userDepartment, isAdmin } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [groups, setGroups] = useState([]);
  const [deletingFile, setDeletingFile] = useState(null);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, fileId: null });
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });
  const [classifyingFile, setClassifyingFile] = useState(null);
  const [showDepartment, setShowDepartment] = useState(true);
  const [showClassification, setShowClassification] = useState(true);
  const [showCloudMetadata, setShowCloudMetadata] = useState(true);

  // Load files và groups
  useEffect(() => {
    loadFiles();
    loadGroups();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filesData = await getUserFilesComplete();
      setFiles(filesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = await getFileGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

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

  // Handle delete file
  const handleDeleteFile = (fileId) => {
    setConfirmDelete({ open: true, fileId });
  };

  const handleConfirmDelete = async () => {
    const fileId = confirmDelete.fileId;
    setConfirmDelete({ open: false, fileId: null });
    try {
      setDeletingFile(fileId);
      await deleteFile(fileId);
      setFiles(files.filter(file => file.id !== fileId));
      setNotification({ open: true, message: 'Xóa file thành công!', type: 'success' });
      if (onAction) onAction('Xóa file thành công!', 'success');
    } catch (error) {
      setNotification({ open: true, message: 'Lỗi khi xóa file: ' + error.message, type: 'error' });
      if (onAction) onAction('Lỗi khi xóa file: ' + error.message, 'error');
    } finally {
      setDeletingFile(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ open: false, fileId: null });
  };

  // Handle download file
  const handleDownloadFile = async (fileId, filename) => {
    try {
      setDownloadingFile(fileId);
      await downloadFile(fileId, filename);
      if (onAction) onAction('Tải xuống file thành công!', 'success');
    } catch (error) {
      if (onAction) onAction('Lỗi khi tải xuống file: ' + error.message, 'error');
    } finally {
      setDownloadingFile(null);
    }
  };

  // Handle classify file
  const handleClassifyFile = async (fileId) => {
    try {
      setClassifyingFile(fileId);
      await classifyFile(fileId);
      // Reload files để cập nhật thông tin phân loại
      await loadFiles();
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
  };

  // Filter files by group and search
  const filteredFiles = files.filter(file => {
    const matchesGroup = selectedGroup === 'all' || file.classification?.group_id === selectedGroup;
    const matchesSearch = searchTerm === '' || 
      file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.classification?.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 mb-2">Lỗi: {error}</div>
        <button 
          onClick={loadFiles}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Kiểm tra authentication - nếu chưa đăng nhập thì hiển thị thông báo
  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
        <p className="text-gray-600 mb-4">
          Bạn cần đăng nhập để có thể quản lý files. Vui lòng đăng nhập và thử lại.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-800">
            💡 <strong>Lưu ý:</strong> Chỉ người dùng đã đăng nhập mới có thể upload và quản lý files.
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📋</span>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Phòng ban của bạn: <span className="font-bold">{userDepartment}</span>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Bạn có thể xem file của bạn và file trong phòng ban này
                </p>
              </div>
            </div>
            {/* File statistics */}
            {files.length > 0 && (
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-blue-600 font-medium">Tổng: {files.length}</span>
                {files.some(f => f.source === 'user') && (
                  <span className="text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    Của bạn: {files.filter(f => f.source === 'user').length}
                  </span>
                )}
                {files.some(f => f.source === 'department' || f.source === 'both') && (
                  <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Phòng ban: {files.filter(f => f.source === 'department' || f.source === 'both').length}
                  </span>
                )}
              </div>
            )}
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
                Bạn có thể xem và quản lý tất cả file trong hệ thống
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter - Fixed at top */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {ICONS.search}
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Group Filter */}
          <div className="flex-shrink-0">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Tất cả nhóm</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-hidden">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {ICONS.folder}
            <p className="text-lg font-medium mb-1">
              {selectedGroup === 'all' ? 'Chưa có file nào' : 'Không có file trong nhóm này'}
            </p>
            <p className="text-sm">
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy upload file đầu tiên của bạn!'}
            </p>
            {userDepartment && !isAdmin && (
              <p className="text-xs text-gray-400 mt-2">
                Chỉ hiển thị file trong phòng ban: {userDepartment}
              </p>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {filteredFiles.map(file => (
              <div key={file.id} className="rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200 bg-white">
                <div className="flex items-start space-x-3">
                  {/* File Icon */}
                  <div className="flex-shrink-0 text-2xl mt-1">
                    {getFileIcon(file.original_name)}
                  </div>
                  
                  {/* File Info - Flexible width */}
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

                    {/* Department Info */}
                    {showDepartment && file.department && (
                      <div className="mt-2 flex items-center space-x-1">
                        {ICONS.department}
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {file.department}
                        </span>
                        {/* Source indicator */}
                        {file.source && (
                          <span className={`text-xs px-2 py-1 rounded-full ml-1 ${
                            file.source === 'user' 
                              ? 'bg-purple-50 text-purple-600 border border-purple-200'
                              : file.source === 'department'
                              ? 'bg-green-50 text-green-600 border border-green-200'
                              : 'bg-blue-50 text-blue-600 border border-blue-200'
                          }`}>
                            {file.source === 'user' ? 'Của bạn' : 
                             file.source === 'department' ? 'Phòng ban' : 'Cả hai'}
                          </span>
                        )}
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
                      onClick={() => handleDownloadFile(file.id, file.original_name)}
                      disabled={downloadingFile === file.id}
                      className="p-1.5 sm:p-2 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                      title="Tải xuống file"
                    >
                      {downloadingFile === file.id ? ICONS.spinner : ICONS.download}
                    </button>
                    
                    
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={deletingFile === file.id}
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                      title="Xóa file"
                    >
                      {deletingFile === file.id ? ICONS.spinner : ICONS.trash}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button - Fixed at bottom */}
      <div className="text-center pt-4 flex justify-center flex-shrink-0">
        <button
          onClick={loadFiles}
          className="bg-blue-500 px-4 py-2 text-white text-sm border border-gray-200 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          {ICONS.refresh}
          <span className='text-sm font-medium text-white'>Làm mới</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmDelete.open}
        title="Xác nhận xóa file"
        message="Bạn có chắc chắn muốn xóa file này?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, open: false, message: '' })}
        duration={3000}
      />
    </div>
  );
};

export default FileManager; 