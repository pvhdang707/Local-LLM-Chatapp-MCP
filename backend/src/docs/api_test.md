# API Testing Guide - Department Permission System

## 1. Register User với Department

### Register thông thường
**POST** `/api/auth/register`
```json
{
  "username": "user_sales",
  "password": "123456",
  "department": "Sales"
}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "user": {
    "id": "user_123",
    "username": "user_sales",
    "role": "user",
    "department": "Sales"
  }
}
```

### Register không có department
```json
{
  "username": "user_no_dept",
  "password": "123456"
}
```

### Register với department không hợp lệ
```json
{
  "username": "user_invalid",
  "password": "123456",
  "department": "Invalid"
}
```
**Response:** `400 Bad Request` - "Department phải là "Sales", "Tài chính", "HR" hoặc để trống"

## 2. Admin Register User với Department

### Admin tạo user với department
**POST** `/api/admin/register_user`
**Header:** `Authorization: Bearer <admin_token>`
```json
{
  "username": "admin_created_user",
  "password": "123456",
  "role": "user",
  "department": "Tài chính"
}
```

### Admin tạo admin với department
```json
{
  "username": "admin_finance",
  "password": "123456",
  "role": "admin",
  "department": "Tài chính"
}
```

## 3. Login và kiểm tra Department

### Login user
**POST** `/api/auth/login`
```json
{
  "username": "user_sales",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "user_123",
    "username": "user_sales",
    "role": "user",
    "department": "Sales"
  }
}
```

## 4. Test File Upload với Department

### User upload file (tự động gắn department)
**POST** `/api/user/files`
**Header:** `Authorization: Bearer <user_sales_token>`
**Body:** `form-data`
- file: (chọn file)

**Response:**
```json
{
  "success": true,
  "message": "Upload file thành công",
  "file": {
    "id": "file_123",
    "original_name": "document.pdf",
    "file_type": "pdf",
    "uploaded_by": "user_sales",
    "department": "Sales",
    "uploaded_at": "2024-01-01T00:00:00Z"
  }
}
```

## 5. Test File Access theo Department

### User lấy file trong department của mình
**GET** `/api/user/files`
**Header:** `Authorization: Bearer <user_sales_token>`

**Response:** Chỉ thấy file của department "Sales"

### Admin lấy tất cả file
**GET** `/api/user/files`
**Header:** `Authorization: Bearer <admin_token>`

**Response:** Thấy tất cả file của mọi department

## 6. Test Chat với File theo Department

### User chat với file trong department của mình
**POST** `/api/chat`
**Header:** `Authorization: Bearer <user_sales_token>`
```json
{
  "message": "Tìm kiếm thông tin trong file này",
  "file_id": "file_sales_123"
}
```

### User thử chat với file ngoài department
**POST** `/api/chat`
**Header:** `Authorization: Bearer <user_sales_token>`
```json
{
  "message": "Tìm kiếm thông tin trong file này",
  "file_id": "file_hr_456"
}
```

**Response:** `403 Forbidden` - "Không có quyền truy cập department này"

## 7. Admin Management

### Admin cập nhật department cho user
**PUT** `/api/admin/users/<user_id>/department`
**Header:** `Authorization: Bearer <admin_token>`
```json
{
  "department": "HR"
}
```

### Admin lấy danh sách user với department
**GET** `/api/admin/users`
**Header:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_123",
      "username": "user_sales",
      "role": "user",
      "department": "Sales",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 8. Test Cases cần kiểm tra

### Test Case 1: User Sales
1. Register user với department "Sales"
2. Login và lấy token
3. Upload file (file sẽ gắn với Sales)
4. Lấy danh sách file (chỉ thấy file Sales)
5. Chat với file Sales (thành công)
6. Thử chat với file HR (bị từ chối)

### Test Case 2: User HR
1. Register user với department "HR"
2. Login và lấy token
3. Upload file (file sẽ gắn với HR)
4. Lấy danh sách file (chỉ thấy file HR)
5. Chat với file HR (thành công)
6. Thử chat với file Sales (bị từ chối)

### Test Case 3: Admin
1. Login admin
2. Lấy tất cả file (thấy tất cả)
3. Chat với file bất kỳ (thành công)
4. Cập nhật department cho user
5. Tạo user mới với department

### Test Case 4: Department Changes
1. Admin cập nhật user từ Sales sang HR
2. User login lại
3. Lấy danh sách file (chỉ thấy file HR)
4. Upload file mới (file gắn với HR)

## 9. Error Cases

### Invalid Department
```json
{
  "username": "test",
  "password": "123456",
  "department": "Invalid"
}
```
**Expected:** 400 Bad Request

### Missing Required Fields
```json
{
  "username": "test"
}
```
**Expected:** 400 Bad Request

### Duplicate Username
```json
{
  "username": "existing_user",
  "password": "123456",
  "department": "Sales"
}
```
**Expected:** 400 Bad Request - "Username đã tồn tại"

## 10. Postman Collection Variables

### Environment Variables
- `base_url`: `http://localhost:5000/api`
- `admin_token`: Token của admin
- `user_sales_token`: Token của user Sales
- `user_hr_token`: Token của user HR
- `user_finance_token`: Token của user Tài chính

### Collection Variables
- `user_sales_id`: ID của user Sales
- `user_hr_id`: ID của user HR
- `file_sales_id`: ID của file thuộc Sales
- `file_hr_id`: ID của file thuộc HR
