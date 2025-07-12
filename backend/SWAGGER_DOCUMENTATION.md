# Swagger Documentation - Local LLM Chat App

## Tổng quan

Swagger documentation đã được cải thiện đầy đủ cho tất cả các API endpoints với thông tin chi tiết về:
- Parameters (headers, path, query, body)
- Authentication (JWT Bearer tokens)
- Request/Response schemas
- Examples cho tất cả responses
- Error handling
- Security definitions

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

## Cấu hình Swagger

Swagger đã được cấu hình với:
- **Security**: JWT Bearer token authentication
- **Tags**: Phân loại endpoints theo chức năng
- **Schemes**: HTTP và HTTPS
- **Base Path**: `/api`
- **Version**: 1.0.0

## Các nhóm API (Tags)

### 1. Auth - Authentication
- **POST** `/api/auth/login` - Đăng nhập
- **POST** `/api/auth/register` - Đăng ký user mới
- **GET** `/api/auth/profile` - Lấy thông tin profile

### 2. Admin - Admin Management
- **POST** `/api/admin/register_user` - Admin tạo user mới
- **GET** `/api/admin/users` - Admin xem danh sách users
- **PUT** `/api/admin/users/{user_id}` - Admin cập nhật user
- **DELETE** `/api/admin/users/{user_id}` - Admin xóa user
- **POST** `/api/admin/upload_file` - Admin upload file
- **POST** `/api/admin/upload_files_batch` - Admin upload nhiều files

### 3. Chat - Chat Session Management
- **POST** `/api/chat/sessions` - Tạo chat session mới
- **GET** `/api/chat/sessions` - Lấy danh sách chat sessions
- **GET** `/api/chat/sessions/{session_id}` - Lấy messages trong session
- **POST** `/api/chat/sessions/{session_id}/send` - Gửi message trong session
- **DELETE** `/api/chat/sessions/{session_id}` - Xóa chat session
- **PUT** `/api/chat/sessions/{session_id}/title` - Cập nhật tiêu đề session
- **POST** `/api/chat` - Legacy chat endpoint
- **POST** `/api/chat/enhanced` - Enhanced chat với tìm kiếm file

### 4. Enhanced Chat - Enhanced Chat Features
- **POST** `/api/chat/enhanced` - Enhanced chat với tích hợp tìm kiếm file và phân loại

### 5. File - File Management
- **GET** `/api/user/files` - Lấy danh sách files của user
- **POST** `/api/user/files` - Upload file
- **GET** `/api/user/files/enhanced` - Lấy files với thông tin chi tiết
- **GET** `/api/user/files/download/{file_id}` - Tải file
- **DELETE** `/api/user/files/{file_id}` - Xóa file
- **POST** `/api/user/files/batch` - Upload nhiều files
- **POST** `/api/files/{file_id}/classify` - Phân loại file
- **POST** `/api/files/classify/batch` - Phân loại nhiều files
- **GET** `/api/files/groups` - Lấy danh sách nhóm files
- **GET** `/api/files/{file_id}/metadata` - Lấy metadata file
- **POST** `/api/files/metadata/batch` - Gửi metadata batch
- **GET** `/api/files/download/export/{filename}` - Tải file export

### 6. Search - File Search
- **POST** `/api/search/files` - Tìm kiếm file
- **GET** `/api/search/files/suggestions` - Gợi ý từ khóa tìm kiếm

### 7. System - System Status
- **GET** `/api/system/status` - Kiểm tra trạng thái server
- **GET** `/api/system/health` - Kiểm tra sức khỏe hệ thống

### 8. Agentic AI - Agentic AI Features
- **POST** `/api/agentic_ai/process` - Xử lý với Agentic AI
- **GET** `/api/agentic_ai/status` - Trạng thái Agentic AI

### 9. Feedback - Feedback System
- **POST** `/api/feedback` - Gửi feedback về phân loại file

## Authentication

Hầu hết các API endpoints yêu cầu authentication bằng JWT Bearer token:

```json
Authorization: Bearer <your_jwt_token>
```

