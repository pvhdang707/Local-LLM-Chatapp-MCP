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
  setSelectedFiles
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
      const response = await adminApi.downloadFile(fileId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Lỗi khi tải xuống file:', err);
      setNotification({ message: 'Tải xuống file không thành công, vui lòng thử lại.', type: 'error' });
    }
  };

  // Upload file
  const handleUploadFile = async (e) => {
    e.preventDefault();
    
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản lý file</h2>
        <div className="flex space-x-2">
          <button
            onClick={openUploadModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload file
          </button>
        </div>
      </div>

      <FileTable
        files={files}
        filteredFiles={filteredFiles}
        fileFilters={fileFilters}
        setFileFilters={setFileFilters}
        users={users}
        onDownloadFile={handleDownloadFile}
        onDeleteFile={handleDeleteFile}
      />

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
      />
    </div>
  );
};

export default FileManagementTab; 