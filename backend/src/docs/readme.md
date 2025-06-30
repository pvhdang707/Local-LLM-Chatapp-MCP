# Local LLM Chat App

Ứng dụng chat AI sử dụng Local Large Language Model (LLM) với khả năng xử lý tài liệu và RAG (Retrieval-Augmented Generation).

## 🚀 Tính năng chính

- **Chat với AI**: Tương tác với model Mistral thông qua Ollama
- **Xử lý tài liệu**: Upload và phân tích các loại file (PDF, DOC, TXT, v.v.)
- **RAG (Retrieval-Augmented Generation)**: Tìm kiếm thông tin từ tài liệu đã upload
- **Authentication**: Hệ thống đăng nhập/đăng ký với JWT
- **Vector Database**: Sử dụng FAISS để lưu trữ embeddings
- **Modern UI**: Giao diện React với Tailwind CSS

## 📋 Yêu cầu hệ thống

### Backend (Python)
- Python 3.8+
- MySQL Database
- Ollama (để chạy local LLM)

### Frontend (React)
- Node.js 16+
- npm hoặc yarn

## 🛠️ Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd Local-LLM-Chatapp-MCP
```

### 2. Cài đặt Ollama
Truy cập [ollama.ai](https://ollama.ai) và tải về Ollama cho hệ điều hành của bạn.

Sau khi cài đặt, chạy:
```bash
ollama pull mistral
ollama pull nomic-embed-text
```

### 3. Cài đặt Backend

```bash
cd backend

# Tạo virtual environment (khuyến nghị)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate     # Windows

# Cài đặt dependencies
pip install -r requirements.txt
```

### 4. Cài đặt Frontend

```bash
cd frontend
npm install
```

## ⚙️ Cấu hình

### 1. Tạo file .env trong thư mục backend

```bash
# Database Configuration
MYSQL_DATABASE=mysql://username:password@localhost:3306/database_name

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# LLM Configuration
OLLAMA_BASE_URL=http://localhost:11434

# Server Configuration
SERVER__HOST=0.0.0.0
SERVER__PORT=8000

# Ollama Configuration
OLLAMA__HOST=http://localhost:11434
OLLAMA__EMBEDDING_MODEL=nomic-embed-text
OLLAMA__RAG=mistral

# FAISS Configuration
FAISS__INDEX_PATH=./data/index.bin
FAISS__DOCUMENT_STORE_PATH=./data/docstore.npy
FAISS__MAP_ID_PATH=./data/map_id.npy

# Cloudinary Configuration (tùy chọn)
CLOUDINARY__CLOUD_NAME=your_cloud_name
CLOUDINARY__API_KEY=your_api_key
CLOUDINARY__API_SECRET=your_api_secret
```

### 2. Khởi tạo Database

```bash
cd backend
python init_db.py
```

## 🚀 Chạy ứng dụng

### 1. Khởi động Backend

```bash
cd backend
python app.py
```

Backend sẽ chạy tại: `http://localhost:8000`

### 2. Khởi động Frontend

```bash
cd frontend
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 📁 Cấu trúc dự án

```
Local-LLM-Chatapp-MCP/
├── backend/
│   ├── app.py              # Flask application chính
│   ├── auth.py             # Xử lý authentication
│   ├── chat_manager.py     # Quản lý chat sessions
│   ├── config.py           # Cấu hình ứng dụng
│   ├── database.py         # Database models và connections
│   ├── file_manager.py     # Xử lý file upload/download
│   ├── llm.py              # Tương tác với Ollama LLM
│   ├── vectordb.py         # Vector database operations
│   ├── requirements.txt    # Python dependencies
│   ├── data/               # FAISS index và document store
│   ├── uploads/            # Thư mục lưu file upload
│   └── docs/               # Tài liệu
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # React pages
│   │   ├── services/       # API services
│   │   └── contexts/       # React contexts
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind CSS config
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất

### Chat
- `POST /chat/send` - Gửi tin nhắn
- `GET /chat/history` - Lấy lịch sử chat
- `DELETE /chat/clear` - Xóa lịch sử chat

### File Management
- `POST /upload` - Upload file
- `GET /files` - Lấy danh sách file
- `DELETE /files/<file_id>` - Xóa file

### Admin
- `GET /admin/users` - Quản lý users (admin only)
- `DELETE /admin/users/<user_id>` - Xóa user (admin only)

## 🎯 Sử dụng

1. **Đăng ký/Đăng nhập**: Tạo tài khoản hoặc đăng nhập vào hệ thống
2. **Upload tài liệu**: Upload các file PDF, DOC, TXT để AI có thể tham khảo
3. **Chat với AI**: Bắt đầu cuộc trò chuyện với AI, AI sẽ sử dụng thông tin từ tài liệu đã upload
4. **Quản lý file**: Xem và xóa các file đã upload

## 🐛 Troubleshooting

### Lỗi Ollama không kết nối
- Đảm bảo Ollama đang chạy: `ollama serve`
- Kiểm tra URL trong config: `http://localhost:11434`

### Lỗi Database
- Kiểm tra thông tin kết nối MySQL trong file .env
- Đảm bảo database đã được tạo và khởi tạo

### Lỗi CORS
- Backend đã được cấu hình CORS cho frontend
- Kiểm tra URL frontend trong config nếu cần

## 📝 Ghi chú

- Model Mistral yêu cầu ít nhất 8GB RAM để chạy mượt mà
- File upload giới hạn 16MB
- Hỗ trợ các định dạng: txt, pdf, png, jpg, jpeg, gif, doc, docx, xls, xlsx, ppt, pptx

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License.