### Security Definition:
```yaml
Bearer:
  type: apiKey
  name: Authorization
  in: header
  description: JWT Authorization header using the Bearer scheme
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
    "role": "user",
    "department": "Sales"
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

### Enhanced Chat Response:
```json
{
    "chain_of_thought": "Quá trình AI tìm kiếm và phân loại các file...",
    "files": [
        {
            "classification": {
                "confidence": 0.8,
                "group_id": "B",
                "group_name": "Tài liệu marketing",
                "method": "ai_based",
                "reason": "Contains information related to job interview"
            },
            "download_url": "/api/user/files/download/3fc76dd4-4b53-4fa9-a529-c94aa5df05ea",
            "match_score": 6,
            "name": "sample.txt",
            "type": "text/plain",
            "uploaded_by": "c314b7c3-c63d-4f04-b707-390f104f0883"
        }
    ],
    "is_file_search": true,
    "metadata_results": [
        {
            "classification": {
                "confidence": 0.8,
                "group_id": "B",
                "group_name": "Tài liệu marketing",
                "method": "ai_based",
                "reason": "Contains information related to job interview"
            },
            "cloud_result": {
                "success": false,
                "error": "Cloudinary API error: 400"
            },
            "file_id": "3fc76dd4-4b53-4fa9-a529-c94aa5df05ea"
        }
    ],
    "response": "Đã tìm thấy 2 file, metadata đã gửi.",
    "success": true
}
```

### Feedback Request:
```json
{
  "file_name": "sample.txt",
  "original_group": "B",
  "corrected_group": "E"
}
```

### Feedback Response:
```json
{
    "message": "Đã ghi nhận phản hồi"
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

### 413 Request Entity Too Large:
```json
{
  "error": "File quá lớn, vượt quá giới hạn cho phép"
}
```

### 500 Internal Server Error:
```json
{
  "error": "Lỗi server nội bộ"
}
```

## Testing với Swagger UI

### 1. Authorize:
- Click vào "Authorize" button ở đầu trang
- Nhập: `Bearer <your_token>`
- Click "Authorize"

### 2. Test Endpoints:
- Chọn endpoint muốn test
- Click "Try it out"
- Điền parameters cần thiết
- Click "Execute"

### 3. View Responses:
- Swagger sẽ hiển thị response với status code
- Có thể xem curl command để test từ terminal

## File Upload

Để upload file, sử dụng `multipart/form-data`:
- Parameter name: `file`
- Type: `file`
- Chọn file từ máy tính

## Department Access Control

Hệ thống hỗ trợ phân quyền theo department:
- **Sales**: Chỉ xem files của Sales
- **Tài chính**: Chỉ xem files của Tài chính  
- **HR**: Chỉ xem files của HR
- **Admin**: Xem tất cả files

## Tips

1. **Luôn kiểm tra Authorization header** cho các protected endpoints
2. **Sử dụng đúng Content-Type** (application/json cho body, multipart/form-data cho file upload)
3. **Kiểm tra response status codes** để xử lý lỗi
4. **Sử dụng examples** trong Swagger để hiểu format dữ liệu
5. **Test từng endpoint** trước khi tích hợp vào ứng dụng
6. **Kiểm tra department permissions** khi truy cập files

## Troubleshooting

### Lỗi 401 Unauthorized:
- Kiểm tra token có hợp lệ không
- Token có hết hạn chưa
- Format header có đúng không: `Bearer <token>`

### Lỗi 400 Bad Request:
- Kiểm tra required fields
- Validate data types
- Kiểm tra file size limits

### Lỗi 403 Forbidden:
- Kiểm tra user role (admin/user)
- Kiểm tra department permissions
- Kiểm tra endpoint access rights

### Lỗi 413 Request Entity Too Large:
- Giảm kích thước file upload
- Kiểm tra server file size limits

### Lỗi 500 Internal Server Error:
- Kiểm tra server logs
- Đảm bảo database connection
- Kiểm tra file system permissions

## API Versioning

- **Current Version**: 1.0.0
- **Base Path**: `/api`
- **Future versions**: Sẽ sử dụng `/api/v2/` format

## Rate Limiting

Hiện tại chưa có rate limiting, nhưng có thể được thêm trong tương lai:
- Login attempts: 5 per minute
- File uploads: 10 per minute
- API calls: 100 per minute

## Security Best Practices

1. **Always use HTTPS** in production
2. **Validate all inputs** before processing
3. **Sanitize file uploads** to prevent malicious files
4. **Use strong passwords** for admin accounts
5. **Regular token rotation** for security
6. **Monitor API usage** for suspicious activity 