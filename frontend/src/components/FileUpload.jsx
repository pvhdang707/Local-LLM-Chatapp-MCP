import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile, uploadFilesBatch, validateFile, UPLOAD_CONFIG } from '../services/fileApi';

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const { user } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadMode, setUploadMode] = useState('single'); // 'single' hoặc 'multiple'
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
      if (uploadMode === 'single') {
        handleFileUpload(files[0]);
      } else {
        setSelectedFiles(prev => [...prev, ...files]);
      }
    }
  }, [uploadMode]);

  // Xử lý chọn file từ input
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (uploadMode === 'single') {
        handleFileUpload(files[0]);
      } else {
        setSelectedFiles(prev => [...prev, ...files]);
      }
    }
  };

  // Xử lý upload file đơn
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

      // Simulate progress
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

  // Xử lý upload nhiều file
  const handleMultipleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Vui lòng chọn ít nhất một file');
      return;
    }

    try {
      setError(null);
      setUploadResult(null);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload files
      const result = await uploadFilesBatch(selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadResult(result);
      
      // Callback success
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Reset form
      setSelectedFiles([]);
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

  // Xóa file khỏi danh sách
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Xóa tất cả files
  const clearAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  // Kiểm tra authentication - nếu chưa đăng nhập thì hiển thị thông báo
  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
          <p className="text-gray-600 mb-4">
            Bạn cần đăng nhập để có thể upload files. Vui lòng đăng nhập và thử lại.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Chỉ người dùng đã đăng nhập mới có thể upload files.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Upload Mode Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setUploadMode('single')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              uploadMode === 'single'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📤 Upload Đơn
          </button>
          <button
            onClick={() => setUploadMode('multiple')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              uploadMode === 'multiple'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📁 Upload Nhiều
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 transform ${
          isDragOver 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105 shadow-lg' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${isUploading ? 'opacity-75 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 w-8 h-8 border-2 border-gray-300 rounded"></div>
          <div className="absolute top-8 right-8 w-4 h-4 border-2 border-gray-300 rounded-full"></div>
          <div className="absolute bottom-8 left-8 w-6 h-6 border-2 border-gray-300 transform rotate-45"></div>
        </div>

        <div className="relative space-y-6">
          {/* Icon */}
          <div className={`text-6xl transition-transform duration-300 ${isDragOver ? 'scale-110' : ''}`}>
            {isUploading ? '⏳' : isDragOver ? '📁' : uploadMode === 'multiple' ? '📦' : '📤'}
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {isUploading ? 'Đang xử lý file...' : 
               uploadMode === 'multiple' ? 'Kéo thả nhiều file vào đây' : 'Kéo thả file vào đây'}
            </h3>
            <p className="text-lg text-gray-600">
              {isUploading ? 'Vui lòng chờ trong giây lát' : 
               uploadMode === 'multiple' ? 'hoặc click để chọn nhiều file từ máy tính' : 'hoặc click để chọn file từ máy tính'}
            </p>
            
            {/* File Types Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">📋 Định dạng hỗ trợ:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {UPLOAD_CONFIG.ALLOWED_EXTENSIONS.map(ext => (
                  <span key={ext} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {ext.toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Kích thước tối đa: {formatFileSize(UPLOAD_CONFIG.MAX_FILE_SIZE)}
              </p>
            </div>
          </div>
          
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isUploading 
                ? 'bg-gray-400 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isUploading ? 'Đang xử lý...' : uploadMode === 'multiple' ? 'Chọn Files' : 'Chọn File'}
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
        multiple={uploadMode === 'multiple'}
      />

      {/* Selected Files List (Multiple Mode) */}
      {uploadMode === 'multiple' && selectedFiles.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Files đã chọn ({selectedFiles.length})
            </h3>
            <button
              onClick={clearAllFiles}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Xóa tất cả
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleMultipleFileUpload}
            disabled={isUploading}
            className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Đang upload...' : `Upload ${selectedFiles.length} Files`}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">
                {uploadMode === 'multiple' ? 'Đang upload files...' : 'Đang upload file...'}
              </span>
              <span className="text-2xl font-bold text-blue-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600">
              {uploadProgress < 50 && 'Đang chuẩn bị file...'}
              {uploadProgress >= 50 && uploadProgress < 90 && 'Đang gửi lên server...'}
              {uploadProgress >= 90 && 'Đang xử lý cuối cùng...'}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 animate-fade-in">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi upload</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div className="mt-6 animate-fade-in">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="text-2xl">✅</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  {uploadMode === 'multiple' ? 'Upload files thành công!' : 'Upload thành công!'}
                </h3>
                
                {/* Single File Result */}
                {uploadMode === 'single' && uploadResult.file && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-3xl">{getFileIcon(uploadResult.file.original_name)}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {uploadResult.file.original_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Kích thước: {formatFileSize(uploadResult.file.file_size)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multiple Files Result */}
                {uploadMode === 'multiple' && uploadResult.files && (
                  <div className="space-y-3">
                    <p className="text-sm text-green-700 mb-3">
                      {uploadResult.message}
                    </p>
                    
                    {/* Successful Files */}
                    {uploadResult.files.length > 0 && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Files upload thành công ({uploadResult.files.length}):
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {uploadResult.files.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                              <span className="text-lg">{getFileIcon(file.original_name)}</span>
                              <span className="text-sm font-medium">{file.original_name}</span>
                              <span className="text-xs text-gray-500">
                                ({formatFileSize(file.file_size)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Failed Files */}
                    {uploadResult.failed_files && uploadResult.failed_files.length > 0 && (
                      <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-3">
                          Files upload thất bại ({uploadResult.failed_files.length}):
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {uploadResult.failed_files.map((file, index) => (
                            <div key={index} className="text-sm text-red-700">
                              <span className="font-medium">{file.original_name}:</span> {file.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 