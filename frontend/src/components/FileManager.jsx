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
  cloud: (
    <svg className="w-5 h-5 inline text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16a4 4 0 10-8 0H5a5 5 0 0110 0h2a3 3 0 100-6 5.978 5.978 0 00-1.528-3.528A5.978 5.978 0 0012 4a6 6 0 00-6 6c0 .34.03.674.09 1H5a3 3 0 100 6h2z" /></svg>
  ),
  download: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
  ),
  trash: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
  ),
  spinner: (
    <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" /><path className="opacity-75" d="M4 12a8 8 0 018-8v8z" /></svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.974 7.974 0 014 12c0 4.418 3.582 8 8 8a7.974 7.974 0 006.418-3M18.418 15A7.974 7.974 0 0020 12c0-4.418-3.582-8-8-8a7.974 7.974 0 00-6.418 3" /></svg>
  )
};

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
            className="w-full px-3 py-2 pl-10 pr-10  border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {ICONS.search}
          </div>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Xóa tìm kiếm"
            >
              {ICONS.close}
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
          {ICONS.folder}
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
            <div key={file.id} className=" rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
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
                      <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        {ICONS.cloud} <span>Đã đồng bộ với cloud</span>
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
                    {downloadingFile === file.id ? ICONS.spinner : ICONS.download}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deletingFile === file.id}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
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

      {/* Refresh Button */}
      <div className="text-center pt-4 flex justify-center  ">
        <button
          onClick={loadFiles}
          className="bg-blue-500 px-4 py-2 text-white text-sm border border-gray-200 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          {ICONS.refresh}
          <span className='text-sm font-medium text-white' >Làm mới</span>
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