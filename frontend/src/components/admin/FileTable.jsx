import React from 'react';
import { getFileType, getUsernameById, formatFileSize, formatDate, getFileIcon } from './AdminUtils';

const FileTable = ({ 
  files, 
  filteredFiles, 
  fileFilters, 
  setFileFilters, 
  users, 
  onDownloadFile, 
  onDeleteFile 
}) => {
  return (
    <div>
      {/* Filter & Search */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={fileFilters.type}
          onChange={e => setFileFilters(f => ({ ...f, type: e.target.value }))}
          className="px-2 py-1 border rounded"
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
        <input
          type="text"
          placeholder="Người upload..."
          value={fileFilters.uploadedBy}
          onChange={e => setFileFilters(f => ({ ...f, uploadedBy: e.target.value }))}
          className="px-2 py-1 border rounded"
        />
        <input
          type="text"
          placeholder="Tìm kiếm tên file..."
          value={fileFilters.searchTerm}
          onChange={e => setFileFilters(f => ({ ...f, searchTerm: e.target.value }))}
          className="px-2 py-1 border rounded w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 max-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-xs" style={{maxWidth: '320px'}}>Tên file</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{maxWidth: '150px', width: '150px'}}>Người tải lên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích thước</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tải lên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFiles.map((file) => {
              const fileType = getFileType(file.original_name);
              const fileExt = file.original_name.split('.').pop().toLowerCase();
              return (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs" style={{maxWidth: '320px'}}>
                    <div className="flex items-center">
                      {getFileIcon(fileExt, fileType)}
                      <span className="truncate block" style={{maxWidth: '260px'}} title={file.original_name}>
                        {file.original_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      fileType === 'document' ? 'bg-blue-100 text-blue-800' : 
                      fileType === 'image' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{maxWidth: '150px', width: '150px'}}>
                    <span className="truncate block" title={getUsernameById(file.uploaded_by, users)}>
                      {getUsernameById(file.uploaded_by, users)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.file_size ? formatFileSize(file.file_size) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.uploaded_at ? formatDate(file.uploaded_at) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => onDownloadFile(file.id, file.original_name)}
                    >
                      Tải xuống
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => onDeleteFile(file.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileTable; 