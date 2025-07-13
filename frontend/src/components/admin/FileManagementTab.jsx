import React, { useState, useEffect } from 'react';
import FileTable from './FileTable';
import FileUploadModal from './FileUploadModal';
import { adminApi } from '../../services/adminApi';
import { getFileType, getUsernameById } from './AdminUtils';

const FileManagementTab = ({ 
  setNotification, 
  setLoading, 
  setConfirmModal,
  files,
  setFiles,
  fileGroups,
  setFileGroups,
  filteredFiles,
  setFilteredFiles,
  fileFilters,
  setFileFilters,
  users,
  showUploadModal,
  setShowUploadModal,
  uploadFile,
  setUploadFile,
  uploadPermissions,
  setUploadPermissions,
  loadFiles,
  selectedFiles,
  setSelectedFiles,
  uploadDepartment,
  setUploadDepartment
}) => {

  // Delete file
  const handleDeleteFile = (fileId) => {
    setConfirmModal({
      show: true,
      message: 'Bạn có chắc chắn muốn xóa file này?',
      onConfirm: async () => {
        setConfirmModal({ show: false, message: '', onConfirm: null });
        setLoading(true);
        try {
          await adminApi.deleteFile(fileId);
          loadFiles();
          setNotification({ message: 'Xóa file thành công!', type: 'success' });
        } catch (err) {
          console.error('Lỗi khi xóa file:', err);
          setNotification({ message: 'Xóa không thành công, vui lòng thử lại.', type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Download file
  const handleDownloadFile = async (fileId, fileName) => {
    try {
      await adminApi.downloadFile(fileId, fileName);
    } catch (err) {
      console.error('Lỗi khi tải xuống file:', err);
      setNotification({ message: 'Tải xuống file không thành công, vui lòng thử lại.', type: 'error' });
    }
  };

  // Upload file
  const handleUploadFile = async (e) => {
    
    // Kiểm tra file đã chọn
    if (!uploadFile && selectedFiles.length === 0) {
      alert('Vui lòng chọn file để upload');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Xác định chế độ upload dựa trên file nào được chọn
      const isSingleUpload = uploadFile && selectedFiles.length === 0;
      const isMultipleUpload = selectedFiles.length > 0;
      
      if (isSingleUpload) {
        // Upload đơn file
        formData.append('file', uploadFile);
      } else if (isMultipleUpload) {
        // Upload nhiều file
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
      }
      
      formData.append('permissions', JSON.stringify(uploadPermissions));
      
      // Thêm thông tin phòng ban
      if (uploadDepartment) {
        formData.append('department', uploadDepartment);
      }
      
      // Gọi API tương ứng
      let result;
      if (isSingleUpload) {
        result = await adminApi.uploadFileWithPermissions(formData);
      } else {
        result = await adminApi.uploadFilesBatchWithPermissions(formData);
      }
      
      // Reset form
      setUploadFile(null);
      setSelectedFiles([]);
      setUploadPermissions([]);
      setUploadDepartment('');
      setShowUploadModal(false);
      
      // Reload danh sách file
      loadFiles();
      
      // Hiển thị thông báo
      if (result.success) {
        const message = isSingleUpload 
          ? 'Upload file thành công!' 
          : `Upload thành công ${result.files?.length || 0} file(s)!`;
        setNotification({ message, type: 'success' });
      } else {
        setNotification({ message: 'Upload thất bại, vui lòng thử lại.', type: 'error' });
      }
    } catch (err) {
      console.error('Lỗi khi upload file:', err);
      setNotification({ message: 'Upload thất bại, vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Open upload modal
  const openUploadModal = () => {
    setShowUploadModal(true);
  };

  // Filter và tìm kiếm file
  const applyFileFilters = () => {
    let filtered = [...files];
    
    // Filter theo loại file
    if (fileFilters.type) {
      filtered = filtered.filter(file => getFileType(file.original_name) === fileFilters.type);
    }
    
    // Filter theo người upload
    if (fileFilters.uploadedBy) {
      filtered = filtered.filter(file => {
        const username = getUsernameById(file.uploaded_by, users);
        return username.toLowerCase().includes(fileFilters.uploadedBy.toLowerCase());
      });
    }
    
    // Tìm kiếm theo từ khóa
    if (fileFilters.searchTerm) {
      const searchTerm = fileFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(file => 
        file.original_name.toLowerCase().includes(searchTerm) ||
        (file.uploaded_by && file.uploaded_by.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredFiles(filtered);
  };

  useEffect(() => {
    applyFileFilters();
  }, [files, fileFilters, users]);

  return (
    <div>
      {/* Header với thống kê */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quản lý file</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng cộng {files.length} file • Đang hiển thị {filteredFiles.length} file
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={openUploadModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload file</span>
          </button>
        </div>
      </div>

      {/* Filter Section - Cải thiện layout responsive */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        {/* Desktop Filter */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Loại file */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại file</label>
            <select
              value={fileFilters.type}
              onChange={e => setFileFilters(f => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả loại</option>
              <option value="document">Tài liệu</option>
              <option value="image">Hình ảnh</option>
              <option value="video">Video</option>
              <option value="audio">Âm thanh</option>
              <option value="archive">Lưu trữ</option>
              <option value="code">Mã nguồn</option>
              <option value="spreadsheet">Bảng tính</option>
              <option value="presentation">Trình chiếu</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Người upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Người upload</label>
            <input
              type="text"
              placeholder="Tìm theo tên..."
              value={fileFilters.uploadedBy}
              onChange={e => setFileFilters(f => ({ ...f, uploadedBy: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tìm kiếm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên file..."
              value={fileFilters.searchTerm}
              onChange={e => setFileFilters(f => ({ ...f, searchTerm: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Clear filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFileFilters({ type: '', uploadedBy: '', searchTerm: '' })}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Mobile Filter */}
        <div className="md:hidden space-y-3">
          {/* Tìm kiếm - ưu tiên trên mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm file</label>
            <input
              type="text"
              placeholder="Tên file..."
              value={fileFilters.searchTerm}
              onChange={e => setFileFilters(f => ({ ...f, searchTerm: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Loại file và Người upload trên cùng một hàng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
              <select
                value={fileFilters.type}
                onChange={e => setFileFilters(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="document">Tài liệu</option>
                <option value="image">Hình ảnh</option>
                <option value="video">Video</option>
                <option value="audio">Âm thanh</option>
                <option value="archive">Lưu trữ</option>
                <option value="code">Mã nguồn</option>
                <option value="spreadsheet">Bảng tính</option>
                <option value="presentation">Trình chiếu</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload bởi</label>
              <input
                type="text"
                placeholder="Tên..."
                value={fileFilters.uploadedBy}
                onChange={e => setFileFilters(f => ({ ...f, uploadedBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Clear filters button */}
          <div>
            <button
              onClick={() => setFileFilters({ type: '', uploadedBy: '', searchTerm: '' })}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* File Table */}
      <FileTable
        files={files}
        filteredFiles={filteredFiles}
        fileFilters={fileFilters}
        setFileFilters={setFileFilters}
        users={users}
        onDownloadFile={handleDownloadFile}
        onDeleteFile={handleDeleteFile}
      />

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
        }}
        onSubmit={handleUploadFile}
        users={users}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        uploadPermissions={uploadPermissions}
        setUploadPermissions={setUploadPermissions}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        uploadDepartment={uploadDepartment}
        setUploadDepartment={setUploadDepartment}
      />
    </div>
  );
};

export default FileManagementTab; 