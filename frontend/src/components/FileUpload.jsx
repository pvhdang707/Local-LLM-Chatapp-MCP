import React, { useState, useRef, useCallback } from 'react';
import { uploadFile, validateFile, UPLOAD_CONFIG } from '../services/fileApi';

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
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

  return (
    <div className="w-full max-w-4xl mx-auto">
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
            {isUploading ? '⏳' : isDragOver ? '📁' : '📤'}
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {isUploading ? 'Đang xử lý file...' : 'Kéo thả file vào đây'}
            </h3>
            <p className="text-lg text-gray-600">
              {isUploading ? 'Vui lòng chờ trong giây lát' : 'hoặc click để chọn file từ máy tính'}
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
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Đang upload file...</span>
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
                <h3 className="text-lg font-semibold text-green-800 mb-4">Upload thành công!</h3>
                
                {/* File Info Card */}
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

                  {/* Classification Result */}
                  {uploadResult.classification && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">🤖 Phân loại AI:</span>
                        <span className="text-xs text-blue-600">
                          {Math.round(uploadResult.classification.confidence * 100)}% chính xác
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          uploadResult.classification.group_id === 'A' ? 'bg-red-100 text-red-800' :
                          uploadResult.classification.group_id === 'B' ? 'bg-blue-100 text-blue-800' :
                          uploadResult.classification.group_id === 'C' ? 'bg-green-100 text-green-800' :
                          uploadResult.classification.group_id === 'D' ? 'bg-yellow-100 text-yellow-800' :
                          uploadResult.classification.group_id === 'E' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Nhóm {uploadResult.classification.group_id}
                        </span>
                        <span className="text-sm text-gray-700">
                          {uploadResult.classification.group_name}
                        </span>
                      </div>
                      {uploadResult.classification.reason && (
                        <p className="text-xs text-gray-600 mt-2 italic">
                          💡 {uploadResult.classification.reason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cloud Integration Result */}
                  {uploadResult.cloud_result && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-purple-900">☁️ Tích hợp Cloud:</span>
                        {uploadResult.cloud_result.success ? (
                          <span className="text-green-600 text-sm">✅ {uploadResult.cloud_result.message}</span>
                        ) : (
                          <span className="text-yellow-600 text-sm">⚠️ {uploadResult.cloud_result.message}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 