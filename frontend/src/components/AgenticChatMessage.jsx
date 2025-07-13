import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import { submitFeedback } from '../services/api';
import './AgenticChatMessage.css';

const AgenticChatMessage = ({ message, agentic, onDownload }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFileForFeedback, setSelectedFileForFeedback] = useState(null);

  // Trích xuất thông tin từ agentic response
  const extractAgenticData = (agenticData) => {
    if (!agenticData) return { files: [], classifications: [], chainOfThought: '' };

    const executionResults = agenticData.execution_results;
    if (!executionResults) return { files: [], classifications: [], chainOfThought: '' };

    let files = [];
    let classifications = [];
    let chainOfThought = executionResults.chain_of_thought || '';

    // Tìm files từ bước search_files
    if (executionResults.execution_results) {
      for (const step of executionResults.execution_results) {
        if (step.step?.action === 'search_files' && step.result?.files) {
          files = step.result.files;
        }
        if (step.step?.action === 'classify_files' && step.result?.classifications) {
          classifications = step.result.classifications;
        }
      }
    }

    // Gán classification cho từng file
    const filesWithClassification = files.map(file => {
      const classification = classifications.find(c => c.file_id === file.id);
      return {
        ...file,
        classification: classification?.classification || null
      };
    });

    return {
      files: filesWithClassification,
      classifications,
      chainOfThought
    };
  };

  const { files, classifications, chainOfThought } = extractAgenticData(agentic);

  // Set active tab mặc định
  React.useEffect(() => {
    if (files.length > 0 && !activeTab) {
      setActiveTab(files[0].id);
    }
  }, [files, activeTab]);

  const activeFile = files.find(f => f.id === activeTab) || files[0];

  const handleFeedbackClick = (file) => {
    setSelectedFileForFeedback(file);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      await submitFeedback(feedbackData);
      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Nếu không có files, chỉ hiển thị chain of thought
  if (!files.length) {
    return chainOfThought ? (
      <div className="agentic-chat-message">
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
              {chainOfThought}
            </div>
          )}
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="agentic-chat-message">
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
              {chainOfThought}
            </div>
          )}
        </div>
      )}

      {/* File Preview Tabs */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          📄 Files tìm thấy ({files.length})
        </h4>

        {/* Tabs */}
        <div className="flex space-x-2 border-b mb-3 overflow-x-auto">
          {files.map(file => (
            <div key={file.id} className="flex items-center space-x-1 flex-shrink-0">
              <button
                className={`px-3 py-1 rounded-t text-xs font-medium transition-all duration-150
                  ${activeTab === file.id ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setActiveTab(file.id)}
              >
                {file.name}
              </button>
              {/* {file.download_url && (
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
              )} */}
            </div>
          ))}
        </div>

        {/* File Content */}
        {activeFile && (
          <div className="p-4 bg-gray-50 rounded-b border">
            {/* Thông tin file */}
            <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-700">
              {activeFile.uploaded_at && (
                <span className="text-gray-500">
                  📅 {new Date(activeFile.uploaded_at).toLocaleString()}
                </span>
              )}
              <span className="bg-gray-200 rounded px-2 py-0.5">
                📄 {activeFile.type || activeFile.file_type}
              </span>

              {activeFile.match_score !== undefined && (
                <span className="bg-green-100 text-green-700 rounded px-2 py-0.5 font-semibold">
                  🎯 Điểm: {activeFile.match_score}
                </span>
              )}

              {activeFile.classification && (
                <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 font-semibold">
                  🏷️ {activeFile.classification.group_name} 
                  {activeFile.classification.confidence ? ` (${Math.round(activeFile.classification.confidence * 100)}%)` : ''}
                </span>
              )}

              {activeFile.download_url && (
                <button
                  onClick={() => onDownload && onDownload(activeFile.download_url, activeFile.name)}
                  className="inline-flex items-center px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors ml-auto"
                  title="Tải file về máy"
                >
                  <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                  </svg>
                  Tải file
                </button>
              )}

              {/* Nút feedback */}
              <button
                onClick={() => handleFeedbackClick(activeFile)}
                className="inline-flex items-center px-2 py-0.5 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs font-semibold transition-colors"
                title="Phản hồi phân loại file"
              >
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Phản hồi
              </button>
            </div>

            {/* Preview nội dung */}
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">📖 Preview nội dung:</h5>
              <div className="p-3 bg-white border rounded text-sm max-h-64 overflow-auto">
                <pre className="whitespace-pre-wrap text-gray-800">
                  {activeFile.content_preview || 'Không có nội dung preview'}
                </pre>
              </div>
            </div>

            {/* Thông tin classification nếu có */}
            {activeFile.classification && activeFile.classification.reason && (
              <div className="mb-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">🤖 Lý do phân loại:</h5>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  {activeFile.classification.reason}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Grid */}
      {/* {files.length > 1 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">📋 Tóm tắt tất cả files:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map(file => (
              <div key={file.id} className="border rounded bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-sm">{file.name}</h5>
                  {file.download_url && (
                    <button
                      onClick={() => onDownload && onDownload(file.download_url, file.name)}
                      className="inline-flex items-center px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                    >
                      <svg className="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                      </svg>
                      Tải
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-2">{file.type}</div>
                {file.match_score !== undefined && (
                  <div className="text-xs text-green-600 mb-1">🎯 Điểm: {file.match_score}</div>
                )}
                {file.classification && (
                  <div className="text-xs text-blue-600 mb-2">
                    🏷️ {file.classification.group_name}
                    {file.classification.confidence ? ` (${Math.round(file.classification.confidence * 100)}%)` : ''}
                  </div>
                )}
                <div className="text-xs text-gray-600 line-clamp-3">
                  {file.content_preview ? file.content_preview.substring(0, 100) + '...' : 'Không có preview'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedFileForFeedback && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleFeedbackSubmit}
          file={selectedFileForFeedback}
        />
      )}
    </div>
  );
};

export default AgenticChatMessage; 