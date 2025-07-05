import React, { useState } from 'react';

const EnhancedChatMessage = ({ message, enhanced, onDownload }) => {
  // Ưu tiên lấy file từ enhanced.search_results.results nếu có
  const files =
    (enhanced?.search_results?.results && Array.isArray(enhanced.search_results.results) && enhanced.search_results.results.length > 0)
      ? enhanced.search_results.results
      : (enhanced?.related_files || []);

  const [activeTab, setActiveTab] = useState(files[0]?.id || null);

  if (!files.length) return null;

  const activeFile = files.find(f => f.id === activeTab) || files[0];

  return (
    <div className="enhanced-chat-message">
      {/* Tabs */}
      <div className="flex space-x-2 border-b mb-2">
        {files.map(file => (
          <button
            key={file.id}
            className={`px-3 py-1 rounded-t text-xs font-medium transition-all duration-150
              ${activeTab === file.id ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab(file.id)}
          >
            {file.name}
          </button>
        ))}
      </div>
      {/* File Content */}
      <div className="p-3 bg-gray-50 rounded-b border">
        <div className="mb-2 text-sm text-gray-700">
          <b>Loại file:</b> {activeFile.file_type || activeFile.type}
        </div>
        <div className="mb-2 text-xs text-gray-500">
          <b>Ngày upload:</b> {activeFile.uploaded_at ? new Date(activeFile.uploaded_at).toLocaleString() : 'N/A'}
        </div>
        <div className="mb-2">
          <b>Preview nội dung:</b>
          <div className="mt-1 p-2 bg-white border rounded text-xs max-h-48 overflow-auto">
            {activeFile.content_preview || 'Không có nội dung preview'}
          </div>
        </div>
        {/* Hiển thị phân loại nếu có */}
        {activeFile.classification && (
          <div className="mt-2 text-xs">
            <b>Phân loại:</b> {activeFile.classification.group_name} ({Math.round(activeFile.classification.confidence * 100)}%)
          </div>
        )}
        {/* Hiển thị điểm match nếu có */}
        {activeFile.match_score !== undefined && (
          <div className="mt-1 text-xs">
            <b>Điểm match:</b> {activeFile.match_score}
          </div>
        )}
        {/* Nút tải file nếu có */}
        {activeFile.download_url && (
          <a
            href={activeFile.download_url}
            className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            Tải file
          </a>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatMessage; 