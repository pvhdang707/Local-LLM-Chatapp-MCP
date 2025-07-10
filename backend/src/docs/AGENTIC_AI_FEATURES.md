# 🤖 Agentic AI - Tự động lên kế hoạch hành động

## 📋 Tổng Quan

Agentic AI là chức năng mới được thêm vào hệ thống, cho phép AI tự động lên kế hoạch và thực hiện các hành động phức tạp dựa trên yêu cầu của người dùng.

## 🎯 Tính Năng Chính

### 1. **Tự động lên kế hoạch hành động**
- AI phân tích yêu cầu của user
- Tự động tạo kế hoạch các bước cần thực hiện
- Ước tính số bước và kết quả mong đợi

### 2. **Thực hiện hành động tự động**
- Tìm kiếm file theo tên/nội dung
- Phân loại file bằng AI
- Trích xuất metadata
- Xuất file Excel metadata
- Upload metadata lên cloud

### 3. **Multi-step workflow**
- Thực hiện nhiều bước liên tiếp
- Truyền kết quả từ bước trước sang bước sau
- Xử lý lỗi và rollback

## 🔧 API Endpoints

### 1. Lên kế hoạch hành động
```bash
POST /api/agentic/plan
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_request": "Tìm file 'kế hoạch marketing 2024' và xuất danh sách"
}
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "plan": [
      {
        "action": "search_files",
        "description": "Tìm kiếm file có chứa 'kế hoạch marketing 2024'",
        "parameters": {"query": "kế hoạch marketing 2024", "search_type": "both"},
        "order": 1
      },
      {
        "action": "classify_files",
        "description": "Phân loại các file tìm được",
        "parameters": {"file_ids": "dynamic"},
        "order": 2
      },
      {
        "action": "export_metadata",
        "description": "Xuất metadata ra file Excel",
        "parameters": {"file_ids": "dynamic", "output_format": "excel"},
        "order": 3
      }
    ],
    "expected_output": "Danh sách file tìm được với phân loại và file Excel metadata",
    "estimated_steps": 3
  },
  "user_request": "Tìm file 'kế hoạch marketing 2024' và xuất danh sách",
  "created_at": "2024-01-01T12:00:00Z"
}
```

### 2. Thực hiện kế hoạch
```bash
POST /api/agentic/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": {
    "plan": [...],
    "expected_output": "...",
    "estimated_steps": 3
  }
}
```

### 3. Lên kế hoạch và thực hiện ngay (One-step)
```bash
POST /api/agentic/plan-and-execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_request": "Tìm file 'kế hoạch marketing 2024' và xuất danh sách"
}
```

**Response:**
```json
{
  "success": true,
  "user_request": "Tìm file 'kế hoạch marketing 2024' và xuất danh sách",
  "plan": {...},
  "execution_results": {...},
  "summary": {
    "total_steps": 3,
    "files_found": 2,
    "export_file": "metadata_export_20240101_120000.xlsx"
  }
}
```

### 4. Lấy danh sách actions có sẵn
```bash
GET /api/agentic/available-actions
Authorization: Bearer <token>
```

## 📊 Các Actions Có Sẵn

### 1. **search_files**
- **Mô tả**: Tìm kiếm file theo tên hoặc nội dung
- **Parameters**: `query`, `search_type`
- **Kết quả**: Danh sách file tìm được

### 2. **classify_files**
- **Mô tả**: Phân loại file thành các nhóm
- **Parameters**: `file_ids`
- **Kết quả**: Thông tin phân loại cho từng file

### 3. **extract_metadata**
- **Mô tả**: Trích xuất thông tin metadata từ file
- **Parameters**: `file_ids`
- **Kết quả**: Metadata chi tiết của file

### 4. **export_metadata**
- **Mô tả**: Xuất metadata ra file Excel
- **Parameters**: `file_ids`, `output_format`
- **Kết quả**: File Excel với metadata

### 5. **upload_to_cloud**
- **Mô tả**: Gửi metadata lên cloud storage
- **Parameters**: `file_ids`
- **Kết quả**: Trạng thái upload

## 🎯 Ví Dụ Sử Dụng

### Ví dụ 1: Tìm file và xuất danh sách
```
User: "Tìm file 'kế hoạch marketing 2024' và xuất danh sách"

AI tự thực hiện:
1. Tìm file → index nội dung → phân loại → xuất metadata
2. Trả kết quả:
🔍 Đã tìm thấy:
- marketing_plan.pdf → Nhóm A
- sales_strategy.pdf → Nhóm B
Đã xuất file metadata.xlsx
```

### Ví dụ 2: Phân tích và báo cáo
```
User: "Phân tích tất cả file marketing và tạo báo cáo"

AI tự thực hiện:
1. Tìm kiếm file marketing
2. Phân loại từng file
3. Trích xuất metadata
4. Tạo báo cáo Excel
5. Upload lên cloud
```

## 🔄 Quy Trình Hoạt Động

```
1. User gửi yêu cầu
   ↓
2. AI phân tích yêu cầu
   ↓
3. Tạo kế hoạch hành động
   ↓
4. Thực hiện từng bước
   ↓
5. Truyền kết quả giữa các bước
   ↓
6. Tạo summary và trả về
```

## 📁 Cấu Trúc File

### Backend
```
backend/src/
├── agentic_ai.py              # Module Agentic AI chính
├── controllers/
│   └── agentic_ai_controller.py  # API endpoints
└── uploads/
    └── exports/               # Thư mục chứa file Excel exports
```

### API Endpoints
- `POST /api/agentic/plan` - Lên kế hoạch
- `POST /api/agentic/execute` - Thực hiện kế hoạch
- `POST /api/agentic/plan-and-execute` - Lên kế hoạch và thực hiện
- `GET /api/agentic/available-actions` - Lấy danh sách actions
- `GET /api/files/download/export/<filename>` - Download file Excel

## 🚀 Cách Sử Dụng

### 1. Test với Postman
```bash
# Bước 1: Đăng nhập lấy token
POST /api/auth/login
{
  "username": "user1",
  "password": "123123"
}

# Bước 2: Sử dụng Agentic AI
POST /api/agentic/plan-and-execute
Authorization: Bearer <token>
{
  "user_request": "Tìm file 'kế hoạch marketing 2024' và xuất danh sách"
}
```

### 2. Test với cURL
```bash
# Lên kế hoạch
curl -X POST http://localhost:5000/api/agentic/plan \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"user_request": "Tìm file marketing và xuất danh sách"}'

# Thực hiện kế hoạch
curl -X POST http://localhost:5000/api/agentic/execute \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"plan": {...}}'
```

## 📈 Kết Quả Đạt Được

✅ **Agentic AI hoàn chỉnh** với khả năng lên kế hoạch tự động
✅ **Multi-step workflow** thực hiện nhiều hành động liên tiếp
✅ **Xuất file Excel** với metadata đầy đủ
✅ **Tích hợp với hệ thống hiện có** (search, classify, cloud)
✅ **API endpoints đầy đủ** với documentation
✅ **Xử lý lỗi và rollback** an toàn

Bây giờ hệ thống đã có đầy đủ chức năng Agentic AI như yêu cầu! 🎉 