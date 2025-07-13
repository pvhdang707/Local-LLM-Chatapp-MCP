import React from 'react';
import { getFileType, getUsernameById, formatFileSize, formatDate, getFileIcon } from './AdminUtils';

const MAX_FILE_NAME_WIDTH = 'max-w-xs'; // Tailwind: ~20rem

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
      

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3" style={{maxWidth: '320px'}}>Tên file</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Loại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Kích thước</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Người upload</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Phòng ban</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Ngày upload</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFiles.map((file) => (
              <tr key={file.id} className="hover:bg-gray-50">
                <td className={`px-6 py-4 ${MAX_FILE_NAME_WIDTH} whitespace-nowrap overflow-hidden`} style={{maxWidth: '320px'}}>
                  <div className="flex items-center min-w-0">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getFileIcon(file.original_name)}
                      </div>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate" title={file.original_name}>
                        {file.original_name}
                      </div>
                      <div className="text-sm text-gray-500 truncate" title={file.id}>
                        {file.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getFileType(file.original_name)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatFileSize(file.file_size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 truncate" title={getUsernameById(file.uploaded_by, users)}>
                    {getUsernameById(file.uploaded_by, users)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    file.department ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {file.department || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(file.uploaded_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      onClick={() => onDownloadFile(file.id, file.original_name)}
                      title="Tải xuống"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 transition-colors"
                      onClick={() => onDeleteFile(file.id)}
                      title="Xóa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              {/* File Icon */}
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  {getFileIcon(file.original_name)}
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={file.original_name}>
                      {file.original_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {file.id}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2 ml-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      onClick={() => onDownloadFile(file.id, file.original_name)}
                      title="Tải xuống"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      onClick={() => onDeleteFile(file.id)}
                      title="Xóa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* File Details */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Loại:</span>
                    <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {getFileType(file.original_name)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Kích thước:</span>
                    <span className="ml-1 text-gray-900">{formatFileSize(file.file_size)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Upload bởi:</span>
                    <span className="ml-1 text-gray-900 truncate" title={getUsernameById(file.uploaded_by, users)}>
                      {getUsernameById(file.uploaded_by, users)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phòng ban:</span>
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      file.department ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {file.department || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Upload Date */}
                <div className="mt-2 text-xs text-gray-500">
                  Upload: {formatDate(file.uploaded_at)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có file nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            {files.length === 0 ? 'Chưa có file nào được upload.' : 'Không tìm thấy file phù hợp với bộ lọc.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileTable; 