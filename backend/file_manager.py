import os
import uuid
from typing import Dict, List, Optional
from datetime import datetime
import shutil
from database import get_db, File as DBFile

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
            db = next(get_db())
            try:
                file_info = DBFile(
                    id=str(uuid.uuid4()),
                    original_name=file.filename,
                    stored_name=filename,
                    file_path=file_path,
                    file_size=os.path.getsize(file_path),
                    file_type=file.content_type or "unknown",
                    uploaded_by=uploaded_by,
                    uploaded_at=datetime.utcnow(),
                    is_active=True
                )

                db.add(file_info)
                db.commit()
                db.refresh(file_info)

                return {
                    "success": True,
                    "message": "Upload file thành công",
                    "file": {
                        "id": file_info.id,
                        "original_name": file_info.original_name,
                        "stored_name": file_info.stored_name,
                        "file_size": file_info.file_size,
                        "file_type": file_info.file_type,
                        "uploaded_by": file_info.uploaded_by,
                        "uploaded_at": file_info.uploaded_at.isoformat() if file_info.uploaded_at else None
                    }
                }

            except Exception as e:
                db.rollback()
                # Xóa file vật lý nếu lưu database thất bại
                if os.path.exists(file_path):
                    os.remove(file_path)
                return {"success": False, "message": f"Lỗi khi lưu thông tin file: {str(e)}"}
            finally:
                db.close()

        except Exception as e:
            return {"success": False, "message": f"Lỗi khi upload file: {str(e)}"}

    def delete_file(self, file_id: str) -> Dict:
        """Xóa file"""
        db = next(get_db())
        try:
            file_info = db.query(DBFile).filter(DBFile.id == file_id).first()
            if not file_info:
                return {"success": False, "message": "File không tồn tại"}

            # Xóa file vật lý
            if os.path.exists(file_info.file_path):
                os.remove(file_info.file_path)

            # Xóa khỏi database
            db.delete(file_info)
            db.commit()

            return {"success": True, "message": "Xóa file thành công"}

        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Lỗi khi xóa file: {str(e)}"}
        finally:
            db.close()

    def get_file_by_id(self, file_id: str) -> Optional[Dict]:
        """Lấy thông tin file theo ID"""
        db = next(get_db())
        try:
            file_info = db.query(DBFile).filter(DBFile.id == file_id).first()
            if file_info:
                return {
                    "id": file_info.id,
                    "original_name": file_info.original_name,
                    "stored_name": file_info.stored_name,
                    "file_path": file_info.file_path,
                    "file_size": file_info.file_size,
                    "file_type": file_info.file_type,
                    "uploaded_by": file_info.uploaded_by,
                    "uploaded_at": file_info.uploaded_at.isoformat() if file_info.uploaded_at else None,
                    "is_active": file_info.is_active
                }
            return None
        except Exception as e:
            print(f"Error getting file by ID: {e}")
            return None
        finally:
            db.close()

    def get_file_path(self, file_id: str) -> Optional[str]:
        """Lấy đường dẫn file theo ID"""
        file_info = self.get_file_by_id(file_id)
        if file_info and os.path.exists(file_info["file_path"]):
            return file_info["file_path"]
        return None

    def get_all_files(self) -> List[Dict]:
        """Lấy danh sách tất cả files"""
        db = next(get_db())
        try:
            files = db.query(DBFile).filter(DBFile.is_active == True).all()
            return [
                {
                    "id": f.id,
                    "original_name": f.original_name,
                    "stored_name": f.stored_name,
                    "file_size": f.file_size,
                    "file_type": f.file_type,
                    "uploaded_by": f.uploaded_by,
                    "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
                    "is_active": f.is_active
                }
                for f in files
            ]
        except Exception as e:
            print(f"Error getting all files: {e}")
            return []
        finally:
            db.close()

    def get_files_by_user(self, username: str) -> List[Dict]:
        """Lấy danh sách files của user cụ thể"""
        db = next(get_db())
        try:
            files = db.query(DBFile).filter(
                DBFile.uploaded_by == username,
                DBFile.is_active == True
            ).all()
            return [
                {
                    "id": f.id,
                    "original_name": f.original_name,
                    "stored_name": f.stored_name,
                    "file_size": f.file_size,
                    "file_type": f.file_type,
                    "uploaded_by": f.uploaded_by,
                    "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
                    "is_active": f.is_active
                }
                for f in files
            ]
        except Exception as e:
            print(f"Error getting files by user: {e}")
            return []
        finally:
            db.close()

    def update_file_status(self, file_id: str, is_active: bool) -> Dict:
        """Cập nhật trạng thái file"""
        db = next(get_db())
        try:
            file_info = db.query(DBFile).filter(DBFile.id == file_id).first()
            if not file_info:
                return {"success": False, "message": "File không tồn tại"}

            file_info.is_active = is_active
            db.commit()

            return {
                "success": True, 
                "message": f"File đã được {'kích hoạt' if is_active else 'vô hiệu hóa'}"
            }

        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Lỗi khi cập nhật trạng thái file: {str(e)}"}
        finally:
            db.close()

    def get_file_stats(self) -> Dict:
        """Lấy thống kê về files"""
        db = next(get_db())
        try:
            total_files = db.query(DBFile).count()
            active_files = db.query(DBFile).filter(DBFile.is_active == True).count()
            
            # Tính tổng kích thước
            active_file_sizes = db.query(DBFile.file_size).filter(DBFile.is_active == True).all()
            total_size = sum(size[0] for size in active_file_sizes if size[0])
            
            # Thống kê theo loại file
            file_types_query = db.query(DBFile.file_type, db.func.count(DBFile.id)).filter(
                DBFile.is_active == True
            ).group_by(DBFile.file_type).all()
            
            file_types = {file_type: count for file_type, count in file_types_query}

            return {
                "total_files": total_files,
                "active_files": active_files,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "file_types": file_types
            }
        except Exception as e:
            print(f"Error getting file stats: {e}")
            return {
                "total_files": 0,
                "active_files": 0,
                "total_size_bytes": 0,
                "total_size_mb": 0,
                "file_types": {}
            }
        finally:
            db.close()

    def cleanup_orphaned_files(self) -> Dict:
        """Dọn dẹp các file không có trong database"""
        try:
            db = next(get_db())
            try:
                # Lấy danh sách files trong database
                db_files = db.query(DBFile.stored_name).all()
                db_file_names = {f[0] for f in db_files}
                
                # Lấy danh sách files vật lý
                physical_files = set(os.listdir(self.upload_folder))
                orphaned_files = physical_files - db_file_names
                
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
                    "message": f"Đã xóa {deleted_count} file không có trong database",
                    "deleted_count": deleted_count
                }
                
            except Exception as e:
                db.rollback()
                return {"success": False, "message": f"Lỗi khi dọn dẹp files: {str(e)}"}
            finally:
                db.close()
                
        except Exception as e:
            return {"success": False, "message": f"Lỗi khi dọn dẹp files: {str(e)}"}

# Khởi tạo FileManager
file_manager = FileManager() 