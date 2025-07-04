import React, { useEffect } from 'react';

const Notification = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  let bg = 'bg-blue-100 border-blue-400 text-blue-700';
  if (type === 'success') bg = 'bg-green-100 border-green-400 text-green-700';
  if (type === 'error') bg = 'bg-red-100 border-red-400 text-red-700';
  if (type === 'warning') bg = 'bg-yellow-100 border-yellow-400 text-yellow-700';

  return (
    <div className={`fixed top-6 right-6 z-50 border px-4 py-3 rounded shadow-lg flex items-center space-x-2 ${bg}`}
      style={{ minWidth: 250 }}
    >
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="font-bold text-lg leading-none">×</button>
    </div>
  );
};

export default Notification; 