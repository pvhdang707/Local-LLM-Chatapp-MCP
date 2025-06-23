import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from typing import Dict, List, Optional
import json
import os

# File để lưu trữ users (trong thực tế nên dùng database)
USERS_FILE = "users.json"

class User:
    def __init__(self, username: str, password: str, role: str = "user", id: str = None):
        self.id = id or self._generate_id()
        self.username = username
        self.password = password
        self.role = role
        self.created_at = datetime.now().isoformat()
        self.is_active = True

    def _generate_id(self) -> str:
        import uuid
        return str(uuid.uuid4())

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "username": self.username,
            "password": self.password,  # Đã được hash
            "role": self.role,
            "created_at": self.created_at,
            "is_active": self.is_active
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'User':
        user = cls(data["username"], data["password"], data["role"], data["id"])
        user.created_at = data["created_at"]
        user.is_active = data["is_active"]
        return user

class AuthManager:
    def __init__(self):
        self.users: List[User] = []
        self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this")
        self.load_users()
        self._create_default_admin()

    def _create_default_admin(self):
        """Tạo admin mặc định nếu chưa có"""
        if not any(user.role == "admin" for user in self.users):
            self.register_user("admin", "admin123", "admin")

    def load_users(self):
        """Load users từ file"""
        if os.path.exists(USERS_FILE):
            try:
                with open(USERS_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.users = [User.from_dict(user_data) for user_data in data]
            except Exception as e:
                print(f"Error loading users: {e}")
                self.users = []

    def save_users(self):
        """Lưu users vào file"""
        try:
            with open(USERS_FILE, 'w', encoding='utf-8') as f:
                json.dump([user.to_dict() for user in self.users], f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving users: {e}")

    def hash_password(self, password: str) -> str:
        """Hash password"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    def register_user(self, username: str, password: str, role: str = "user") -> Dict:
        """Đăng ký user mới"""
        # Kiểm tra username đã tồn tại
        if any(user.username == username for user in self.users):
            return {"success": False, "message": "Username đã tồn tại"}

        # Hash password
        hashed_password = self.hash_password(password)
        
        # Tạo user mới
        new_user = User(username, hashed_password, role)
        self.users.append(new_user)
        self.save_users()

        return {
            "success": True, 
            "message": "Đăng ký thành công",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "role": new_user.role
            }
        }

    def login_user(self, username: str, password: str) -> Dict:
        """Đăng nhập user"""
        user = next((u for u in self.users if u.username == username and u.is_active), None)
        
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
                "role": user.role
            }
        }

    def create_token(self, user: User) -> str:
        """Tạo JWT token"""
        payload = {
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
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
        return next((u for u in self.users if u.id == user_id), None)

    def get_user_by_username(self, username: str) -> Optional[User]:
        """Lấy user theo username"""
        return next((u for u in self.users if u.username == username), None)

    def delete_user(self, user_id: str) -> Dict:
        """Xóa user (chỉ admin)"""
        user = self.get_user_by_id(user_id)
        if not user:
            return {"success": False, "message": "User không tồn tại"}
        
        self.users.remove(user)
        self.save_users()
        return {"success": True, "message": "Xóa user thành công"}

    def update_user_role(self, user_id: str, new_role: str) -> Dict:
        """Cập nhật role của user (chỉ admin)"""
        user = self.get_user_by_id(user_id)
        if not user:
            return {"success": False, "message": "User không tồn tại"}
        
        if new_role not in ["admin", "user"]:
            return {"success": False, "message": "Role không hợp lệ"}
        
        user.role = new_role
        self.save_users()
        return {"success": True, "message": "Cập nhật role thành công"}

    def get_all_users(self) -> List[Dict]:
        """Lấy danh sách tất cả users (chỉ admin)"""
        return [
            {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "created_at": user.created_at,
                "is_active": user.is_active
            }
            for user in self.users
        ]

# Khởi tạo AuthManager
auth_manager = AuthManager()

# Decorators cho authorization
def require_auth(f):
    """Decorator yêu cầu authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Token không được cung cấp"}), 401
        
        # Loại bỏ "Bearer " prefix
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = auth_manager.verify_token(token)
        if not payload:
            return jsonify({"error": "Token không hợp lệ hoặc đã hết hạn"}), 401
        
        # Thêm user info vào request
        request.user = payload
        return f(*args, **kwargs)
    return decorated_function

def require_admin(f):
    """Decorator yêu cầu quyền admin (tự động yêu cầu auth trước)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Đầu tiên kiểm tra authentication
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Token không được cung cấp"}), 401
        
        # Loại bỏ "Bearer " prefix
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = auth_manager.verify_token(token)
        if not payload:
            return jsonify({"error": "Token không hợp lệ hoặc đã hết hạn"}), 401
        
        # Thêm user info vào request
        request.user = payload
        
        # Sau đó kiểm tra quyền admin
        if request.user.get('role') != 'admin':
            return jsonify({"error": "Không có quyền truy cập. Yêu cầu quyền admin."}), 403
        
        return f(*args, **kwargs)
    return decorated_function 