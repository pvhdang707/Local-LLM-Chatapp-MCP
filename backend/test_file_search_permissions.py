#!/usr/bin/env python3
"""
Script test để kiểm tra logic lọc file theo quyền truy cập
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.file_search import file_search_engine
from src.database import get_db, User, File
from src.auth import AuthManager
from datetime import datetime

def test_file_search_permissions():
    """Test logic lọc file theo quyền truy cập"""
    print("=== TEST FILE SEARCH PERMISSIONS ===")
    
    # Khởi tạo auth manager
    auth_manager = AuthManager()
    
    try:
        db = next(get_db())
        
        # Tạo test users nếu chưa có
        test_user1 = db.query(User).filter(User.username == 'test_user1').first()
        if not test_user1:
            test_user1 = User(
                username='test_user1',
                password=auth_manager.hash_password('password123'),
                role='user',
                is_active=True
            )
            db.add(test_user1)
            db.commit()
            db.refresh(test_user1)
            print(f"Created test user1: {test_user1.id}")
        
        test_user2 = db.query(User).filter(User.username == 'test_user2').first()
        if not test_user2:
            test_user2 = User(
                username='test_user2',
                password=auth_manager.hash_password('password123'),
                role='user',
                is_active=True
            )
            db.add(test_user2)
            db.commit()
            db.refresh(test_user2)
            print(f"Created test user2: {test_user2.id}")
        
        admin_user = db.query(User).filter(User.username == 'admin').first()
        if not admin_user:
            admin_user = User(
                username='admin',
                password=auth_manager.hash_password('admin123'),
                role='admin',
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"Created admin user: {admin_user.id}")
        
        # Tạo test files nếu chưa có
        test_file1 = db.query(File).filter(File.original_name == 'test_file1.txt').first()
        if not test_file1:
            test_file1 = File(
                original_name='test_file1.txt',
                stored_name='test_file1_123.txt',
                file_path='uploads/test_file1.txt',
                file_type='txt',
                uploaded_by=test_user1.id,
                uploaded_at=datetime.now(),
                is_active=True
            )
            db.add(test_file1)
            db.commit()
            db.refresh(test_file1)
            print(f"Created test file1: {test_file1.id}")
        
        test_file2 = db.query(File).filter(File.original_name == 'test_file2.txt').first()
        if not test_file2:
            test_file2 = File(
                original_name='test_file2.txt',
                stored_name='test_file2_456.txt',
                file_path='uploads/test_file2.txt',
                file_type='txt',
                uploaded_by=test_user2.id,
                uploaded_at=datetime.now(),
                is_active=True
            )
            db.add(test_file2)
            db.commit()
            db.refresh(test_file2)
            print(f"Created test file2: {test_file2.id}")
        
        # Reload index để có dữ liệu mới
        file_search_engine.load_index()
        
        # Test 1: User1 tìm kiếm - chỉ thấy file của mình
        print("\n--- Test 1: User1 search ---")
        results = file_search_engine.search_all("test", test_user1.id, "user")
        print(f"User1 search results: {len(results['results'])} files")
        for result in results['results']:
            print(f"  - {result['name']} (uploaded by: {result['uploaded_by']})")
        
        # Test 2: User2 tìm kiếm - chỉ thấy file của mình
        print("\n--- Test 2: User2 search ---")
        results = file_search_engine.search_all("test", test_user2.id, "user")
        print(f"User2 search results: {len(results['results'])} files")
        for result in results['results']:
            print(f"  - {result['name']} (uploaded by: {result['uploaded_by']})")
        
        # Test 3: Admin tìm kiếm - thấy tất cả files
        print("\n--- Test 3: Admin search ---")
        results = file_search_engine.search_all("test", admin_user.id, "admin")
        print(f"Admin search results: {len(results['results'])} files")
        for result in results['results']:
            print(f"  - {result['name']} (uploaded by: {result['uploaded_by']})")
        
        # Test 4: Search không có user_id - thấy tất cả (backward compatibility)
        print("\n--- Test 4: Search without user_id ---")
        results = file_search_engine.search_all("test")
        print(f"No user search results: {len(results['results'])} files")
        for result in results['results']:
            print(f"  - {result['name']} (uploaded by: {result['uploaded_by']})")
        
        print("\n=== TEST COMPLETED ===")
        
    except Exception as e:
        print(f"Error during test: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_file_search_permissions() 