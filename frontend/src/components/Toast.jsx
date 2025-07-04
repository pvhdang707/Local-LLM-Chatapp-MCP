import React from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded shadow-lg text-white transition-all animate-fade-in-down
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      <div className="flex items-center space-x-3">
        <span>{type === 'success' ? '✅' : '❌'}</span>
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white font-bold">×</button>
      </div>
    </div>
  );
};

export default Toast; 