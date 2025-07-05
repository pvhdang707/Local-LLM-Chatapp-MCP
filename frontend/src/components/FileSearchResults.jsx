import React from 'react';

const FileSearchResults = ({ files = [], onDownload }) => {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="text-sm font-semibold text-blue-800 mb-3">
        📁 Tìm thấy {files.length} file liên quan:
      </h4>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {(file.file_type || file.type) === 'pdf' ? '📄' : 
                   (file.file_type || file.type) === 'docx' ? '📝' : 
                   (file.file_type || file.type) === 'xlsx' ? '📊' : 
                   (file.file_type || file.type) === 'pptx' ? '📈' : '📎'}
                </span>
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    Loại: {(file.file_type || file.type || 'unknown').toUpperCase()} | 
                    Điểm: {((file.match_score || 0) * 100).toFixed(1)}% |
                    Nhóm: {file.classification?.group_name || 'Chưa phân loại'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {file.download_url && (
                <button
                  onClick={() => onDownload(file.download_url, file.name)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Tải về
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileSearchResults; 