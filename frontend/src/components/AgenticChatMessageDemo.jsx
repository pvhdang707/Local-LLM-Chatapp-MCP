import React from 'react';
import AgenticChatMessage from './AgenticChatMessage';

// Demo data dựa trên response thực tế từ backend
const demoAgenticData = {
  execution_results: {
    chain_of_thought: "Bước: Tìm kiếm file liên quan đến budget\n- Đã tìm thấy 2 file phù hợp với truy vấn 'budget'.\nBước: Phân loại các file tìm được\n- File 'budget_2025.txt' được AI phân loại thành 'Tài liệu quan trọng'.\n- File 'budget_2024.txt' được AI phân loại thành 'Tài liệu tài chính'.\nBước: Trích xuất thông tin metadata từ file\n- Đã trích xuất metadata cho 2 file.\n\nAI reasoning:\nQuá trình tìm và phân loại các file bằng cách sử dụng AI gồm các bước sau:\n\n1. Tải file lên hệ thống (Server hoặc Cloud).\n2. Phát sinh văn bản từ các tập tin được tải lên. Việc phát sinh văn bản này sẽ giúp cho AI hiểu dễ hơn nội dung của tập tin.\n3. Sử dụng mô hình Machine Learning được huấn luyện trước để phân loại văn bản từ các file. Mô hình sẽ sử dụng thông tin của những tập tin đã được có trước để xây dựng quy tắc phân loại cho một tập tin mới.\n4. Các quy tắc của mô hình sẽ được áp dụng để phân loại văn bản từ các file vừa được tải lên vào thư mục chung.\n5. Kết quả phân loại sẽ được in ra cho người dùng hoặc gửi đi theo các quy trình khác.\n\nVề vấn đề cụ thể trong yêu cầu, việc tải file `budget_2025.txt` và `budget_2024.txt` lên hệ thống và phân loại chúng làm việc cho mô hình Machine Learning đã được huấn luyện và sẵn sàng phân tích các file văn bản.",
    execution_results: [
      {
        step: {
          action: "search_files",
          description: "Tìm kiếm file liên quan đến budget",
          order: 1,
          parameters: {
            query: "budget"
          }
        },
        result: {
          action: "search_files",
          files: [
            {
              id: "48056c10-2f04-4cb2-a571-4c102326504c",
              name: "budget_2025.txt",
              type: "text/plain",
              uploaded_by: "56ba5105-89bf-4226-9cfb-cbcdfc496756",
              uploaded_at: "2025-07-12T18:27:03",
              match_type: "both",
              match_score: 18,
              content_preview: "Budget Plan for 2024\n\n\n\nTotal Allocated Budget: $2,400,000\n\n\n\nDepartment Breakdown:\n\n\n\nR&D: $800,000\n\n\n\nMarketing: $600,000\n\n\n\nOperations: $500,000\n\n\n\nHR & Training: $300,000\n\n\n\nContingency Reserve: $200,000\n\n\n\nPrepared by: Finance Department",
              download_url: "/api/user/files/download/48056c10-2f04-4cb2-a571-4c102326504c"
            },
            {
              id: "93f4ebc4-258a-4370-9313-0fcd77a854ad",
              name: "budget_2024.txt",
              type: "text/plain",
              uploaded_by: "56ba5105-89bf-4226-9cfb-cbcdfc496756",
              uploaded_at: "2025-07-12T18:26:54",
              match_type: "both",
              match_score: 18,
              content_preview: "Budget Plan for 2024\n\n\n\nTotal Allocated Budget: $1,200,000\n\n\n\nDepartment Breakdown:\n\n\n\nR&D: $400,000\n\n\n\nMarketing: $300,000\n\n\n\nOperations: $250,000\n\n\n\nHR & Training: $150,000\n\n\n\nContingency Reserve: $100,000\n\n\n\nPrepared by: Finance Department",
              download_url: "/api/user/files/download/93f4ebc4-258a-4370-9313-0fcd77a854ad"
            }
          ],
          files_found: 2,
          query: "budget"
        },
        status: "success"
      },
      {
        step: {
          action: "classify_files",
          description: "Phân loại các file tìm được",
          order: 2,
          parameters: {
            file_ids: "dynamic"
          }
        },
        result: {
          action: "classify_files",
          classifications: [
            {
              file_id: "48056c10-2f04-4cb2-a571-4c102326504c",
              classification: {
                confidence: 0.9,
                group_id: "A",
                group_name: "Tài liệu quan trọng",
                method: "ai_based",
                reason: "Chứa thông tin về kế hoạch kinh doanh (Budget Plan for 2024)"
              }
            },
            {
              file_id: "93f4ebc4-258a-4370-9313-0fcd77a854ad",
              classification: {
                confidence: 0.8,
                group_id: "A",
                group_name: "Tài liệu tài chính",
                method: "ai_based",
                reason: "Báo cáo tài chính được liên quan"
              }
            }
          ],
          total_files: 2
        },
        status: "success"
      }
    ]
  }
};

const AgenticChatMessageDemo = () => {
  const handleDownload = (downloadUrl, fileName) => {
    console.log('Download clicked:', { downloadUrl, fileName });
    // Trong thực tế, có thể mở URL trong tab mới hoặc trigger download
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        AgenticChatMessage Demo
      </h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Demo với dữ liệu thực tế từ backend
        </h2>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Tin nhắn gốc:</h3>
          <p className="text-gray-800">"tìm kiếm file liên quan đến budget"</p>
        </div>

        <AgenticChatMessage 
          message="tìm kiếm file liên quan đến budget"
          agentic={demoAgenticData}
          onDownload={handleDownload}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Thông tin về component
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Tính năng chính:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Hiển thị Chain of Thought từ AI</li>
              <li>File preview tabs với thông tin chi tiết</li>
              <li>Kết quả phân loại files với confidence</li>
              <li>Nút download cho từng file</li>
              <li>Feedback system cho phân loại</li>
              <li>Summary grid cho multiple files</li>
            </ul>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Dữ liệu được xử lý:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>2 files tìm thấy: budget_2025.txt, budget_2024.txt</li>
              <li>Phân loại: "Tài liệu quan trọng" (90%), "Tài liệu tài chính" (80%)</li>
              <li>Match score: 18 cho cả 2 files</li>
              <li>Chain of thought chi tiết về quá trình xử lý</li>
            </ul>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Cách sử dụng:</h3>
            <div className="bg-gray-50 rounded p-3">
              <code className="text-sm text-gray-800">
                {`<AgenticChatMessage 
  message="Tin nhắn gốc"
  agentic={agenticData}
  onDownload={handleDownload}
/>`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticChatMessageDemo; 