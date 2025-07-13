import React, { useState, useRef } from 'react';

const ROLES = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' }
];
const DEPARTMENTS = [
  { value: 'Sales', label: 'Sales' },
  { value: 'Tài chính', label: 'Tài chính' },
  { value: 'HR', label: 'HR' }
];

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
  setSelectedFiles,
  uploadDepartment,
  setUploadDepartment
}) => {
  const [uploadMode, setUploadMode] = useState('multiple'); // Mặc định nhiều file
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false); // FIX: Thêm state loading
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [role, setRole] = useState('user'); // Mặc định user
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra file đã chọn
    if (!uploadFile && selectedFiles.length === 0) {
      alert('Vui lòng chọn file để upload');
      return;
    }

    setLoading(true); // FIX: Sử dụng setLoading thay vì undefined
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
      
      // FIX: Đảm bảo department được gửi đúng
      if (uploadDepartment && uploadDepartment.trim()) {
        formData.append('department', uploadDepartment.trim());
        console.log('[DEBUG] Sending department:', uploadDepartment.trim());
      }
      
      // Bắt đầu upload với progress
      setIsUploading(true);
      setUploadProgress(0);
      setCurrentFileIndex(0);

      // Simulate progress cho từng file
      const totalFiles = selectedFiles.length;
      
      for (let i = 0; i < totalFiles; i++) {
        setCurrentFileIndex(i);
        setUploadProgress((i / totalFiles) * 100);
        
        // Simulate delay cho mỗi file
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setUploadProgress(100);
      
      // Gọi hàm submit thực tế
      await onSubmit(formData); // FIX: Truyền formData trực tiếp
      
      // Reset form sau khi upload thành công
      setUploadFile(null);
      setSelectedFiles([]);
      setUploadPermissions([]);
      setUploadDepartment('');
      setRole('user');
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload thất bại: ' + error.message);
    } finally {
      setLoading(false); // FIX: Đặt loading về false
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleClose = () => {
    if (!isUploading && !loading) { // FIX: Kiểm tra cả loading và isUploading
      setUploadFile(null);
      setSelectedFiles([]);
      setUploadPermissions([]);
      setUploadDepartment('');
      setRole('user');
      onClose();
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative mx-auto p-4 border w-full max-w-2xl shadow-2xl rounded-lg bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-2">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Upload Files với Phân Quyền</h3>
              <p className="text-xs text-gray-600 mt-1">Quản lý và phân quyền truy cập files</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading || loading} // FIX: Kiểm tra cả hai state
              className={`rounded-full p-1 transition-colors ${
                isUploading || loading
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Upload Progress Overlay */}
          {(isUploading || loading) && ( // FIX: Hiển thị overlay khi loading hoặc uploading
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {isUploading ? `Đang upload file ${currentFileIndex + 1}...` : 'Đang xử lý...'}
                </h3>
                {isUploading && (
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role và Department trong cùng một row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Chọn role */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-blue-100 rounded-full p-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Role</h4>
                  </div>
                </div>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || isUploading} // FIX: Disable khi đang loading
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Chọn phòng ban */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-yellow-100 rounded-full p-1">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Phòng Ban</h4>
                  </div>
                </div>
                <select
                  value={uploadDepartment}
                  onChange={e => setUploadDepartment(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  disabled={role === 'admin' || loading || isUploading} // FIX: Disable khi đang loading
                >
                  <option value="">{role === 'admin' ? 'Không áp dụng' : 'Chọn phòng ban'}</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                {role === 'user' && !uploadDepartment && (
                  <p className="text-xs text-red-500 mt-1">Vui lòng chọn phòng ban.</p>
                )}
              </div>
            </div>

            {/* File Selection */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-purple-100 rounded-full p-1">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Chọn Files</h4>
                </div>
              </div>

              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={handleFileClick}
              >
                {selectedFiles.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{file.name}</div>
                            <div className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedFile(index);
                          }}
                          disabled={loading || isUploading} // FIX: Disable khi đang loading
                          className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0 disabled:opacity-50"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-xs text-gray-600">Click để chọn files</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={loading || isUploading} // FIX: Disable khi đang loading
                  required
                />
              </div>
            </div>

            {/* File Info Summary - Compact */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-gray-700">Files:</span>
                  <span className="ml-1 text-gray-900">{selectedFiles.length}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phòng ban:</span>
                  <span className="ml-1 text-gray-900">{uploadDepartment || 'Chưa chọn'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Kích thước:</span>
                  <span className="ml-1 text-gray-900">
                    {(() => {
                      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
                      return `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
                    })()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Users:</span>
                  <span className="ml-1 text-gray-900">{uploadPermissions.length}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading || loading} // FIX: Disable khi đang loading
                className={`px-4 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isUploading || loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isUploading || loading || selectedFiles.length === 0} // FIX: Disable khi đang loading
                className={`px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isUploading || loading || selectedFiles.length === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
              >
                {loading || isUploading ? 'Đang upload...' : 'Upload Files'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;