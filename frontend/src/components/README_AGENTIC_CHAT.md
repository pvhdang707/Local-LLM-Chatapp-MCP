# AgenticChatMessage Component

## Tổng quan

`AgenticChatMessage` là component React được thiết kế để hiển thị kết quả từ Agentic AI với các tính năng:

- **File Preview Tabs**: Hiển thị danh sách files tìm được dưới dạng tabs
- **Chain of Thought**: Hiển thị quá trình AI suy luận
- **File Classification**: Hiển thị kết quả phân loại files
- **Download Functionality**: Cho phép tải files về máy
- **Feedback System**: Cho phép người dùng phản hồi về phân loại

## Cách sử dụng

```jsx
import AgenticChatMessage from './AgenticChatMessage';

// Trong component cha
<AgenticChatMessage 
  message="Tin nhắn gốc"
  agentic={agenticData}
  onDownload={handleDownload}
/>
```

## Props

### `message` (string)
Tin nhắn gốc từ user hoặc bot.

### `agentic` (object)
Dữ liệu response từ Agentic AI, có cấu trúc:

```javascript
{
  execution_results: {
    chain_of_thought: "Quá trình AI suy luận...",
    execution_results: [
      {
        step: {
          action: "search_files",
          description: "Mô tả bước",
          parameters: { query: "từ khóa" }
        },
        result: {
          files: [
            {
              id: "file-id",
              name: "filename.txt",
              type: "text/plain",
              content_preview: "Nội dung preview...",
              download_url: "/api/download/url",
              match_score: 18,
              uploaded_at: "2025-07-12T18:27:03"
            }
          ]
        }
      },
      {
        step: {
          action: "classify_files"
        },
        result: {
          classifications: [
            {
              file_id: "file-id",
              classification: {
                group_name: "Tài liệu quan trọng",
                confidence: 0.9,
                reason: "Lý do phân loại"
              }
            }
          ]
        }
      }
    ]
  }
}
```

### `onDownload` (function)
Callback function được gọi khi user click nút download:

```javascript
const handleDownload = (downloadUrl, fileName) => {
  // Xử lý download file
  window.open(downloadUrl, '_blank');
};
```

## Tính năng chính

### 1. Chain of Thought Display
- Hiển thị quá trình AI suy luận
- Có thể thu gọn/mở rộng
- Styling với màu xanh dương

### 2. File Preview Tabs
- Hiển thị danh sách files dưới dạng tabs
- Mỗi tab có tên file và nút download
- Tab active được highlight

### 3. File Information
- Thông tin cơ bản: tên, loại, ngày upload
- Điểm match score
- Kết quả phân loại với confidence
- Nút download và feedback

### 4. File Content Preview
- Hiển thị nội dung preview của file
- Scrollable với max-height
- Format pre-wrap để giữ nguyên format

### 5. Classification Details
- Hiển thị lý do phân loại
- Confidence score
- Group name

### 6. Summary Grid
- Hiển thị tóm tắt tất cả files
- Grid layout responsive
- Thông tin ngắn gọn cho mỗi file

## Styling

Component sử dụng CSS classes với prefix `.agentic-chat-message`:

```css
.agentic-chat-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}
```

## Responsive Design

- Tabs scrollable trên mobile
- Grid layout responsive
- Font size và spacing tự động điều chỉnh

## Integration với ChatMessage

Component được tích hợp vào `ChatMessage` component:

```jsx
// Trong ChatMessage.jsx
{!isUser && agentic && (
  <AgenticChatMessage 
    message={displayMessage} 
    agentic={agentic} 
    onDownload={onDownload}
  />
)}
```

## Error Handling

- Xử lý gracefully khi không có agentic data
- Fallback khi không có files
- Validation cho các field bắt buộc

## Testing

Component có test suite đầy đủ trong `AgenticChatMessage.test.jsx`:

- Test rendering các section chính
- Test tab switching
- Test download functionality
- Test error cases

## Dependencies

- React (hooks: useState, useEffect)
- FeedbackModal component
- submitFeedback service
- CSS file: AgenticChatMessage.css

## Performance

- Lazy loading cho file preview
- Memoization cho expensive operations
- Optimized re-renders với React.memo

## Accessibility

- ARIA labels cho buttons
- Keyboard navigation cho tabs
- Screen reader friendly
- High contrast colors 