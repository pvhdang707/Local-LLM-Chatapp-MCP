import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AgenticChatMessage from './AgenticChatMessage';

// Mock data dựa trên response thực tế từ backend
const mockAgenticData = {
  execution_results: {
    chain_of_thought: "Bước: Tìm kiếm file liên quan đến budget\n- Đã tìm thấy 2 file phù hợp với truy vấn 'budget'.\nBước: Phân loại các file tìm được\n- File 'budget_2025.txt' được AI phân loại thành 'Tài liệu quan trọng'.\n- File 'budget_2024.txt' được AI phân loại thành 'Tài liệu tài chính'.\nBước: Trích xuất thông tin metadata từ file\n- Đã trích xuất metadata cho 2 file.",
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

const mockOnDownload = jest.fn();

describe('AgenticChatMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders chain of thought section', () => {
    render(
      <AgenticChatMessage 
        message="Test message"
        agentic={mockAgenticData}
        onDownload={mockOnDownload}
      />
    );

    expect(screen.getByText('Quá trình AI suy luận')).toBeInTheDocument();
    expect(screen.getByText(/Bước: Tìm kiếm file liên quan đến budget/)).toBeInTheDocument();
  });

  test('renders file tabs', () => {
    render(
      <AgenticChatMessage 
        message="Test message"
        agentic={mockAgenticData}
        onDownload={mockOnDownload}
      />
    );

    expect(screen.getByText('📄 Files tìm thấy (2)')).toBeInTheDocument();
    expect(screen.getByText('budget_2025.txt')).toBeInTheDocument();
    expect(screen.getByText('budget_2024.txt')).toBeInTheDocument();
  });

  test('shows file information correctly', () => {
    render(
      <AgenticChatMessage 
        message="Test message"
        agentic={mockAgenticData}
        onDownload={mockOnDownload}
      />
    );

    // Kiểm tra thông tin file
    expect(screen.getByText('📄 text/plain')).toBeInTheDocument();
    expect(screen.getByText('🎯 Điểm: 18')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Tài liệu quan trọng (90%)')).toBeInTheDocument();
  });

  test('shows file preview content', () => {
    render(
      <AgenticChatMessage 
        message="Test message"
        agentic={mockAgenticData}
        onDownload={mockOnDownload}
      />
    );

    expect(screen.getByText('📖 Preview nội dung:')).toBeInTheDocument();
    expect(screen.getByText(/Budget Plan for 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Total Allocated Budget: \$2,400,000/)).toBeInTheDocument();
  });

  test('shows classification reason', () => {
    render(
      <AgenticChatMessage 
        message="Test message"
        agentic={mockAgenticData}
        onDownload={mockOnDownload}
      />
    );

    expect(screen.getByText('🤖 Lý do phân loại:')).toBeInTheDocument();
    expect(screen.getByText(/Chứa thông tin về kế hoạch kinh doanh/)).toBeInTheDocument();
  });

  test('handles tab switching', () => {
    render(
      <AgenticChatMessage 
        message="Test message"
        agentic={mockAgenticData}
        onDownload={mockOnDownload}
      />
    );

    // Click vào tab thứ 2
    const secondTab = screen.getByText('budget_2024.txt');
    fireEvent.click(secondTab);

    // Kiểm tra xem có hiển thị thông tin file thứ 2 không
    expect(screen.getByText('🏷️ Tài liệu tài chính (80%)')).toBeInTheDocument();
  });

  test('handles download button click', () => {
    render(
      <AgenticChatMessage 
        message="Test message"
        agentic={mockAgenticData}
        onDownload={mockOnDownload}
      />
    );

    const downloadButton = screen.getByText('Tải file');
    fireEvent.click(downloadButton);

    expect(mockOnDownload).toHaveBeenCalledWith(
      "/api/user/files/download/48056c10-2f04-4cb2-a571-4c102326504c",
      "budget_2025.txt"
    );
  });

  test('renders summary grid for multiple files', () => {
    render(
      <AgenticChatMessage 
        message="Test message"
        agentic={mockAgenticData}
        onDownload={mockOnDownload}
      />
    );

    expect(screen.getByText('📋 Tóm tắt tất cả files:')).toBeInTheDocument();
    expect(screen.getByText('budget_2025.txt')).toBeInTheDocument();
    expect(screen.getByText('budget_2024.txt')).toBeInTheDocument();
  });

  test('handles empty agentic data gracefully', () => {
    render(
      <AgenticChatMessage 
        message="Test message"
        agentic={null}
        onDownload={mockOnDownload}
      />
    );

    // Không nên render gì khi không có agentic data
    expect(screen.queryByText('📄 Files tìm thấy')).not.toBeInTheDocument();
  });

  test('handles agentic data without files', () => {
    const agenticDataWithoutFiles = {
      execution_results: {
        chain_of_thought: "Test chain of thought without files",
        execution_results: []
      }
    };

    render(
      <AgenticChatMessage 
        message="Test message"
        agentic={agenticDataWithoutFiles}
        onDownload={mockOnDownload}
      />
    );

    // Chỉ hiển thị chain of thought
    expect(screen.getByText('Quá trình AI suy luận')).toBeInTheDocument();
    expect(screen.getByText(/Test chain of thought without files/)).toBeInTheDocument();
    expect(screen.queryByText('📄 Files tìm thấy')).not.toBeInTheDocument();
  });
}); 