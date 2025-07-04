import React, { useState, useEffect } from 'react';
import { 
  getUserFilesEnhanced, 
  deleteFile, 
  downloadFile, 
  getFileMetadata,
  getFileGroups 
} from '../services/fileApi';
import Notification from './Notification';
import ConfirmModal from './ConfirmModal';

const FileManager = ({ onAction }) => {
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

  // Load files và groups
  useEffect(() => {
    loadFiles();
    loadGroups();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filesData = await getUserFilesEnhanced();
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
    const iconMap = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'ppt': '📈',
      'pptx': '📈',
      'txt': '📄',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️'
    };
    return iconMap[ext] || '📁';
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
  const handleDownloadFile = async (fileId) => {
    try {
      setDownloadingFile(fileId);
      await downloadFile(fileId);
      if (onAction) onAction('Tải xuống file thành công!', 'success');
    } catch (error) {
      if (onAction) onAction('Lỗi khi tải xuống file: ' + error.message, 'error');
    } finally {
      setDownloadingFile(null);
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
      file.classification?.group_name?.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 pr-10 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Group Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedGroup === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tất cả ({files.length})
          </button>
          {groups.map(group => (
            <button
              key={group.group_id}
              onClick={() => setSelectedGroup(group.group_id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedGroup === group.group_id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {group.name} ({files.filter(f => f.classification?.group_id === group.group_id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-lg font-medium mb-1">
            {selectedGroup === 'all' ? 'Chưa có file nào' : 'Không có file trong nhóm này'}
          </p>
          <p className="text-sm">
            {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy upload file đầu tiên của bạn!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFiles.map(file => (
            <div key={file.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between">
                {/* File Info */}
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{getFileIcon(file.original_name)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {file.original_name}
                    </h3>
                    
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.uploaded_at)}</span>
                    </div>

                    {/* Classification */}
                    {file.classification && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getGroupColor(file.classification.group_id)}`}>
                          Nhóm {file.classification.group_id}: {file.classification.group_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({Math.round(file.classification.confidence * 100)}%)
                        </span>
                      </div>
                    )}

                    {/* Cloud Status */}
                    {file.cloud_metadata && file.cloud_metadata.success && (
                      <div className="mt-1 text-xs text-green-600">
                        ☁️ Đã đồng bộ với cloud
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDownloadFile(file.id)}
                    disabled={downloadingFile === file.id}
                    className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                    title="Tải xuống file"
                  >
                    {downloadingFile === file.id ? '⏳' : '⬇️'}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deletingFile === file.id}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                    title="Xóa file"
                  >
                    {deletingFile === file.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center pt-4">
        <button
          onClick={loadFiles}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          🔄 Làm mới
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