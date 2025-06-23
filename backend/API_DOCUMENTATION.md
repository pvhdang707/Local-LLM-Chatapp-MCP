# API Documentation - Local LLM Chat App

## Tổng quan
Tất cả các endpoints (trừ `/status`, `/auth/login`, `/chat/public`) đều yêu cầu authentication thông qua JWT token.

## Authentication

### 1. Đăng nhập
```http
POST /auth/login
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "username": "admin",
    "password": "admin123"
}
```

**Response thành công:**
```json
{
    "success": true,
    "message": "Đăng nhập thành công",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "user_id",
        "username": "admin",
        "role": "admin"
    }
}
```

**Response lỗi:**
```json
{
    "success": false,
    "message": "Mật khẩu không đúng"
}
```

### 2. Sử dụng token
Tất cả các request khác cần include token trong header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints

### Public Endpoints (Không cần authentication)

#### 1. Kiểm tra trạng thái server
```http
GET /status
```

**Response:**
```json
{
    "status": "running",
    "message": "Server is running",
    "auth_required": "true",
    "timestamp": "2025-06-23T09:42:50.361085"
}
```

#### 2. Chat public (không cần đăng nhập)
```http
POST /chat/public
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "msg": "What is the capital of Vietnam?",
    "urls": ["url1", "url2"]
}
```

**Response:**
```json
{
    "answer": "The capital of Vietnam is Hanoi. It has been the capital since 1945 and is the country's political, economic, and cultural center.",
    "steps": ["load_file_documents", "retrieve_documents", "generate_answer", "store"],
    "user": "public",
    "question": "What is the capital of Vietnam?",
    "note": "This is a public endpoint for testing"
}
```

### Authentication Endpoints

#### 2. Lấy thông tin profile (yêu cầu auth)
```http
GET /auth/profile
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
    "id": "user_id",
    "username": "admin",
    "role": "admin",
    "created_at": "2025-06-23T09:29:47.869521",
    "is_active": true
}
```

### User Endpoints (Yêu cầu authentication)

#### 3. Lấy danh sách files của user
```http
GET /user/files
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
    "files": [
        {
            "id": "file_id",
            "original_name": "document.pdf",
            "stored_name": "document_1.pdf",
            "file_size": 1024000,
            "file_type": "application/pdf",
            "uploaded_by": "admin",
            "uploaded_at": "2025-06-23T10:00:00",
            "is_active": true
        }
    ]
}
```

#### 4. Upload file (user)
```http
POST /user/files
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
```
file: [file_data]
```

**Response thành công:**
```json
{
    "success": true,
    "message": "File uploaded successfully",
    "file": {
        "id": "file_id",
        "original_name": "document.pdf",
        "stored_name": "document_1.pdf",
        "file_size": 1024000,
        "file_type": "application/pdf",
        "uploaded_by": "admin",
        "uploaded_at": "2025-06-23T10:00:00",
        "is_active": true
    }
}
```

#### 5. Chat với AI
```http
POST /chat
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "msg": "What is the capital of Vietnam?",
    "urls": ["url1", "url2"]
}
```

**Response:**
```json
{
    "answer": "The capital of Vietnam is Hanoi. It has been the capital since 1945 and is the country's political, economic, and cultural center.",
    "steps": ["load_file_documents", "retrieve_documents", "generate_answer", "store"],
    "user": "admin",
    "question": "What is the capital of Vietnam?"
}
```

### Admin Endpoints (Yêu cầu quyền admin)

#### 6. Đăng ký user mới (chỉ admin)
```http
POST /auth/register
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "username": "newuser",
    "password": "password123",
    "role": "user"
}
```

**Response thành công:**
```json
{
    "success": true,
    "message": "Đăng ký thành công",
    "user": {
        "id": "user_id",
        "username": "newuser",
        "role": "user"
    }
}
```

**Response lỗi:**
```json
{
    "success": false,
    "message": "Username đã tồn tại"
}
```

#### 7. Tạo user mới (chỉ admin)
```http
POST /admin/users/create
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "username": "newuser2",
    "password": "password123",
    "role": "user"
}
```

**Response thành công:**
```json
{
    "success": true,
    "message": "Đã tạo user newuser2 thành công",
    "user": {
        "id": "user_id",
        "username": "newuser2",
        "role": "user"
    }
}
```

#### 8. Lấy danh sách tất cả users
```http
GET /admin/users
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
    "users": [
        {
            "id": "user_id_1",
            "username": "admin",
            "role": "admin",
            "created_at": "2025-06-23T09:29:47.869521",
            "is_active": true
        },
        {
            "id": "user_id_2",
            "username": "newuser",
            "role": "user",
            "created_at": "2025-06-23T10:00:00",
            "is_active": true
        }
    ]
}
```

#### 9. Xóa user
```http
DELETE /admin/users/{user_id}
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response thành công:**
```json
{
    "success": true,
    "message": "Xóa user thành công"
}
```

