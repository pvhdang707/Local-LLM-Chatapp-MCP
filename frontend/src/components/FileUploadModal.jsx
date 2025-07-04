import React, { useState, useRef, useCallback } from 'react';
import { uploadFile, validateFile, UPLOAD_CONFIG } from '../services/fileApi';

const FileUploadModal = ({ isOpen, onClose, onUploadSuccess, onUploadError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Xử lý drag & drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  // Xử lý chọn file từ input
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Xử lý upload file
  const handleFileUpload = async (file) => {
    try {
      setError(null);
      setUploadResult(null);
      setIsUploading(true);
      setUploadProgress(0);

      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Simulate progress (vì fetch API không hỗ trợ progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file
      const result = await uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadResult(result);
      
      // Callback success
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      setError(error.message);
      setUploadProgress(0);
      
      // Callback error
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
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

  // Get file icon based on extension
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

  // Reset modal state
  const handleClose = () => {
    setError(null);
    setUploadResult(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Handle successful upload
  const handleSuccess = (result) => {
    if (onUploadSuccess) {
      onUploadSuccess(result);
    }
    // Auto close after 2 seconds
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upload File</h2>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-3">
                {/* Icon */}
                <div className="text-4xl">
                  {isUploading ? '⏳' : isDragOver ? '📁' : '📤'}
                </div>
                
                {/* Content */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {isUploading ? 'Đang xử lý...' : 'Kéo thả file vào đây'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {isUploading ? 'Vui lòng chờ' : 'hoặc click để chọn file'}
                  </p>
                </div>
                
                {/* File Types Info */}
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Định dạng hỗ trợ:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {UPLOAD_CONFIG.ALLOWED_EXTENSIONS.map(ext => (
                      <span key={ext} className="px-2 py-1 bg-white text-gray-700 text-xs rounded border">
                        {ext.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Tối đa: {formatFileSize(UPLOAD_CONFIG.MAX_FILE_SIZE)}
                  </p>
                </div>
                
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 ${
                    isUploading 
                      ? 'bg-gray-400 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? 'Đang xử lý...' : 'Chọn File'}
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept={UPLOAD_CONFIG.ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
            />

            {/* Progress Bar */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Đang upload...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-red-500 mt-0.5">⚠️</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 mb-1">Lỗi upload</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-green-500 mt-0.5">✅</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 mb-2">Upload thành công!</p>
                    
                    {/* File Info */}
                    <div className="bg-white rounded p-2 border">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getFileIcon(uploadResult.file.original_name)}</span>
                        <span className="font-medium text-sm">
                          {uploadResult.file.original_name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(uploadResult.file.file_size)}
                      </p>

                      {/* Classification */}
                      {uploadResult.classification && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-blue-900">Phân loại AI</span>
                            <span className="text-xs text-blue-600">
                              {Math.round(uploadResult.classification.confidence * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              uploadResult.classification.group_id === 'A' ? 'bg-red-100 text-red-800' :
                              uploadResult.classification.group_id === 'B' ? 'bg-blue-100 text-blue-800' :
                              uploadResult.classification.group_id === 'C' ? 'bg-green-100 text-green-800' :
                              uploadResult.classification.group_id === 'D' ? 'bg-yellow-100 text-yellow-800' :
                              uploadResult.classification.group_id === 'E' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              Nhóm {uploadResult.classification.group_id}
                            </span>
                            <span className="text-xs text-gray-700">
                              {uploadResult.classification.group_name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal; 