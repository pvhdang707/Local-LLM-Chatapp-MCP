# Hướng dẫn Test API các Chức Năng Chính trên Postman (Chuẩn hóa)

## 🚀 Setup Postman

### 1. Tạo Collection mới
- Tạo collection tên: `Local LLM Chat App API - Refactored`
- Base URL: `http://localhost:5000`

### 2. Tạo Environment Variables
Tạo environment với các variables:
- `base_url`: `http://localhost:5000`
- `token`: (sẽ được set sau khi login)
- `session_id`: (sẽ được set sau khi tạo session)
- `user_id`: (sẽ được set sau khi login)

---

## 📋 Luồng Test Chi Tiết - Refactored Structure

### 🔐 Bước 1: Authentication (`/api/auth/*`)

#### 1.1 Đăng nhập Admin
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

Body (raw JSON):
{
    "username": "admin",
    "password": "admin123"
}
```

**Lưu token vào environment:**
- Trong Tests tab, thêm script:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    pm.environment.set("user_id", response.user.id);
    console.log("Token saved:", response.token);
}
```

#### 1.2 Lấy Profile User
```
GET {{base_url}}/api/auth/profile
Authorization: Bearer {{token}}
```

#### 1.3 Đăng ký User mới (Admin only)
```
POST {{base_url}}/api/auth/register
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "username": "testuser",
    "password": "password123",
    "role": "user"
}
```

---

### 👤 Bước 2: Admin Management (`/api/admin/*`)

#### 2.1 Lấy danh sách Users
```
GET {{base_url}}/api/admin/users
Authorization: Bearer {{token}}
```

#### 2.2 Cập nhật Role User
```
PUT {{base_url}}/api/admin/users/{{user_id}}/role
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "role": "admin"
}
```

#### 2.3 Tạo User mới (Admin)
```
POST {{base_url}}/api/admin/users/create
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "username": "newuser",
    "password": "password123",
    "role": "user"
}
```

#### 2.4 Xóa User
```
DELETE {{base_url}}/api/admin/users/{{user_id}}
Authorization: Bearer {{token}}
```

---

### 📁 Bước 3: File Management (`/api/file/*`)

#### 3.1 Upload File (User)
```
POST {{base_url}}/api/file/user/files
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

Body (form-data):
Key: file
Type: File
Value: [chọn file PDF hoặc text]
```

#### 3.2 Lấy danh sách Files của User
```
GET {{base_url}}/api/file/user/files
Authorization: Bearer {{token}}
```

#### 3.3 Lấy Files với thông tin chi tiết
```
GET {{base_url}}/api/file/user/files/enhanced
Authorization: Bearer {{token}}
```

#### 3.4 Upload File (Admin)
```
POST {{base_url}}/api/admin/files
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

Body (form-data):
Key: file
Type: File
Value: [chọn file PDF hoặc text]
```

#### 3.5 Lấy danh sách tất cả Files (Admin)
```
GET {{base_url}}/api/admin/files
Authorization: Bearer {{token}}
```

#### 3.6 Phân loại File bằng AI
```
POST {{base_url}}/api/file/files/{file_id}/classify
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{}
```

#### 3.7 Phân loại nhiều Files
```
POST {{base_url}}/api/file/files/classify/batch
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "file_ids": ["file_id_1", "file_id_2"]
}
```

#### 3.8 Lấy nhóm Files theo phân loại
```
GET {{base_url}}/api/file/files/groups
Authorization: Bearer {{token}}
```

#### 3.9 Lấy Metadata của File
```
GET {{base_url}}/api/file/files/{file_id}/metadata
Authorization: Bearer {{token}}
```

#### 3.10 Gửi Metadata lên Cloud
```
POST {{base_url}}/api/file/files/metadata/batch
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "file_ids": ["file_id_1", "file_id_2"]
}
```

---

### 🔍 Bước 4: File Search (`/api/search/*`)

#### 4.1 Tìm kiếm Files
```
POST {{base_url}}/api/search/search/files
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "query": "kế hoạch 2024"
}
```

#### 4.2 Lấy gợi ý tìm kiếm
```
GET {{base_url}}/api/search/search/files/suggestions?query=AI
Authorization: Bearer {{token}}
```

---

### 💬 Bước 5: Chat Session (`/api/chat/*`)

#### 5.1 Tạo Chat Session mới
```
POST {{base_url}}/api/chat/sessions
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "title": "Test Chat Session"
}
```

