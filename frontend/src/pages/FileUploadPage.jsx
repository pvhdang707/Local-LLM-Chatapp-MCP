import React, { useState } from 'react';
import FileManager from '../components/FileManager';
import FileUploadModal from '../components/FileUploadModal';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';

const FileUploadPage = ({ embedded = false }) => {
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
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg w-full">
          <h2 className="text-xl font-bold text-blue-500 mb-2">Trang quản lý file</h2>
          <p className="text-gray-600 mb-2">Trang này chỉ dành cho người dùng thường.</p>
          <p className="text-gray-500">Admin vui lòng sử dụng trang Quản trị viên để quản lý toàn bộ hệ thống.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full w-full bg-white`}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      
      <div className="container mx-4 py-6">
        

        {/* Main Content */}
        <div className=" rounded-xl shadow-sm ">
          {/* Header với Upload Button */}
          <div className="flex items-center justify-between px-6 ">
            
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span>Upload File</span>
            </button>
          </div>

          {/* File Manager Content */}
          <div className="p-6 w-full">
            <FileManager key={refreshTrigger} onAction={handleFileAction} />
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-8">
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