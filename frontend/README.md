# Frontend - Local LLM Chat Application

Ứng dụng chat sử dụng React và Tailwind CSS, cho phép người dùng tương tác với local LLM model.

## Lưu ý:
- Đây **CHỈ LÀ BẢN DRAFT**, mô tả các luồng hoạt động và giao diện.
- Ứng dụng chưa có backend thực sự, các chức năng chỉ mô phỏng giao diện.
- **Đăng nhập**: Có thể sử dụng username và password tùy ý.
- **Quyền Admin**: Sử dụng username "admin" để truy cập trang quản trị.
- Dữ liệu được lưu trữ tạm thời và sẽ bị mất khi refresh trang.

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── components/         # Các component tái sử dụng
│   │   ├── Navbar.jsx     # Thanh điều hướng
│   │   ├── Sidebar.jsx    # Thanh bên cho lịch sử chat
│   │   ├── ChatHistory.jsx # Hiển thị lịch sử chat
│   │   ├── Loading.jsx    # Component loading
│   │   └── Welcome.jsx    # Màn hình chào mừng
│   ├── pages/             # Các trang chính
│   │   ├── Login.jsx      # Trang đăng nhập
│   │   ├── ChatPage.jsx   # Trang chat chính
│   │   ├── AdminPage.jsx  # Trang quản trị (chỉ cho admin)
│   │   └── FileManager.jsx # Trang quản lý file
│   ├── contexts/          # React Context
│   │   └── AuthContext.jsx # Quản lý xác thực và phân quyền
│   ├── services/          # Các service API
│   └── App.jsx           # Component gốc
```



## Chức năng chính

### 1. Đăng nhập (`Login.jsx`)
- Form đăng nhập đơn giản
- Lưu thông tin người dùng vào localStorage
- Chuyển hướng đến trang chat sau khi đăng nhập

### 2. Chat (`ChatPage.jsx`)
- Giao diện chat với AI
- Quản lý lịch sử chat
- Tạo/xóa phiên chat
- Hiển thị trạng thái loading
- Tự động cập nhật tiêu đề chat

### 3. Trang quản trị (`AdminPage.jsx`) - *Chỉ hiển thị khi đăng nhập với username "admin"*
- Hiển thị thống kê hệ thống
- Quản lý người dùng (xem, tạo, xóa)
- Quản lý file với icons trực quan theo loại file
- Thông tin phòng ban của người dùng
- Biểu đồ thống kê hoạt động

### 4. Quản lý File (`FileManager.jsx`)
- Hiển thị danh sách file
- Sắp xếp theo tên, kích thước, loại, ngày sửa
- Lọc file theo loại
- Upload file mới
- Xem thông tin chi tiết file
- Xóa file

### 5. Components chung
- `Navbar`: Thanh điều hướng với menu và nút đăng xuất
- `Sidebar`: Hiển thị danh sách các phiên chat
- `ChatHistory`: Hiển thị lịch sử tin nhắn
- `Loading`: Hiển thị trạng thái đang tải
- `Welcome`: Màn hình chào mừng khi chưa có tin nhắn

## Công nghệ sử dụng
- React
- React Router
- Tailwind CSS
- Heroicons

## Cài đặt và chạy

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng ở môi trường development:
```bash
npm start
```

3. Build cho production:
```bash
npm run build
```

## Thông tin đăng nhập mẫu

| Username | Password | Vai trò |
|----------|----------|---------|
| admin    | bất kỳ   | Admin (có quyền truy cập trang quản trị) |
| user1    | bất kỳ   | Người dùng thường |

*Lưu ý: Vì đây là bản demo, bạn có thể đăng nhập với bất kỳ username/password nào. Nhưng chỉ tài khoản với username là "admin" mới có quyền truy cập trang quản trị.*
