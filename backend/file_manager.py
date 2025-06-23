import os
import json
from typing import Dict, List, Optional
from datetime import datetime
import shutil

# File để lưu trữ thông tin files
FILES_DB_FILE = "files_db.json"
UPLOAD_FOLDER = "uploads"

class FileManager:
    def __init__(self):
        self.files_db: List[Dict] = []
        self.upload_folder = UPLOAD_FOLDER
        self.files_db_path = FILES_DB_FILE
        
        # Tạo thư mục upload nếu chưa có
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)
        
        self.load_files_db()

    def load_files_db(self):
        """Load database files từ file"""
        if os.path.exists(self.files_db_path):
            try:
                with open(self.files_db_path, 'r', encoding='utf-8') as f:
                    self.files_db = json.load(f)
            except Exception as e:
                print(f"Error loading files database: {e}")
                self.files_db = []

    def save_files_db(self):
        """Lưu database files vào file"""
        try:
            with open(self.files_db_path, 'w', encoding='utf-8') as f:
                json.dump(self.files_db, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving files database: {e}")

    def add_file(self, file, uploaded_by: str) -> Dict:
        """Thêm file mới"""
        try:
            if not file or file.filename == '':
                return {"success": False, "message": "Không có file được chọn"}

            # Tạo tên file unique
            filename = file.filename
            base_name, ext = os.path.splitext(filename)
            counter = 1
            while os.path.exists(os.path.join(self.upload_folder, filename)):
                filename = f"{base_name}_{counter}{ext}"
                counter += 1

            # Lưu file
            file_path = os.path.join(self.upload_folder, filename)
            file.save(file_path)

            # Lưu thông tin file vào database
            file_info = {
                "id": self._generate_file_id(),
                "original_name": file.filename,
                "stored_name": filename,
                "file_path": file_path,
                "file_size": os.path.getsize(file_path),
                "file_type": file.content_type or "unknown",
                "uploaded_by": uploaded_by,
                "uploaded_at": datetime.now().isoformat(),
                "is_active": True
            }

            self.files_db.append(file_info)
            self.save_files_db()

            return {
                "success": True,
                "message": "Upload file thành công",
                "file": {
                    "id": file_info["id"],
                    "original_name": file_info["original_name"],
                    "stored_name": file_info["stored_name"],
                    "file_size": file_info["file_size"],
                    "file_type": file_info["file_type"],
                    "uploaded_by": file_info["uploaded_by"],
                    "uploaded_at": file_info["uploaded_at"]
                }
            }

        except Exception as e:
            return {"success": False, "message": f"Lỗi khi upload file: {str(e)}"}

    def delete_file(self, file_id: str) -> Dict:
        """Xóa file"""
        file_info = self.get_file_by_id(file_id)
        if not file_info:
            return {"success": False, "message": "File không tồn tại"}

        try:
            # Xóa file vật lý
            if os.path.exists(file_info["file_path"]):
                os.remove(file_info["file_path"])

            # Xóa khỏi database
            self.files_db = [f for f in self.files_db if f["id"] != file_id]
            self.save_files_db()

            return {"success": True, "message": "Xóa file thành công"}

        except Exception as e:
            return {"success": False, "message": f"Lỗi khi xóa file: {str(e)}"}

    def get_file_by_id(self, file_id: str) -> Optional[Dict]:
        """Lấy thông tin file theo ID"""
        return next((f for f in self.files_db if f["id"] == file_id), None)

    def get_file_path(self, file_id: str) -> Optional[str]:
        """Lấy đường dẫn file theo ID"""
        file_info = self.get_file_by_id(file_id)
        if file_info and os.path.exists(file_info["file_path"]):
            return file_info["file_path"]
        return None

    def get_all_files(self) -> List[Dict]:
        """Lấy danh sách tất cả files"""
        return [
            {
                "id": f["id"],
                "original_name": f["original_name"],
                "stored_name": f["stored_name"],
                "file_size": f["file_size"],
                "file_type": f["file_type"],
                "uploaded_by": f["uploaded_by"],
                "uploaded_at": f["uploaded_at"],
                "is_active": f["is_active"]
            }
            for f in self.files_db if f["is_active"]
        ]

    def get_files_by_user(self, username: str) -> List[Dict]:
        """Lấy danh sách files của user cụ thể"""
        return [
            {
                "id": f["id"],
                "original_name": f["original_name"],
                "stored_name": f["stored_name"],
                "file_size": f["file_size"],
                "file_type": f["file_type"],
                "uploaded_by": f["uploaded_by"],
                "uploaded_at": f["uploaded_at"],
                "is_active": f["is_active"]
            }
            for f in self.files_db if f["uploaded_by"] == username and f["is_active"]
        ]

    def update_file_status(self, file_id: str, is_active: bool) -> Dict:
        """Cập nhật trạng thái file"""
        file_info = self.get_file_by_id(file_id)
        if not file_info:
            return {"success": False, "message": "File không tồn tại"}

        file_info["is_active"] = is_active
        self.save_files_db()

        return {
            "success": True, 
            "message": f"File đã được {'kích hoạt' if is_active else 'vô hiệu hóa'}"
        }

    def get_file_stats(self) -> Dict:
        """Lấy thống kê về files"""
        total_files = len(self.files_db)
        active_files = len([f for f in self.files_db if f["is_active"]])
        total_size = sum(f["file_size"] for f in self.files_db if f["is_active"])
        
        # Thống kê theo loại file
        file_types = {}
        for f in self.files_db:
            if f["is_active"]:
                file_type = f["file_type"]
                file_types[file_type] = file_types.get(file_type, 0) + 1

        return {
            "total_files": total_files,
            "active_files": active_files,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "file_types": file_types
        }

    def _generate_file_id(self) -> str:
        """Tạo ID unique cho file"""
        import uuid
        return str(uuid.uuid4())

    def cleanup_orphaned_files(self) -> Dict:
        """Dọn dẹp các file không có trong database"""
        try:
            db_files = {f["stored_name"] for f in self.files_db}
            physical_files = set(os.listdir(self.upload_folder))
            orphaned_files = physical_files - db_files
            
            deleted_count = 0
            for filename in orphaned_files:
                file_path = os.path.join(self.upload_folder, filename)
                try:
                    os.remove(file_path)
                    deleted_count += 1
                except Exception as e:
                    print(f"Error deleting orphaned file {filename}: {e}")

            return {
                "success": True,
                "message": f"Đã dọn dẹp {deleted_count} file orphaned",
                "deleted_count": deleted_count
            }

        except Exception as e:
            return {"success": False, "message": f"Lỗi khi dọn dẹp: {str(e)}"}

# Khởi tạo FileManager
file_manager = FileManager() 