**Lưu session_id vào environment:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("session_id", response.session.id);
    console.log("Session ID saved:", response.session.id);
}
```

#### 5.2 Lấy danh sách Chat Sessions
```
GET {{base_url}}/api/chat/sessions
Authorization: Bearer {{token}}
```

#### 5.3 Gửi Message trong Session
```
POST {{base_url}}/api/chat/sessions/{{session_id}}/send
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "message": "Tìm file có 'kế hoạch 2024'"
}
```

#### 5.4 Lấy Messages trong Session
```
GET {{base_url}}/api/chat/sessions/{{session_id}}?limit=10
Authorization: Bearer {{token}}
```

#### 5.5 Cập nhật tiêu đề Session
```
PUT {{base_url}}/api/chat/sessions/{{session_id}}/title
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "title": "Updated Chat Title"
}
```

#### 5.6 Xóa Chat Session
```
DELETE {{base_url}}/api/chat/sessions/{{session_id}}
Authorization: Bearer {{token}}
```

---

### 🌐 Bước 6: Public Chat (`/api/public_chat/*`)

#### 6.1 Tạo Public Chat Session
```
POST {{base_url}}/api/public_chat/chat/public/sessions
Content-Type: application/json

Body (raw JSON):
{
    "title": "Public Test Chat"
}
```

**Lưu public_session_id:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("public_session_id", response.session.id);
}
```

#### 6.2 Gửi Message trong Public Session
```
POST {{base_url}}/api/public_chat/chat/public/sessions/{{public_session_id}}/send
Content-Type: application/json

Body (raw JSON):
{
    "message": "Xin chào từ public chat!"
}
```

#### 6.3 Public Chat (Legacy)
```
POST {{base_url}}/api/public_chat/chat/public
Content-Type: application/json

Body (raw JSON):
{
    "message": "Test public legacy chat"
}
```

---

### 🚀 Bước 7: Enhanced Chat (`/api/enhanced_chat/*`)

#### 7.1 Enhanced Chat với File Search
```
POST {{base_url}}/api/enhanced_chat/chat/enhanced
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "message": "Tìm kiếm tài liệu về AI",
    "search_files": true,
    "include_classification": true
}
```

---

### 🔧 Bước 8: System Status (`/api/system/*`)

#### 8.1 Kiểm tra Server Status
```
GET {{base_url}}/api/system/status
```

#### 8.2 Health Check (cần auth)
```
GET {{base_url}}/api/system/health
Authorization: Bearer {{token}}
```

---

### 🧹 Bước 9: Cleanup (Admin)

#### 9.1 Cập nhật trạng thái File
```
PUT {{base_url}}/api/admin/files/{file_id}/status
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "status": "approved"
}
```

#### 9.2 Xóa File (Admin)
```
DELETE {{base_url}}/api/admin/files/{file_id}
Authorization: Bearer {{token}}
```

#### 9.3 Dọn dẹp Files Orphaned
```
POST {{base_url}}/api/admin/files/cleanup
Authorization: Bearer {{token}}
```

---

## 🎯 Test Cases Quan Trọng - Refactored

### Test Controller Isolation
1. Test mỗi controller riêng biệt
2. **Expected**: Mỗi controller hoạt động độc lập

### Test API Prefix
1. Tất cả endpoints phải có `/api` prefix
2. **Expected**: Không có endpoint nào thiếu prefix

### Test Enhanced Features
1. Test file search integration
2. Test AI classification
3. Test cloud metadata
4. **Expected**: Tất cả tính năng mới hoạt động

### Test Backward Compatibility
1. Test các endpoint cũ vẫn hoạt động
2. **Expected**: Không có breaking changes

---

## 📊 Environment Variables Checklist

Đảm bảo các variables được set đúng:

```javascript
// Pre-request Script để check variables
console.log("Base URL:", pm.environment.get("base_url"));
console.log("Token:", pm.environment.get("token"));
console.log("Session ID:", pm.environment.get("session_id"));
console.log("User ID:", pm.environment.get("user_id"));
```

---

## 🔧 Troubleshooting - Refactored

### Lỗi thường gặp:

1. **404 Not Found**
   - Kiểm tra URL có `/api` prefix không
   - Kiểm tra controller route đúng không

2. **Import Error**
   - Kiểm tra tất cả controllers được import trong `__init__.py`
   - Kiểm tra blueprints được register đúng không

3. **Route Conflict**
   - Kiểm tra không có route trùng lặp
   - Kiểm tra blueprint names unique

4. **Module Not Found**
   - Kiểm tra imports trong controllers
   - Kiểm tra file paths đúng

---

## 🚀 Quick Start Script - Refactored

Tạo Pre-request Script cho collection:

```javascript
// Auto-setup environment for refactored backend
if (!pm.environment.get("base_url")) {
    pm.environment.set("base_url", "http://localhost:5000");
}

// Auto-login if no token
if (!pm.environment.get("token")) {
    console.log("No token found, please login first");
}

// Log current endpoint being tested
console.log("Testing endpoint:", pm.request.url);
```

---

## 📝 Notes - Refactored Backend

- **New Structure**: 8 controllers với Blueprints
- **API Prefix**: Tất cả endpoints có `/api` prefix
- **Modular Design**: Mỗi controller xử lý một nhóm chức năng
- **Enhanced Features**: File search, AI classification, cloud integration
- **Backward Compatibility**: API cũ vẫn hoạt động
- **Better Organization**: Code dễ maintain và scale

### Controller Mapping:
- `/api/auth/*` - Authentication & User Management
- `/api/chat/*` - Private Chat Sessions
- `/api/admin/*` - Admin Management
- `/api/file/*` - File Management & Classification
- `/api/search/*` - File Search
- `/api/system/*` - System Status
- `/api/public_chat/*` - Public Chat
- `/api/enhanced_chat/*` - Enhanced Chat with File Integration

Chạy theo thứ tự này để test đầy đủ tất cả tính năng của backend đã refactor! 🎉 