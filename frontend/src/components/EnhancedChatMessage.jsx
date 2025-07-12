import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import { submitFeedback } from '../services/api';

const EnhancedChatMessage = ({ message, enhanced, onDownload }) => {
  // Ưu tiên lấy file từ enhanced.search_results.results nếu có
  const files =
    (enhanced?.search_results?.results && Array.isArray(enhanced.search_results.results) && enhanced.search_results.results.length > 0)
      ? enhanced.search_results.results
      : (enhanced?.related_files || []);

  const [activeTab, setActiveTab] = useState(files[0]?.id || null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFileForFeedback, setSelectedFileForFeedback] = useState(null);

  if (!files.length) return null;

  const activeFile = files.find(f => f.id === activeTab) || files[0];

  const handleFeedbackClick = (file) => {
    setSelectedFileForFeedback(file);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      await submitFeedback(feedbackData);
      console.log('Feedback submitted successfully');
      // Có thể thêm toast notification ở đây
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Có thể thêm error notification ở đây
    }
  };

  return (
    <div className="enhanced-chat-message">
      {/* Chain of Thought Section */}
      {enhanced?.chain_of_thought && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Quá trình AI suy luận
            </h4>
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {showReasoning ? 'Thu gọn' : 'Xem chi tiết'}
              <svg className={`w-3 h-3 transition-transform ${showReasoning ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {showReasoning && (
            <div className="text-sm text-blue-700 leading-relaxed whitespace-pre-line">
              {enhanced.chain_of_thought}
            </div>
          )}
        </div>
      )}

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
        {/* Thông tin file gọn gàng trên 1 hàng */}
        <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-gray-700">
          <span className="font-semibold text-blue-700">{activeFile.name}</span>
          <span className="bg-gray-200 rounded px-2 py-0.5">{activeFile.file_type || activeFile.type}</span>
          {activeFile.uploaded_at && (
            <span className="text-gray-500">{new Date(activeFile.uploaded_at).toLocaleString()}</span>
          )}
          {activeFile.match_score !== undefined && (
            <span className="bg-green-100 text-green-700 rounded px-2 py-0.5 font-semibold">Điểm match: {activeFile.match_score}</span>
          )}
          {activeFile.classification && (
            <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 font-semibold">
              {activeFile.classification.group_name} ({Math.round(activeFile.classification.confidence * 100)}%)
            </span>
          )}
          {activeFile.download_url && (
            <a
              href={activeFile.download_url}
              className="inline-flex items-center px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors ml-auto"
              download
              target="_blank"
              rel="noopener noreferrer"
              title="Tải file về máy"
            >
              <svg className="inline w-4 h-4 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Tải file
            </a>
          )}
        </div>
        {/* Preview nội dung */}
        <div className="mb-2">
          <b className="block text-xs text-gray-500 mb-1">Preview nội dung:</b>
          <div className="mt-1 p-2 bg-white border rounded text-xs max-h-48 overflow-auto">
            {activeFile.content_preview || 'Không có nội dung preview'}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {selectedFileForFeedback && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedFileForFeedback(null);
          }}
          fileName={selectedFileForFeedback.name}
          originalClassification={selectedFileForFeedback.classification}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default EnhancedChatMessage; 