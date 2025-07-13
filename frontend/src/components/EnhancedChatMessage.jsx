import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import FileComparisonResults from './FileComparisonResults';
import { submitFeedback } from '../services/api';

const EnhancedChatMessage = ({ message, enhanced, onDownload }) => {
  // Kiểm tra xem có phải là kết quả so sánh file không
  const isFileComparison = enhanced?.is_file_comparison;
  const comparisonResult = enhanced?.comparison_result;
  
  // Lấy files từ Agentic AI nếu có
  let agenticFiles = [];
  if (enhanced?.plan && enhanced?.execution_results?.execution_results) {
    // Tìm bước search_files trong execution_results
    const searchStep = enhanced.execution_results.execution_results.find(
      step => step.step?.action === 'search_files' && Array.isArray(step.result?.files)
    );
    if (searchStep) {
      agenticFiles = searchStep.result.files;
    }
  }

  // Ưu tiên lấy file từ agenticFiles nếu có, sau đó đến enhanced.search_results, rồi related_files
  const files = isFileComparison 
    ? enhanced?.files || []
    : (agenticFiles.length > 0)
      ? agenticFiles
      : (enhanced?.search_results?.results && Array.isArray(enhanced.search_results.results) && enhanced.search_results.results.length > 0)
        ? enhanced.search_results.results
        : (enhanced?.related_files || []);

  // Lấy chain of thought nếu có
  const chainOfThought = enhanced?.execution_results?.chain_of_thought || enhanced?.chain_of_thought;

  // Lấy classifications để xác định file nào đã có feedback RLHF
  let classifications = [];
  if (enhanced?.execution_results?.execution_results) {
    for (const step of enhanced.execution_results.execution_results) {
      if (step.step?.action === 'classify_files') {
        classifications = step.result.classifications || [];
      }
    }
  }

  // Lấy danh sách file từ bước search_files (luôn lấy từ execution_results)
  let previewFiles = [];
  if (enhanced?.execution_results?.execution_results) {
    const searchStep = enhanced.execution_results.execution_results.find(
      step => step.step?.action === 'search_files' && Array.isArray(step.result?.files)
    );
    if (searchStep) {
      previewFiles = searchStep.result.files;
    }
  } 

  const [activeTab, setActiveTab] = useState(files[0]?.id || null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFileForFeedback, setSelectedFileForFeedback] = useState(null);

  // Nếu là so sánh file, hiển thị component đặc biệt
  if (isFileComparison) {
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

        {/* File Comparison Results */}
        <FileComparisonResults 
          comparisonResult={comparisonResult}
          files={files}
          onDownload={onDownload}
        />
      </div>
    );
  }

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
      {chainOfThought && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Quá trình AI suy luận
            </h4>
          </div>
          <div className="text-sm text-blue-700 leading-relaxed whitespace-pre-line">
            {chainOfThought}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b mb-2">
        {files.map(file => (
          <div key={file.id} className="flex items-center space-x-1">
            <button
              className={`px-3 py-1 rounded-t text-xs font-medium transition-all duration-150
                ${activeTab === file.id ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setActiveTab(file.id)}
            >
              {file.name}
            </button>
            {file.download_url && (
              <button
                onClick={() => onDownload && onDownload(file.download_url, file.name)}
                className="inline-flex items-center px-1 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors"
                title={`Tải ${file.name} về máy`}
                style={{marginLeft: 2}}
              >
                <svg className="inline w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      {/* File Content */}
      <div className="p-3 bg-gray-50 rounded-b border">
        {/* Thông tin file gọn gàng trên 1 hàng */}
        <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-gray-700">
          {activeFile.uploaded_at && (
            <span className="text-gray-500">{new Date(activeFile.uploaded_at).toLocaleString()}</span>
          )}
          <span className="bg-gray-200 rounded px-2 py-0.5">{activeFile.file_type || activeFile.type}</span>

          {activeFile.match_score !== undefined && (
            <span className="bg-green-100 text-green-700 rounded px-2 py-0.5 font-semibold">Điểm match: {activeFile.match_score}</span>
          )}
          {activeFile.classification && (
            <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 font-semibold">
              {activeFile.classification.group_name} {activeFile.classification.confidence ? `(${Math.round(activeFile.classification.confidence * 100)}%)` : ''}
            </span>
          )}
          {activeFile.download_url && (
            <button
              onClick={() => onDownload && onDownload(activeFile.download_url, activeFile.name)}
              className="inline-flex items-center px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors ml-auto"
              title="Tải file về máy"
            >
              <svg className="inline w-4 h-4 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Tải file
            </button>
          )}
          {/* Nút feedback phân loại lại file */}
          <button
            onClick={() => handleFeedbackClick(activeFile)}
            className="inline-flex items-center px-2 py-0.5 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs font-semibold transition-colors"
            title="Phản hồi phân loại file"
          >
            <svg className="inline w-4 h-4 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Phản hồi
          </button>
        </div>
        {/* Preview nội dung */}
        <div className="mb-2">
          <b className="block text-xs text-gray-500 mb-1">Preview nội dung:</b>
          <div className="mt-1 p-2 bg-white border rounded text-xs max-h-48 overflow-auto">
            {activeFile.content_preview || 'Không có nội dung preview'}
          </div>
        </div>
      </div>

      {/* Preview nội dung file kết quả (luôn hiển thị nếu có file) */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-blue-700 mb-2">📄 Preview nội dung file kết quả:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map(file => (
              <div key={file.id} className="border rounded bg-white p-3 shadow-sm">
                <div className="font-semibold mb-1">{file.name}</div>
                <div className="text-xs text-gray-500 mb-1">{file.type}</div>
                <div className="mb-2">
                  <b className="block text-xs text-gray-500 mb-1">Preview nội dung:</b>
                  <pre className="bg-gray-50 border rounded p-2 text-xs max-h-48 overflow-auto whitespace-pre-line">
                    {file.content_preview || 'Không có preview'}
                  </pre>
                </div>
                {file.download_url && (
                  <a
                    href={file.download_url}
                    className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tải file
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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