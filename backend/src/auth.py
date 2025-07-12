import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from typing import Dict, List, Optional
import uuid
import os
from src.database import get_db, User as DBUser

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

class User:
    def __init__(self, username: str, password: str, role: str = "user", department: str = None, id: str = None):
        self.id = id or self._generate_id()
        self.username = username
        self.password = password
        self.role = role
        self.department = department
        self.created_at = datetime.now()
        self.is_active = True

    def _generate_id(self) -> str:
        return str(uuid.uuid4())

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "username": self.username,
            "password": self.password,  # Đã được hash
            "role": self.role,
            "department": self.department,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            "is_active": self.is_active
        }

    @classmethod
    def from_db_user(cls, db_user: DBUser) -> 'User':
        user = cls(db_user.username, db_user.password, db_user.role, db_user.department, db_user.id)
        user.created_at = db_user.created_at
        user.is_active = db_user.is_active
        return user

class AuthManager:
    def __init__(self):
        self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this")

    def hash_password(self, password: str) -> str:
        """Hash password"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    def register_user(self, username: str, password: str, department: str = None) -> Dict:
        """Đăng ký user mới"""
        db = next(get_db())
        try:
            existing_user = db.query(DBUser).filter(DBUser.username == username).first()
            if existing_user:
                return {"success": False, "message": "Username đã tồn tại"}
            
            # Validate department
            valid_departments = ["Sales", "Tài chính", "HR", None]
            if department not in valid_departments:
                return {"success": False, "message": "Department không hợp lệ"}
            
            hashed_password = self.hash_password(password)
            new_user = DBUser(
                id=str(uuid.uuid4()),
                username=username,
                password=hashed_password,
                role='user',
                department=department,
                created_at=datetime.utcnow(),
                is_active=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return {
                "success": True,
                "message": "Đăng ký thành công",
                "user": {
                    "id": new_user.id,
                    "username": new_user.username,
                    "role": new_user.role,
                    "department": new_user.department
                }
            }
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Lỗi khi đăng ký: {str(e)}"}
        finally:
            db.close()

    def login_user(self, username: str, password: str) -> Dict:
        """Đăng nhập user"""
        db = next(get_db())
        try:
            user = db.query(DBUser).filter(
                DBUser.username == username, 
                DBUser.is_active == True
            ).first()
            
            if not user:
                return {"success": False, "message": "Username không tồn tại hoặc đã bị khóa"}

            if not self.verify_password(password, user.password):
                return {"success": False, "message": "Mật khẩu không đúng"}

            # Tạo JWT token
            token = self.create_token(user)
            
            return {
                "success": True,
                "message": "Đăng nhập thành công",
                "token": token,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role,
                    "department": user.department
                }
            }

        except Exception as e:
            return {"success": False, "message": f"Lỗi khi đăng nhập: {str(e)}"}
        finally:
            db.close()

    def create_token(self, user: DBUser) -> str:
        """Tạo JWT token"""
        payload = {
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "department": user.department,
            "exp": datetime.utcnow() + timedelta(hours=24)  # Token hết hạn sau 24h
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")

    def verify_token(self, token: str) -> Optional[Dict]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Lấy user theo ID"""
        db = next(get_db())
        try:
            db_user = db.query(DBUser).filter(DBUser.id == user_id).first()
            if db_user:
                return User.from_db_user(db_user)
            return None
        except Exception as e:
            print(f"Error getting user by ID: {e}")
            return None
        finally:
            db.close()

    def get_user_by_username(self, username: str) -> Optional[User]:
        """Lấy user theo username"""
        db = next(get_db())
        try:
            db_user = db.query(DBUser).filter(DBUser.username == username).first()
            if db_user:
                return User.from_db_user(db_user)
            return None
        except Exception as e:
            print(f"Error getting user by username: {e}")
            return None
        finally:
            db.close()

    def delete_user(self, user_id: str) -> Dict:
        """Xóa user (chỉ admin)"""
        db = next(get_db())
        try:
            user = db.query(DBUser).filter(DBUser.id == user_id).first()
            if not user:
                return {"success": False, "message": "User không tồn tại"}
            
            db.delete(user)
            db.commit()
            return {"success": True, "message": "Xóa user thành công"}

        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Lỗi khi xóa user: {str(e)}"}
        finally:
            db.close()

    def update_user_role(self, user_id: str, new_role: str) -> Dict:
        """Cập nhật role của user (chỉ admin)"""
        db = next(get_db())
        try:
            user = db.query(DBUser).filter(DBUser.id == user_id).first()
            if not user:
                return {"success": False, "message": "User không tồn tại"}
            
            if new_role not in ["admin", "user"]:
                return {"success": False, "message": "Role không hợp lệ"}
            
            user.role = new_role
            db.commit()
            return {"success": True, "message": "Cập nhật role thành công"}

        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Lỗi khi cập nhật role: {str(e)}"}
        finally:
            db.close()

    def update_user_department(self, user_id: str, new_department: str) -> Dict:
        """Cập nhật department của user (chỉ admin)"""
        db = next(get_db())
        try:
            user = db.query(DBUser).filter(DBUser.id == user_id).first()
            if not user:
                return {"success": False, "message": "User không tồn tại"}
            
            valid_departments = ["Sales", "Tài chính", "HR", None]
            if new_department not in valid_departments:
                return {"success": False, "message": "Department không hợp lệ"}
            
            user.department = new_department
            db.commit()
            return {"success": True, "message": "Cập nhật department thành công"}

        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Lỗi khi cập nhật department: {str(e)}"}
        finally:
            db.close()

    def get_all_users(self) -> List[Dict]:
        """Lấy danh sách tất cả users (chỉ admin)"""
        db = next(get_db())
        try:
            users = db.query(DBUser).all()
            return [
                {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role,
                    "department": user.department,
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                    "is_active": user.is_active
                }
                for user in users
            ]
        except Exception as e:
            print(f"Error getting all users: {e}")
            return []
        finally:
            db.close()

# Khởi tạo AuthManager
auth_manager = AuthManager()

# Decorators cho authorization
def require_auth(f):
    """Decorator yêu cầu authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token không hợp lệ'}), 401
        
        token = auth_header.split(' ')[1]
        payload = auth_manager.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Token không hợp lệ hoặc đã hết hạn'}), 401
        
        # Thêm thông tin user vào request
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated_function 

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = getattr(request, 'user', None)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Chỉ admin mới được phép thực hiện thao tác này'}), 403
        return f(*args, **kwargs)
    return decorated_function 

def require_department_access(department: str = None):
    """Decorator kiểm tra quyền truy cập theo department"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = getattr(request, 'user', None)
            if not user:
                return jsonify({'error': 'Token không hợp lệ'}), 401
            
            user_role = user.get('role')
            user_department = user.get('department')
            
            # Admin có quyền truy cập tất cả
            if user_role == 'admin':
                return f(*args, **kwargs)
            
            # User thường chỉ có quyền truy cập department của mình
            if user_role == 'user':
                if department and user_department != department:
                    return jsonify({'error': 'Không có quyền truy cập department này'}), 403
                return f(*args, **kwargs)
            
            return jsonify({'error': 'Không có quyền truy cập'}), 403
        
        return decorated_function
    return decorator 