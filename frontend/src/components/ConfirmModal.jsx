import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  title = 'Xác nhận', 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  loading = false,
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  cancelButtonClass = 'bg-gray-200 hover:bg-gray-300'
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm animate-scale-in">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="mb-6 text-gray-700 text-sm leading-relaxed">{message}</div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${cancelButtonClass}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${confirmButtonClass}`}
          >
            {loading && <div className="spinner w-4 h-4"></div>}
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 