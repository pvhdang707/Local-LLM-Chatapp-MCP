# Cập nhật Frontend cho Department Support

## Tổng quan
Đã cập nhật frontend để hỗ trợ hệ thống phân quyền theo department từ commit "authorize role".

## Những thay đổi chính

### 1. Authentication & Authorization
- **`authApi.js`**: Thêm lưu/đọc department từ localStorage
- **`AuthContext.jsx`**: Thêm department vào user state và authentication flow
- **`ProtectedRoute.jsx`**: Thêm kiểm tra department access

### 2. Admin Management
- **`CreateUserForm.jsx`**: Thêm field department khi tạo user mới
- **`UserTable.jsx`**: Hiển thị cột department trong bảng users
- **`UserManagementTab.jsx`**: Cập nhật search để hỗ trợ department
- **`EditUserModal.jsx`**: Thêm field department khi chỉnh sửa user
- **`adminApi.js`**: Cập nhật API calls để hỗ trợ department

### 3. File Management
- **`FileTable.jsx`**: Hiển thị department của files
- **`FileUploadModal.jsx`**: Thêm chọn department khi upload file

### 4. UI/UX Updates
- **`Navbar.jsx`**: Hiển thị department của user trong navigation
- **`DebugPanel.jsx`**: Thêm thông tin department trong debug panel

## Các tính năng mới

### Department-based Access Control
- Users chỉ có thể truy cập files của department của mình
- Admin có thể truy cập tất cả files
- Department được hiển thị trong UI ở nhiều nơi

### Enhanced User Management
- Tạo user với department
- Chỉnh sửa department của user
- Tìm kiếm user theo department
- Hiển thị department trong bảng users

### File Upload với Department
- Chọn department khi upload file
- Files được gán department khi upload
- Hiển thị department trong danh sách files

## Cách sử dụng

### 1. Đăng nhập với Department
```javascript
// User sẽ tự động nhận department từ backend
const user = {
  id: "123",
  username: "user1",
  role: "user",
  department: "Sales" // Mới
};
```

### 2. Tạo User với Department
```javascript
// Trong CreateUserForm
const newUser = {
  username: "newuser",
  password: "password",
  role: "user",
  department: "Sales" // Mới
};
```

### 3. Kiểm tra Department Access
```javascript
// Trong ProtectedRoute
<ProtectedRoute requireDepartment="Sales">
  <Component />
</ProtectedRoute>
```

### 4. Upload File với Department
```javascript
// Trong FileUploadModal
const uploadData = {
  file: file,
  department: "Sales", // Mới
  permissions: [...]
};
```

## Database Migration
Đảm bảo chạy migration script trước khi sử dụng:
```bash
cd backend
python migrate_department.py
```

## Testing
1. Tạo user với department
2. Đăng nhập và kiểm tra department hiển thị
3. Upload file với department
4. Kiểm tra phân quyền truy cập theo department

## Lưu ý
- Tất cả thay đổi đều backward compatible
- Không ảnh hưởng đến các chức năng khác
- Department được lưu trong localStorage và JWT token
- UI được cập nhật để hiển thị department ở nhiều nơi 