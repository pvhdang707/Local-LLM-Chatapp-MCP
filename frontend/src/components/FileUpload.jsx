import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile, uploadFilesBatch, validateFile, UPLOAD_CONFIG } from '../services/fileApi';

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const { user, userDepartment } = useAuth();
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

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload file với department của user
      const result = await uploadFile(file, userDepartment);
      
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
      }, 100);

      // Upload files với department của user
      const result = await uploadFilesBatch(selectedFiles, userDepartment);
      
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

      {/* Department Info */}
      {userDepartment && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">📋</span>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Phòng ban của bạn: <span className="font-bold">{userDepartment}</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Tất cả file upload sẽ được gán vào phòng ban này
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="mb-6">
        {uploadMode === 'single' ? (
          /* Single File Upload */
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Kéo thả file vào đây hoặc click để chọn
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Hỗ trợ: {UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')} (Tối đa {UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept={UPLOAD_CONFIG.ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Chọn File
            </button>
          </div>
        ) : (
          /* Multiple Files Upload */
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Kéo thả nhiều file vào đây hoặc click để chọn
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Hỗ trợ: {UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')} (Tối đa {UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB mỗi file)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              accept={UPLOAD_CONFIG.ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Chọn Files
            </button>
          </div>
        )}
      </div>

      {/* Selected Files List */}
      {uploadMode === 'multiple' && selectedFiles.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Files đã chọn ({selectedFiles.length})
            </h4>
            <button
              onClick={clearAllFiles}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Xóa tất cả
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleMultipleFileUpload}
            disabled={isUploading}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isUploading ? 'Đang upload...' : 'Upload Files'}
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Đang upload...</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">Upload thành công!</h4>
          {uploadMode === 'single' ? (
            <div className="text-sm text-green-700">
              <p>File: {uploadResult.file?.original_name}</p>
              <p>Kích thước: {uploadResult.file?.file_size ? formatFileSize(uploadResult.file.file_size) : 'N/A'}</p>
              {uploadResult.file?.department && (
                <p>Department: {uploadResult.file.department}</p>
              )}
            </div>
          ) : (
            <div className="text-sm text-green-700">
              <p>Đã upload {uploadResult.files?.length || 0} file(s) thành công</p>
              {uploadResult.failed_files && uploadResult.failed_files.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Files thất bại:</p>
                  <ul className="list-disc list-inside">
                    {uploadResult.failed_files.map((failed, index) => (
                      <li key={index} className="text-red-600">
                        {failed.original_name}: {failed.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Lỗi upload</h4>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 