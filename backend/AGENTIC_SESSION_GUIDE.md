# Agentic AI Session Guide

## Tổng quan

Tính năng Agentic AI Session cho phép người dùng tạo và quản lý các phiên chat với Agentic AI, lưu trữ lịch sử tin nhắn và tái sử dụng các cuộc hội thoại trước đó.

## Tính năng chính

### 1. Session Management
- **Tạo session mới**: Tạo phiên chat mới với tiêu đề và mô tả
- **Lấy danh sách sessions**: Xem tất cả sessions của user
- **Xóa session**: Xóa session không cần thiết

### 2. Chat với Session
- **Gửi tin nhắn**: Chat với Agentic AI trong session
- **Lưu lịch sử**: Tự động lưu tất cả tin nhắn và kết quả
- **Xem lịch sử**: Xem lại các tin nhắn đã gửi trong session

### 3. Context Awareness
- **Session context**: Mỗi session có context riêng biệt
- **Message history**: Lưu trữ đầy đủ plan, execution results, summary
- **Status tracking**: Theo dõi trạng thái của từng tin nhắn

## API Endpoints

### 1. Tạo Session
```http
POST /api/agentic/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tìm kiếm file marketing",
  "description": "Session để tìm kiếm và phân tích file marketing"
}
```

### 2. Lấy Danh Sách Sessions
```http
GET /api/agentic/sessions?limit=20
Authorization: Bearer <token>
```

### 3. Lấy Tin Nhắn Của Session
```http
GET /api/agentic/sessions/{session_id}?limit=50
Authorization: Bearer <token>
```

### 4. Chat Với Session
```http
POST /api/agentic/sessions/{session_id}/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_request": "Tìm file có chứa từ khóa 'marketing' và xuất danh sách"
}
```

### 5. Xóa Session
```http
DELETE /api/agentic/sessions/{session_id}
Authorization: Bearer <token>
```

## Cấu trúc Database

### AgenticSession
```sql
CREATE TABLE agentic_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    username VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Agentic AI Session',
    description TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_messages INTEGER DEFAULT 0,
    last_activity DATETIME NOT NULL
);
```

### AgenticMessage
```sql
CREATE TABLE agentic_messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    username VARCHAR(50) NOT NULL,
    user_request TEXT NOT NULL,
    plan TEXT,  -- JSON string
    execution_results TEXT,  -- JSON string
    summary TEXT,  -- JSON string
    message_type VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'completed',
    created_at DATETIME NOT NULL,
    completed_at DATETIME,
    error_message TEXT
);
```

## Workflow Sử Dụng

### 1. Tạo Session Mới
```javascript
// Frontend example
const createSession = async () => {
  const response = await fetch('/api/agentic/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Tìm kiếm file marketing',
      description: 'Session để tìm kiếm và phân tích file marketing'
    })
  });
  
  const result = await response.json();
  return result.session.id;
};
```

### 2. Chat Với Session
```javascript
// Frontend example
const chatWithSession = async (sessionId, userRequest) => {
  const response = await fetch(`/api/agentic/sessions/${sessionId}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_request: userRequest
    })
  });
  
  const result = await response.json();
  return result;
};
```

### 3. Lấy Lịch Sử Chat
```javascript
// Frontend example
const getSessionHistory = async (sessionId) => {
  const response = await fetch(`/api/agentic/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result.messages;
};
```

## Response Format

### Session Response
```json
{
  "success": true,
  "session": {
    "id": "session_123",
    "user_id": "user_456",
    "username": "john_doe",
    "title": "Tìm kiếm file marketing",
    "description": "Session để tìm kiếm và phân tích file marketing",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "total_messages": 0,
    "last_activity": "2024-01-01T12:00:00Z"
  }
}
```

### Chat Response
```json
{
  "success": true,
  "session_id": "session_123",
  "message_id": "msg_456",
  "user_request": "Tìm file có chứa từ khóa 'marketing' và xuất danh sách",
  "plan": {
    "plan": [
      {
        "action": "search_files",
        "description": "Tìm kiếm file có chứa 'marketing'",
        "parameters": {"query": "marketing", "search_type": "both"},
        "order": 1
      }
    ],
    "expected_output": "Danh sách file tìm được",
    "estimated_steps": 1
  },
  "execution_results": {
    "success": true,
    "execution_results": [...],
    "summary": {
      "total_steps_completed": 1,
      "files_processed": 2
    }
  },
  "summary": {
    "total_steps": 1,
    "files_found": 2
  }
}
```

### Message History Response
```json
{
  "success": true,
  "session": {
    "id": "session_123",
    "title": "Tìm kiếm file marketing",
    "description": "Session để tìm kiếm và phân tích file marketing",
    "total_messages": 5
  },
  "messages": [
    {
      "id": "msg_123",
      "user_request": "Tìm file marketing 2024",
      "message_type": "user",
      "status": "completed",
      "created_at": "2024-01-01T12:00:00Z",
      "completed_at": "2024-01-01T12:00:30Z",
      "plan": {...},
      "execution_results": {...},
      "summary": {...}
    }
  ]
}
```

## Lợi ích

### 1. Context Continuity
- Duy trì context qua nhiều tin nhắn
- Có thể tham khảo kết quả trước đó
- Tạo ra cuộc hội thoại liên tục

### 2. History Management
- Lưu trữ đầy đủ lịch sử
- Có thể xem lại các cuộc hội thoại cũ
- Tái sử dụng thông tin đã có

### 3. Multi-session Support
- Mỗi user có thể có nhiều session
- Phân tách các chủ đề khác nhau
- Quản lý session độc lập

### 4. Status Tracking
- Theo dõi trạng thái của từng tin nhắn
- Biết được tin nhắn nào đã hoàn thành
- Xử lý lỗi và retry

## Testing

Chạy script test để kiểm tra tính năng:

```bash
cd backend
python test_agentic_session.py
```

Script sẽ test:
1. Tạo session mới
2. Lấy danh sách sessions
3. Chat với session
4. Lấy lịch sử tin nhắn
5. Xóa session

## Migration

Để cập nhật database với các bảng mới:

```bash
cd backend
python src/init_db.py
```

Hoặc chạy ứng dụng để tự động tạo bảng:

```bash
cd backend
python app.py
```

## Security

- Tất cả endpoints yêu cầu authentication
- User chỉ có thể truy cập sessions của mình
- Session ID được validate trước khi xử lý
- Error handling đầy đủ cho tất cả operations 