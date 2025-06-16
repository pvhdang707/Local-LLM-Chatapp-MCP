# Frontend - Local LLM Chat Application

Ứng dụng chat sử dụng React và Tailwind CSS, cho phép người dùng tương tác với mô hình ngôn ngữ địa phương.

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
│   │   └── FileManager.jsx # Trang quản lý file
│   ├── contexts/          # React Context
│   ├── services/          # Các service API
│   └── App.jsx           # Component gốc
```

## Lưu ý:
- Bản nháp, chỉ mô tả luồng hoạt động đơn giản.

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

### 3. Quản lý File (`FileManager.jsx`)
- Hiển thị danh sách file
- Sắp xếp theo tên, kích thước, loại, ngày sửa
- Lọc file theo loại
- Upload file mới
- Xem thông tin chi tiết file
- Xóa file

### 4. Components chung
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
