# Swagger Documentation - Local LLM Chat App

## Tổng quan

Swagger documentation đã được cải thiện đầy đủ cho tất cả các API endpoints với thông tin chi tiết về:
- Parameters (headers, path, query, body)
- Authentication (JWT Bearer tokens)
- Request/Response schemas
- Examples cho tất cả responses
- Error handling

## Cách truy cập Swagger UI

1. Khởi động server:
```bash
cd backend
python app.py
```

2. Truy cập Swagger UI:
```
http://localhost:5000/apidocs/
```

## Các nhóm API (Tags)

### 1. Auth
- **POST** `/api/auth/login` - Đăng nhập
- **GET** `/api/auth/profile` - Lấy thông tin profile
- **POST** `/api/admin/register_user` - Admin tạo user mới
- **GET** `/api/admin/users` - Admin xem danh sách users
- **PUT** `/api/admin/users/{user_id}` - Admin cập nhật user
- **DELETE** `/api/admin/users/{user_id}` - Admin xóa user

### 2. Chat
- **POST** `/api/chat/sessions` - Tạo chat session mới
- **GET** `/api/chat/sessions` - Lấy danh sách chat sessions
- **GET** `/api/chat/sessions/{session_id}` - Lấy messages trong session
- **POST** `/api/chat/sessions/{session_id}/send` - Gửi message trong session
- **DELETE** `/api/chat/sessions/{session_id}` - Xóa chat session
- **PUT** `/api/chat/sessions/{session_id}/title` - Cập nhật tiêu đề session
- **POST** `/api/chat` - Legacy chat endpoint
- **POST** `/api/chat/enhanced` - Enhanced chat với tìm kiếm file

### 3. Enhanced Chat
- **POST** `/api/chat/enhanced` - Enhanced chat với tích hợp tìm kiếm file và phân loại

### 4. File
- **GET** `/api/user/files` - Lấy danh sách files của user
- **POST** `/api/user/files` - Upload file
- **GET** `/api/user/files/enhanced` - Lấy files với thông tin chi tiết
- **GET** `/api/user/files/download/{file_id}` - Tải file
- **POST** `/api/files/{file_id}/classify` - Phân loại file
- **POST** `/api/files/classify/batch` - Phân loại nhiều files
- **GET** `/api/files/groups` - Lấy danh sách nhóm files
- **GET** `/api/files/{file_id}/metadata` - Lấy metadata file
- **POST** `/api/files/metadata/batch` - Gửi metadata batch

### 5. Search
- **POST** `/api/search/files` - Tìm kiếm file
- **GET** `/api/search/files/suggestions` - Gợi ý từ khóa tìm kiếm

### 6. System
- **GET** `/api/system/status` - Kiểm tra trạng thái server
- **GET** `/api/system/health` - Kiểm tra sức khỏe hệ thống

## Authentication

Hầu hết các API endpoints yêu cầu authentication bằng JWT Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

### Cách lấy token:
1. Admin tạo user: `POST /api/admin/register_user` (chỉ admin)
2. Đăng nhập: `POST /api/auth/login` → nhận `access_token`
3. Sử dụng token trong header: `Authorization: Bearer <access_token>`

## Request/Response Examples

### Đăng nhập thành công:
```json
{
  "success": true,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "123",
    "username": "user1",
    "role": "user"
  }
}
```

### Upload file thành công:
```json
{
  "success": true,
  "message": "Upload file thành công",
  "file": {
    "id": "file_123",
    "original_name": "document.pdf",
    "file_type": "pdf",
    "file_size": 1024000,
    "uploaded_by": "user1",
    "uploaded_at": "2024-01-01T00:00:00Z"
  }
}
```

### Tìm kiếm file:
```json
{
  "query": "kế hoạch 2024",
  "search_type": "both",
  "total": 5,
  "results": [
    {
      "id": "file_123",
      "name": "ke_hoach_2024.pdf",
      "file_type": "pdf",
      "match_score": 0.85,
      "uploaded_by": "user1",
      "uploaded_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Error Responses

### 400 Bad Request:
```json
{
  "error": "Message không được để trống"
}
```

### 401 Unauthorized:
```json
{
  "error": "Token không hợp lệ"
}
```

### 403 Forbidden:
```json
{
  "error": "Chỉ admin mới được phép thực hiện thao tác này"
}
```

### 404 Not Found:
```json
{
  "error": "File không tồn tại"
}
```

### 500 Internal Server Error:
```json
{
  "error": "Lỗi server nội bộ"
}
```

## Testing với Swagger UI

1. **Test Authentication:**
   - Click vào "Authorize" button ở đầu trang
   - Nhập: `Bearer <your_token>`
   - Click "Authorize"

2. **Test Endpoints:**
   - Chọn endpoint muốn test
   - Click "Try it out"
   - Điền parameters cần thiết
   - Click "Execute"

3. **View Responses:**
   - Swagger sẽ hiển thị response với status code
   - Có thể xem curl command để test từ terminal

## File Upload

Để upload file, sử dụng `multipart/form-data`:
- Parameter name: `file`
- Type: `file`
- Chọn file từ máy tính

## Tips

1. **Luôn kiểm tra Authorization header** cho các protected endpoints
2. **Sử dụng đúng Content-Type** (application/json cho body, multipart/form-data cho file upload)
3. **Kiểm tra response status codes** để xử lý lỗi
4. **Sử dụng examples** trong Swagger để hiểu format dữ liệu
5. **Test từng endpoint** trước khi tích hợp vào ứng dụng

## Troubleshooting

### Lỗi 401 Unauthorized:
- Kiểm tra token có hợp lệ không
- Token có hết hạn chưa
- Format header có đúng không: `Bearer <token>`

### Lỗi 400 Bad Request:
- Kiểm tra required fields
- Validate data types
- Kiểm tra file size limits

### Lỗi 500 Internal Server Error:
- Kiểm tra server logs
- Đảm bảo database connection
- Kiểm tra file system permissions 