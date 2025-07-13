import React, { useState } from 'react';

const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  fileName, 
  originalClassification,
  onSubmit 
}) => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileGroups = [
    { id: 'A', name: 'Tài liệu quan trọng', description: 'Các file chứa thông tin quan trọng, kế hoạch, báo cáo' },
    { id: 'B', name: 'Tài liệu marketing', description: 'Các file liên quan đến marketing, quảng cáo, thuyết trình' },
    { id: 'C', name: 'Tài liệu kỹ thuật', description: 'Các file code, tài liệu kỹ thuật, hướng dẫn' },
    { id: 'D', name: 'Tài liệu tài chính', description: 'Các file báo cáo tài chính, ngân sách, kế toán' },
    { id: 'E', name: 'Tài liệu nhân sự', description: 'Các file liên quan đến nhân sự, tuyển dụng, đào tạo' },
    { id: 'F', name: 'Tài liệu khác', description: 'Các file không thuộc nhóm trên' }
  ];

  const handleSubmit = async () => {
    if (!selectedGroup) return;
    
    setIsSubmitting(true);
    try {
      // Xử lý original_group từ classification
      let originalGroup = 'F'; // Default
      if (originalClassification) {
        // Kiểm tra các trường có thể có
        if (originalClassification.group_id) {
          originalGroup = originalClassification.group_id;
        } else if (originalClassification.group_name) {
          // Map group_name sang group_id
          const groupNameToId = {
            'Tài liệu quan trọng': 'A',
            'Tài liệu marketing': 'B', 
            'Tài liệu kỹ thuật': 'C',
            'Tài liệu tài chính': 'D',
            'Tài liệu nhân sự': 'E',
            'Tài liệu khác': 'F'
          };
          originalGroup = groupNameToId[originalClassification.group_name] || 'F';
        }
      }

      const feedbackData = {
        file_name: fileName,
        original_group: originalGroup,
        corrected_group: selectedGroup
      };
      
      console.log('Sending feedback data:', feedbackData);
      await onSubmit(feedbackData);
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Gửi phản hồi</h3>
              <p className="text-blue-100 text-sm">Giúp AI cải thiện độ chính xác</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">File: {fileName}</h4>
            {originalClassification && (
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Phân loại hiện tại:</span> {originalClassification.group_name} 
                ({Math.round(originalClassification.confidence * 100)}%)
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn phân loại đúng:
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {fileGroups.map(group => (
                <label key={group.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="classification"
                    value={group.id}
                    checked={selectedGroup === group.id}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{group.name}</div>
                    <div className="text-sm text-gray-500">{group.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            <p>💡 Phản hồi của bạn sẽ giúp AI học hỏi và cải thiện độ chính xác trong tương lai.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedGroup || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Gửi phản hồi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal; 