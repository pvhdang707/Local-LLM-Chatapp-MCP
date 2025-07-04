import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FileManager from '../components/FileManager';
import FileUploadModal from '../components/FileUploadModal';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';

const FileUploadPage = () => {
  const { user, isAdmin } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Callback khi upload thành công
  const handleUploadSuccess = (result) => {
    setToast({ message: 'Upload file thành công!', type: 'success' });
    setRefreshTrigger(prev => prev + 1);
  };

  // Callback khi upload lỗi
  const handleUploadError = (error) => {
    setToast({ message: error.message || 'Upload file thất bại!', type: 'error' });
  };

  // Callback khi thao tác với FileManager (xóa, phân loại lại...)
  const handleFileAction = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setRefreshTrigger(prev => prev + 1);
  };

  // Kiểm tra quyền truy cập
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-blue-500 mb-4">Trang quản lý file</h2>
            <p className="text-gray-600 mb-4">Trang này chỉ dành cho người dùng thường.</p>
            <p className="text-gray-500">Admin vui lòng sử dụng trang Quản trị viên để quản lý toàn bộ hệ thống.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý File
          </h1>
          <p className="text-gray-600">
            Upload, phân loại và quản lý tài liệu với AI
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header với Upload Button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Danh sách File</h2>
              <p className="text-sm text-gray-500 mt-1">Quản lý tất cả file đã upload</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <span>📤</span>
              <span>Upload File</span>
            </button>
          </div>

          {/* File Manager Content */}
          <div className="p-6">
            <FileManager key={refreshTrigger} onAction={handleFileAction} />
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 mt-0.5">💡</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Hướng dẫn nhanh:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Click "Upload File" để thêm file mới</li>
                <li>• Sử dụng thanh tìm kiếm để tìm file</li>
                <li>• Lọc theo nhóm phân loại AI</li>
                <li>• File sẽ được tự động phân loại</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
    </div>
  );
};

export default FileUploadPage; 