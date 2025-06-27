# Hướng dẫn Test API trên Postman

## 🚀 Setup Postman

### 1. Tạo Collection mới
- Tạo collection tên: `Local LLM Chat App API`
- Base URL: `http://localhost:8000`

### 2. Tạo Environment Variables
Tạo environment với các variables:
- `base_url`: `http://localhost:8000`
- `token`: (sẽ được set sau khi login)
- `session_id`: (sẽ được set sau khi tạo session)
- `user_id`: (sẽ được set sau khi login)

---

## 📋 Luồng Test Chi Tiết

### 🔐 Bước 1: Authentication

#### 1.1 Đăng nhập Admin
```
POST {{base_url}}/auth/login
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

#### 1.2 Test Health Check (cần auth)
```
GET {{base_url}}/health
Authorization: Bearer {{token}}
```

---

### 👤 Bước 2: User Management (Admin)

#### 2.1 Tạo User mới
```
POST {{base_url}}/auth/register
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "username": "testuser",
    "password": "password123",
    "role": "user"
}
```

#### 2.2 Lấy danh sách Users
```
GET {{base_url}}/admin/users
Authorization: Bearer {{token}}
```

#### 2.3 Cập nhật Role User
```
PUT {{base_url}}/admin/users/{{user_id}}/role
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "role": "admin"
}
```

---

### 📁 Bước 3: File Management

#### 3.1 Upload File (User)
```
POST {{base_url}}/user/files
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

Body (form-data):
Key: file
Type: File
Value: [chọn file PDF hoặc text]
```

#### 3.2 Lấy danh sách Files của User
```
GET {{base_url}}/user/files
Authorization: Bearer {{token}}
```

#### 3.3 Upload File (Admin)
```
POST {{base_url}}/admin/files
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

Body (form-data):
Key: file
Type: File
Value: [chọn file PDF hoặc text]
```

#### 3.4 Lấy danh sách tất cả Files (Admin)
```
GET {{base_url}}/admin/files
Authorization: Bearer {{token}}
```

---

### 💬 Bước 4: Chat Session (Private)

#### 4.1 Tạo Chat Session mới
```
POST {{base_url}}/chat/sessions
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

#### 4.2 Lấy danh sách Chat Sessions
```
GET {{base_url}}/chat/sessions
Authorization: Bearer {{token}}
```

#### 4.3 Gửi Message đầu tiên
```
POST {{base_url}}/chat/sessions/{{session_id}}/send
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "message": "Xin chào, bạn có thể giải thích về AI không?",
    "file_urls": []
}
```

#### 4.4 Gửi Message tiếp theo (test context memory)
```
POST {{base_url}}/chat/sessions/{{session_id}}/send
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "message": "Bạn có thể nói thêm về machine learning không?",
    "file_urls": []
}
```

#### 4.5 Lấy Messages trong Session
```
GET {{base_url}}/chat/sessions/{{session_id}}?limit=10
Authorization: Bearer {{token}}
```

#### 4.6 Cập nhật tiêu đề Session
```
PUT {{base_url}}/chat/sessions/{{session_id}}/title
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "title": "Updated Chat Title"
}
```

---

### 🌐 Bước 5: Public Chat Session

#### 5.1 Tạo Public Chat Session
```
POST {{base_url}}/chat/public/sessions
Content-Type: application/json

Body (raw JSON):
{
    "title": "Public Test Chat",
    "username": "anonymous"
}
```

**Lưu public_session_id:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("public_session_id", response.session.id);
}
```

#### 5.2 Gửi Message trong Public Session
```
POST {{base_url}}/chat/public/sessions/{{public_session_id}}/send
Content-Type: application/json

Body (raw JSON):
{
    "message": "Xin chào từ public chat!",
    "username": "anonymous",
    "file_urls": []
}
```

---

### 🔄 Bước 6: Legacy Chat (Backward Compatibility)

#### 6.1 Chat cũ (cần auth)
```
POST {{base_url}}/chat
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
    "message": "Test legacy chat",
    "file_urls": []
}
```

#### 6.2 Public Chat cũ
```
POST {{base_url}}/chat/public
Content-Type: application/json

Body (raw JSON):
{
    "message": "Test public legacy chat",
    "file_urls": []
}
```

---

### 🧹 Bước 7: Cleanup (Admin)

#### 7.1 Xóa File
```
DELETE {{base_url}}/admin/files/{file_id}
Authorization: Bearer {{token}}
```

#### 7.2 Xóa User
```
DELETE {{base_url}}/admin/users/{user_id}
Authorization: Bearer {{token}}
```

#### 7.3 Xóa Chat Session
```
DELETE {{base_url}}/chat/sessions/{{session_id}}
Authorization: Bearer {{token}}
```

#### 7.4 Dọn dẹp Files Orphaned
```
POST {{base_url}}/admin/files/cleanup
Authorization: Bearer {{token}}
```

---

## 🎯 Test Cases Quan Trọng

### Test Context Memory
1. Tạo session mới
2. Gửi: "Tôi tên là John"
3. Gửi: "Bạn nhớ tên tôi không?"
4. **Expected**: AI nhớ tên John

### Test File Upload + Chat
1. Upload file PDF
2. Tạo session mới
3. Gửi message với file_urls
4. **Expected**: AI phân tích file

### Test Session Isolation
1. Tạo 2 sessions khác nhau
2. Gửi message khác nhau trong mỗi session
3. **Expected**: Mỗi session có context riêng

### Test Error Handling
1. Gửi request không có token
2. Gửi request với token sai
3. Gửi request với session_id không tồn tại
4. **Expected**: Error responses phù hợp

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

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **401 Unauthorized**
   - Kiểm tra token có đúng không
   - Token có hết hạn không (24h)

2. **404 Not Found**
   - Kiểm tra URL endpoint
   - Kiểm tra session_id/user_id có tồn tại không

3. **500 Internal Server Error**
   - Kiểm tra server có chạy không
   - Kiểm tra database connection

4. **Context Memory không hoạt động**
   - Đảm bảo dùng cùng session_id
   - Kiểm tra có ít nhất 2 messages trong session

---

## 🚀 Quick Start Script

Tạo Pre-request Script cho collection:

```javascript
// Auto-setup environment
if (!pm.environment.get("base_url")) {
    pm.environment.set("base_url", "http://localhost:5000");
}

// Auto-login if no token
if (!pm.environment.get("token")) {
    console.log("No token found, please login first");
}
```

---

## 📝 Notes

- **Token expires**: 24 giờ
- **Context memory**: 5 messages gần nhất
- **File support**: PDF, text files
- **Session isolation**: Mỗi session có context riêng
- **Backward compatibility**: API cũ vẫn hoạt động

Chạy theo thứ tự này để test đầy đủ tất cả tính năng! 🎉 