#### 10. Cập nhật role user
```http
PUT /admin/users/{user_id}/role
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "role": "admin"
}
```

**Response thành công:**
```json
{
    "success": true,
    "message": "Cập nhật role thành công"
}
```

#### 11. Lấy danh sách tất cả files
```http
GET /admin/files
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
    "files": [
        {
            "id": "file_id",
            "original_name": "document.pdf",
            "stored_name": "document_1.pdf",
            "file_size": 1024000,
            "file_type": "application/pdf",
            "uploaded_by": "admin",
            "uploaded_at": "2025-06-23T10:00:00",
            "is_active": true
        }
    ],
    "stats": {
        "total_files": 10,
        "active_files": 8,
        "total_size_bytes": 10485760,
        "total_size_mb": 10.0,
        "file_types": {
            "application/pdf": 5,
            "text/plain": 3
        }
    }
}
```

#### 12. Upload file (admin)
```http
POST /admin/files
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
```
file: [file_data]
```

**Response thành công:**
```json
{
    "success": true,
    "message": "File uploaded successfully",
    "file": {
        "id": "file_id",
        "original_name": "document.pdf",
        "stored_name": "document_1.pdf",
        "file_size": 1024000,
        "file_type": "application/pdf",
        "uploaded_by": "admin",
        "uploaded_at": "2025-06-23T10:00:00",
        "is_active": true
    }
}
```

#### 13. Xóa file
```http
DELETE /admin/files/{file_id}
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response thành công:**
```json
{
    "success": true,
    "message": "File deleted successfully"
}
```

#### 14. Cập nhật trạng thái file
```http
PUT /admin/files/{file_id}/status
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "is_active": false
}
```

**Response thành công:**
```json
{
    "success": true,
    "message": "File status updated successfully"
}
```

#### 15. Dọn dẹp files orphaned
```http
POST /admin/files/cleanup
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
    "success": true,
    "message": "Cleanup completed",
    "deleted_files": 5,
    "freed_space_mb": 2.5
}
```

### System Endpoints

#### 16. Health check (yêu cầu auth)
```http
GET /health
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
    "status": "healthy",
    "message": "Server is running",
    "auth_system": "enabled",
    "user": "admin",
    "role": "admin"
}
```

## Error Responses

### 400 Bad Request
```json
{
    "error": "Username và password không được để trống"
}
```

### 401 Unauthorized
```json
{
    "error": "Token không được cung cấp"
}
```
hoặc
```json
{
    "error": "Token không hợp lệ hoặc đã hết hạn"
}
```

### 403 Forbidden
```json
{
    "error": "Không có quyền truy cập. Yêu cầu quyền admin."
}
```

### 404 Not Found
```json
{
    "error": "User không tồn tại"
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal server error"
}
```

## Tài khoản mặc định
- **Admin**: `admin` / `admin123`
- **User**: Chỉ admin mới có thể tạo user mới

## Lưu ý
- Token có thời hạn 24 giờ
- Tất cả endpoints đều yêu cầu authentication (trừ những endpoint được liệt kê ở trên)
- **Chỉ admin mới có thể tạo user mới**
- Role "admin" có quyền truy cập tất cả endpoints
- Role "user" chỉ có quyền truy cập các endpoints user
- File upload sử dụng `multipart/form-data`
- Tất cả JSON responses đều có encoding UTF-8 