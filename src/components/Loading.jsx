import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center space-x-2 p-4">
      <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></div>
      <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></div>
      <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500"></div>
    </div>
  );
};

export default Loading; 