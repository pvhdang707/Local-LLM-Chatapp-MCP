import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const Welcome = () => {
  return (
    <div className="flex h-[calc(100vh-200px)] w-full flex-col items-center justify-center p-4 text-center">
      <div className="mb-8 rounded-full bg-blue-100 p-4 dark:bg-blue-900">
        <SparklesIcon className="h-12 w-12 text-blue-500 dark:text-blue-400" />
      </div>
      <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
        Chào mừng đến với Local LLM Chat
      </h2>
      <p className="max-w-md text-gray-600 dark:text-gray-300">
        Bắt đầu cuộc trò chuyện mới bằng cách nhập tin nhắn của bạn vào ô bên dưới.
        Tôi sẽ giúp bạn trả lời các câu hỏi và thảo luận về mọi chủ đề.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">
            💡 Gợi ý
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Bạn có thể hỏi tôi về bất kỳ chủ đề nào, từ lập trình đến khoa học, văn học và nhiều hơn nữa.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">
            ⚡ Tính năng
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Hỗ trợ tra cứu, tìm kiếm thông tin, và nhiều tính năng hữu ích khác liên quan có trong kho tài liệu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 