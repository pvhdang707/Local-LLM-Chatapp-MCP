import React, { useState, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  uploadFile,
  uploadFilesBatch,
  validateFile,
  UPLOAD_CONFIG,
} from "../services/fileApi";

const FileUploadModal = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onUploadError,
}) => {
  const { user } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
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
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  }, []);

  // Xử lý chọn file từ input
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  // Xử lý upload nhiều file
  const handleMultipleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Vui lòng chọn ít nhất một file");
      return;
    }

    try {
      setError(null);
      setUploadResult(null);
      setIsUploading(true);
      setUploadProgress(0);
      setCurrentFileIndex(0);

      // Simulate progress cho từng file
      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentFileIndex(i);
        setUploadProgress((i / selectedFiles.length) * 100);

        // Simulate delay cho mỗi file
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setUploadProgress(100);

      // Upload files
      const result = await uploadFilesBatch(selectedFiles);

      setUploadResult(result);

      // Callback success
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Reset form
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
      setCurrentFileIndex(0);
    }
  };

  // Xóa file khỏi danh sách
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Xóa tất cả files
  const clearAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file icon based on extension
  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    const iconMap = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "📈",
      pptx: "📈",
      txt: "📄",
      png: "🖼️",
      jpg: "🖼️",
      jpeg: "🖼️",
      gif: "🖼️",
    };
    return iconMap[ext] || "📁";
  };

  // Get file type color
  const getFileTypeColor = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    const colorMap = {
      pdf: "bg-red-100 text-red-800",
      doc: "bg-blue-100 text-blue-800",
      docx: "bg-blue-100 text-blue-800",
      xls: "bg-green-100 text-green-800",
      xlsx: "bg-green-100 text-green-800",
      ppt: "bg-orange-100 text-orange-800",
      pptx: "bg-orange-100 text-orange-800",
      txt: "bg-gray-100 text-gray-800",
      png: "bg-purple-100 text-purple-800",
      jpg: "bg-pink-100 text-pink-800",
      jpeg: "bg-pink-100 text-pink-800",
      gif: "bg-indigo-100 text-indigo-800",
    };
    return colorMap[ext] || "bg-gray-100 text-gray-800";
  };

  // Reset modal state
  const handleClose = () => {
    if (isUploading) {
      return; // Không cho phép đóng khi đang upload
    }
    setError(null);
    setUploadResult(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsDragOver(false);
    setSelectedFiles([]);
    setCurrentFileIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  // Handle successful upload
  const handleSuccess = (result) => {
    if (onUploadSuccess) {
      onUploadSuccess(result);
    }
    // Auto close after 3 seconds
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  if (!isOpen) return null;

  // Kiểm tra authentication - nếu chưa đăng nhập thì hiển thị thông báo
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity cursor-pointer" onClick={onClose}></div>
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Yêu cầu đăng nhập</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vui lòng đăng nhập</h3>
              <p className="text-gray-600 mb-6">
                Bạn cần đăng nhập để có thể upload files. Vui lòng đăng nhập và thử lại.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
          isUploading ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={isUploading ? undefined : handleClose}
      ></div>

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Đang Upload Files...
              </h3>
              <p className="text-gray-600 mb-4">
                File {currentFileIndex + 1} / {selectedFiles.length}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-500">
                {Math.round(uploadProgress)}% hoàn thành
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Vui lòng không đóng modal trong quá trình upload
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upload Files</h2>
              <p className="text-sm text-gray-600 mt-1">
                Chọn và review files trước khi upload
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className={`p-2 rounded-full transition-colors ${
                isUploading
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* File Selection Section - Ẩn khi có files đã chọn */}
            {selectedFiles.length === 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 rounded-full p-2">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Chọn Files
                    </h4>
                    <p className="text-sm text-gray-600">
                      Kéo thả hoặc click để chọn files
                    </p>
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                    isDragOver
                      ? "border-blue-500 bg-blue-100 scale-105"
                      : "border-blue-300 hover:border-blue-400 bg-white"
                  } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="text-5xl">
                      {isUploading ? "⏳" : isDragOver ? "📁" : "📦"}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {isUploading
                          ? "Đang xử lý..."
                          : "Kéo thả nhiều file vào đây"}
                      </h3>
                      <p className="text-gray-600">
                        {isUploading
                          ? "Vui lòng chờ trong giây lát"
                          : "hoặc click để chọn nhiều file từ máy tính"}
                      </p>
                    </div>

                    {/* File Types Info */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        📋 Định dạng hỗ trợ:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {UPLOAD_CONFIG.ALLOWED_EXTENSIONS.map((ext) => (
                          <span
                            key={ext}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {ext.toUpperCase()}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Kích thước tối đa:{" "}
                        {formatFileSize(UPLOAD_CONFIG.MAX_FILE_SIZE)}
                      </p>
                    </div>

                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isUploading
                          ? "bg-gray-400 text-white"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                      }`}
                    >
                      {isUploading ? "Đang xử lý..." : "📂 Chọn Files"}
                    </button>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept={UPLOAD_CONFIG.ALLOWED_EXTENSIONS.map(
                    (ext) => `.${ext}`
                  ).join(",")}
                  multiple={true}
                />
              </div>
            )}

            {/* Selected Files Review Section */}
            {selectedFiles.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 rounded-full p-2">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Review Files
                    </h4>
                    <p className="text-sm text-gray-600">
                      Kiểm tra files trước khi upload
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📋</span>
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
                        ➕ Thêm Files
                      </button>
                      <button
                        type="button"
                        onClick={clearAllFiles}
                        disabled={isUploading}
                        className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        🗑️ Xóa tất cả
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {getFileIcon(file.name)}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-600">
                                {formatFileSize(file.size)}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(
                                  file.name
                                )}`}
                              >
                                {file.name.split(".").pop().toUpperCase()}
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
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File Summary */}
                {/* <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedFiles.length}
                    </div>
                    <div className="text-sm text-gray-600">Số lượng files</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatFileSize(
                        selectedFiles.reduce(
                          (total, file) => total + file.size,
                          0
                        )
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Tổng kích thước</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {
                        new Set(
                          selectedFiles.map((f) =>
                            f.name.split(".").pop().toLowerCase()
                          )
                        ).size
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      Loại file khác nhau
                    </div>
                  </div>
                </div> */}

                {/* Hidden file input cho thêm files */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept={UPLOAD_CONFIG.ALLOWED_EXTENSIONS.map(
                    (ext) => `.${ext}`
                  ).join(",")}
                  multiple={true}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Lỗi upload
                    </h3>
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
            )}

            {/* Upload Result */}
            {uploadResult && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">✅</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">
                      Upload files thành công!
                    </h3>

                    {/* Multiple Files Result */}
                    {uploadResult.files && (
                      <div className="space-y-3">
                        <p className="text-sm text-green-700 mb-3">
                          {uploadResult.message}
                        </p>

                        {/* Successful Files */}
                        {uploadResult.files.length > 0 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Files upload thành công (
                              {uploadResult.files.length}):
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {uploadResult.files.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                                >
                                  <span className="text-lg">
                                    {getFileIcon(file.original_name)}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {file.original_name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(file.file_size)})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Failed Files */}
                        {uploadResult.failed_files &&
                          uploadResult.failed_files.length > 0 && (
                            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                              <h4 className="font-semibold text-red-800 mb-3">
                                Files upload thất bại (
                                {uploadResult.failed_files.length}):
                              </h4>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {uploadResult.failed_files.map(
                                  (file, index) => (
                                    <div
                                      key={index}
                                      className="text-sm text-red-700"
                                    >
                                      <span className="font-medium">
                                        {file.original_name}:
                                      </span>{" "}
                                      {file.error}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 space-x-4">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className={`px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
                isUploading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              ❌ Hủy
            </button>
            {selectedFiles.length > 0 && (
              <button
                onClick={handleMultipleFileUpload}
                disabled={isUploading}
                className={`px-8 py-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${
                  isUploading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 shadow-lg"
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang upload...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 10l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                    <span>Upload {selectedFiles.length} Files</span>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
