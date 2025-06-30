#!/usr/bin/env python3
"""
Script để khởi tạo database và tạo các bảng
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database import create_tables, engine, SessionLocal
from src.auth import AuthManager
import uuid
from datetime import datetime
from sqlalchemy import text

def init_database():
    """Khởi tạo database và tạo các bảng"""
    try:
        print("Đang tạo các bảng database...")
        create_tables()
        print("✅ Các bảng đã được tạo thành công!")
        
        # Tạo admin user mặc định
        print("Đang tạo admin user mặc định...")
        auth_manager = AuthManager()
        print("✅ Admin user đã được tạo thành công!")
        
        print("\n🎉 Database đã được khởi tạo thành công!")
        print("Thông tin đăng nhập mặc định:")
        print("Username: admin")
        print("Password: admin123")
        
    except Exception as e:
        print(f"❌ Lỗi khi khởi tạo database: {e}")
        return False
    
    return True

def test_connection():
    """Test kết nối database"""
    try:
        print("Đang test kết nối database...")
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Kết nối database thành công!")
        return True
    except Exception as e:
        print(f"❌ Lỗi kết nối database: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Khởi tạo Local LLM Chat App Database")
    print("=" * 50)
    
    # Test kết nối trước
    if not test_connection():
        print("Không thể kết nối database. Vui lòng kiểm tra cấu hình.")
        sys.exit(1)
    
    # Khởi tạo database
    if init_database():
        print("\n✨ Hoàn thành! Bạn có thể chạy ứng dụng ngay bây giờ.")
    else:
        print("\n💥 Có lỗi xảy ra. Vui lòng kiểm tra lại cấu hình.")
        sys.exit(1) 