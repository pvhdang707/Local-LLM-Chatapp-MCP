#!/usr/bin/env python3
"""
Migration script để thêm trường department vào database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database import get_db, User, File, Department
from sqlalchemy import text

def migrate_department():
    """Thêm trường department vào database"""
    db = next(get_db())
    try:
        # Thêm cột department vào bảng users nếu chưa có
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN department VARCHAR(50)"))
            print("✓ Đã thêm cột department vào bảng users")
        except Exception as e:
            print(f"ℹ Cột department đã tồn tại hoặc lỗi: {e}")

        # Thêm cột department vào bảng files nếu chưa có
        try:
            db.execute(text("ALTER TABLE files ADD COLUMN department VARCHAR(50)"))
            print("✓ Đã thêm cột department vào bảng files")
        except Exception as e:
            print(f"ℹ Cột department đã tồn tại hoặc lỗi: {e}")

        # Tạo bảng departments nếu chưa có
        try:
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS departments (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(50) UNIQUE NOT NULL,
                    description VARCHAR(255),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE
                )
            """))
            print("✓ Đã tạo bảng departments")
        except Exception as e:
            print(f"ℹ Bảng departments đã tồn tại hoặc lỗi: {e}")

        # Thêm các department mặc định
        departments = [
            {"id": "dept_sales", "name": "Sales", "description": "Phòng Kinh doanh"},
            {"id": "dept_finance", "name": "Tài chính", "description": "Phòng Tài chính"},
            {"id": "dept_hr", "name": "HR", "description": "Phòng Nhân sự"}
        ]

        for dept in departments:
            try:
                db.execute(text("""
                    INSERT INTO departments (id, name, description) 
                    VALUES (:id, :name, :description)
                """), dept)
                print(f"✓ Đã thêm department: {dept['name']}")
            except Exception as e:
                print(f"ℹ Department {dept['name']} đã tồn tại hoặc lỗi: {e}")

        db.commit()
        print("✓ Migration hoàn thành thành công!")

    except Exception as e:
        db.rollback()
        print(f"✗ Lỗi migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Bắt đầu migration department...")
    migrate_department() 