import React, { useState } from 'react';

const SessionTypeModal = ({ isOpen, onClose, onSelectType }) => {
  const [selectedType, setSelectedType] = useState(null);

  const handleSelectType = (type) => {
    setSelectedType(type);
  };

  const handleConfirm = () => {
    if (selectedType) {
      onSelectType(selectedType);
      setSelectedType(null);
    }
  };

  const handleCancel = () => {
    setSelectedType(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all duration-200 scale-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Chọn loại cuộc trò chuyện
        </h3>
        
        <div className="space-y-3 mb-6">
          {/* Chat thường */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedType === 'normal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleSelectType('normal')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedType === 'normal' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  Chat thường
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Cơ bản</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Trò chuyện trực tiếp với AI, không tích hợp tìm kiếm file
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  💡 Phù hợp cho: Hỏi đáp thông thường, trò chuyện đơn giản
                </div>
              </div>
            </div>
          </div>

          

          {/* Agentic AI Session */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedType === 'agentic'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleSelectType('agentic')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedType === 'agentic' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  Agentic AI Session
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Mới</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Phiên chat với Agentic AI, lưu trữ lịch sử và context
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  💡 Phù hợp cho: Dự án phức tạp, workflow dài, cần lưu trữ context
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 ${
              selectedType
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!selectedType}
          >
            Tạo session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTypeModal; 