import React from 'react';

const Welcome = ({ onCreateNewChat }) => {
  

  const examples = [
    {
      title: "Tìm kiếm thông tin",
      description: "Tìm kiếm và phân tích thông tin từ các file đã upload"
    },
    {
      title: "Phân loại tài liệu", 
      description: "Phân loại và tổ chức các tài liệu theo chủ đề"
    },
    {
      title: "Tóm tắt nội dung",
      description: "Tóm tắt các tài liệu dài thành các điểm chính"
    }
  ];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Local LLM Chat
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Hệ thống chat AI mạnh mẽ với khả năng tìm kiếm và phân tích tài liệu. 
          Bắt đầu cuộc trò chuyện mới để khám phá các tính năng.
        </p>
      </div>

      

      {/* Examples */}
      <div className="w-full max-w-4xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tính năng chính</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((example, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{example.title}</h3>
              <p className="text-sm text-gray-600">{example.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm text-gray-500">
        <p>Local LLM Chat có thể tạo ra thông tin không chính xác.</p>
      </div>
    </div>
  );
};

export default Welcome; 