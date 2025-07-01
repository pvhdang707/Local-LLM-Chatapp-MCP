#!/usr/bin/env python3
"""
Script để tạo admin user đầu tiên
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database import get_db, User as DBUser
from src.auth import AuthManager
import uuid
from datetime import datetime

def create_admin_user():
    """Tạo admin user đầu tiên"""
    try:
        print("Đang tạo admin user...")
        
        auth_manager = AuthManager()
        db = next(get_db())
        
        # Kiểm tra xem đã có admin chưa
        existing_admin = db.query(DBUser).filter(DBUser.role == "admin").first()
        if existing_admin:
            print(f"✅ Đã có admin user: {existing_admin.username}")
            return True
        
        # Tạo admin user mới
        admin_username = "admin"
        admin_password = "admin123"
        
        # Kiểm tra username đã tồn tại chưa
        existing_user = db.query(DBUser).filter(DBUser.username == admin_username).first()
        if existing_user:
            print(f"✅ User {admin_username} đã tồn tại")
            return True
        
        # Hash password
        hashed_password = auth_manager.hash_password(admin_password)
        
        # Tạo admin user
        admin_user = DBUser(
            id=str(uuid.uuid4()),
            username=admin_username,
            password=hashed_password,
            role="admin",
            created_at=datetime.utcnow(),
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user đã được tạo thành công!")
        print(f"Username: {admin_username}")
        print(f"Password: {admin_password}")
        print("Vui lòng đổi password sau khi đăng nhập!")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi tạo admin user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Tạo Admin User cho Local LLM Chat App")
    print("=" * 50)
    
    if create_admin_user():
        print("\n✨ Hoàn thành! Bạn có thể đăng nhập với admin user.")
    else:
        print("\n💥 Có lỗi xảy ra. Vui lòng kiểm tra lại.")
        sys.exit(1) 