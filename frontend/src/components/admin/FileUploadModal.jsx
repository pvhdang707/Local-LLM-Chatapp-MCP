import React, { useState, useRef } from 'react';

const FileUploadModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  users, 
  uploadFile, 
  setUploadFile, 
  uploadPermissions, 
  setUploadPermissions,
  selectedFiles,
  setSelectedFiles
}) => {
  const [uploadMode, setUploadMode] = useState('multiple'); // 'single' hoặc 'multiple'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadMode === 'single') {
    if (!uploadFile) {
      alert('Vui lòng chọn file để upload');
      return;
    }
    } else {
      if (selectedFiles.length === 0) {
        alert('Vui lòng chọn ít nhất một file để upload');
        return;
      }
    }

    // Bắt đầu upload với progress
    setIsUploading(true);
    setUploadProgress(0);
    setCurrentFileIndex(0);

    try {
      // Simulate progress cho từng file
      const totalFiles = uploadMode === 'single' ? 1 : selectedFiles.length;
      
      for (let i = 0; i < totalFiles; i++) {
        setCurrentFileIndex(i);
        setUploadProgress((i / totalFiles) * 100);
        
        // Simulate delay cho mỗi file
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setUploadProgress(100);
      
      // Gọi hàm submit thực tế
      await onSubmit(e);
      
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (uploadMode === 'single') {
      setUploadFile(files[0]);
    } else {
      // Thêm files mới vào danh sách hiện tại thay vì ghi đè
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset form khi đóng modal
  const handleClose = () => {
    if (isUploading) {
      return; // Không cho phép đóng khi đang upload
    }
    setUploadMode('single');
    setUploadFile(null);
    setSelectedFiles([]);
    setUploadPermissions([]);
    setIsUploading(false);
    setUploadProgress(0);
    setCurrentFileIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  const getFileTypeColor = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const colorMap = {
      'pdf': 'bg-red-100 text-red-800',
      'doc': 'bg-blue-100 text-blue-800',
      'docx': 'bg-blue-100 text-blue-800',
      'xls': 'bg-green-100 text-green-800',
      'xlsx': 'bg-green-100 text-green-800',
      'ppt': 'bg-orange-100 text-orange-800',
      'pptx': 'bg-orange-100 text-orange-800',
      'txt': 'bg-gray-100 text-gray-800',
      'png': 'bg-purple-100 text-purple-800',
      'jpg': 'bg-pink-100 text-pink-800',
      'jpeg': 'bg-pink-100 text-pink-800',
      'gif': 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[ext] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-5 mx-auto p-6 border w-11/12 max-w-4xl shadow-2xl rounded-xl bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Upload Files với Phân Quyền</h3>
              <p className="text-sm text-gray-600 mt-1">Quản lý và phân quyền truy cập files</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className={`rounded-full p-2 transition-colors ${
                isUploading 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Upload Progress Overlay */}
          {isUploading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang Upload Files...</h3>
                  <p className="text-gray-600 mb-4">
                    File {currentFileIndex + 1} / {uploadMode === 'single' ? 1 : selectedFiles.length}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% hoàn thành</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Selection Section - Ẩn khi có files đã chọn */}
            {selectedFiles.length === 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-3 text-white">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Chọn Files</h4>
                    <p className="text-sm text-gray-600">Kéo thả hoặc click để chọn files</p>
                  </div>
                </div>

                {/* Multiple Files Mode */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📤</div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        💡 Bạn có thể chọn nhiều file cùng lúc
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Các file sẽ được upload với cùng phân quyền đã chọn bên dưới.
                      </p>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        required
                      />
                      
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        📂 Chọn Files
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Files Review Section */}
            {selectedFiles.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 text-white">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Review Files</h4>
                    <p className="text-sm text-gray-600">Kiểm tra files trước khi upload</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">📋</span>
                      <span className="font-semibold text-gray-900">
                        Files đã chọn ({selectedFiles.length})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Nút thêm files */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
                      >
                        <span className="mr-1">➕</span> Thêm Files
                      </button>
                      <button
                        type="button"
                        onClick={clearAllFiles}
                        disabled={isUploading}
                        className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <span className="mr-1">🗑️</span> Xóa tất cả
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{getFileIcon(file.name)}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-600">{formatFileSize(file.size)}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(file.name)}`}>
                                {file.name.split('.').pop().toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File Summary */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">📊</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {selectedFiles.length}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Số lượng files</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">💾</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Tổng kích thước</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">🎯</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {new Set(selectedFiles.map(f => f.name.split('.').pop().toLowerCase())).size}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Loại file khác nhau</div>
                  </div>
                </div>

                {/* Hidden file input cho thêm files */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  required
                />
              </div>
            )}

            {/* Permissions Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-100 rounded-full p-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
            </div>
            <div>
                  <h4 className="text-lg font-semibold text-gray-900">Phân Quyền Truy Cập</h4>
                  <p className="text-sm text-gray-600">Chọn users được phép truy cập files này</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="max-h-48 overflow-y-auto space-y-2">
                {users.map((user) => (
                    <label key={user.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadPermissions.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setUploadPermissions([...uploadPermissions, user.id]);
                        } else {
                          setUploadPermissions(uploadPermissions.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">{user.username}</span>
                        {user.role && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        )}
                      </div>
                  </label>
                ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  💡 Chọn user nào được phép truy cập files này
                </p>
              </div>
            </div>

            {/* File Info Summary */}
            {selectedFiles.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-purple-100 rounded-full p-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Thông Tin Upload</h4>
                    <p className="text-sm text-gray-600">Tóm tắt thông tin files sẽ được upload</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedFiles.length}</div>
                    <div className="text-sm text-gray-600">Số lượng files</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}
                    </div>
                    <div className="text-sm text-gray-600">Tổng kích thước</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-purple-600">{uploadPermissions.length}</div>
                    <div className="text-sm text-gray-600">Users được phân quyền</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className={`px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
                  isUploading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">❌</span> Hủy
              </button>
              <button
                type="submit"
                disabled={selectedFiles.length === 0 || isUploading}
                className={`px-8 py-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${
                  selectedFiles.length === 0 || isUploading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 shadow-lg'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang Upload...</span>
                  </div>
                ) : selectedFiles.length > 0 ? (
                  <div className="flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Upload {selectedFiles.length} Files</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>📁</span>
                    <span>Chọn files trước</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal; 