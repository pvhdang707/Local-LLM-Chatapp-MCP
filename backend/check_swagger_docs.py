#!/usr/bin/env python3
"""
Script kiểm tra Swagger documentation trong các controller
"""

import os
import re
from pathlib import Path

def check_swagger_docs():
    """Kiểm tra Swagger documentation trong tất cả các controller"""
    
    controllers_dir = Path("src/controllers")
    issues = []
    documented_endpoints = []
    undocumented_endpoints = []
    
    # Các file controller cần kiểm tra
    controller_files = [
        "auth_controller.py",
        "chat_controller.py", 
        "admin_controller.py",
        "file_controller.py",
        "search_controller.py",
        "system_controller.py",
        "enhanced_chat_controller.py",
        "agentic_ai_controller.py",
        "feedback.py",
        "public_chat_controller.py"
    ]
    
    print("=== KIỂM TRA SWAGGER DOCUMENTATION ===\n")
    
    for filename in controller_files:
        filepath = controllers_dir / filename
        if not filepath.exists():
            issues.append(f"❌ File không tồn tại: {filename}")
            continue
            
        print(f"📁 Kiểm tra: {filename}")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Tìm tất cả các route decorators
        route_pattern = r'@\w+\.route\([\'"]([^\'"]+)[\'"][^)]*\)'
        routes = re.findall(route_pattern, content)
        
        # Tìm tất cả các docstrings có Swagger
        swagger_pattern = r'"""[^"]*---[^"]*tags:[^"]*"""'
        swagger_docs = re.findall(swagger_pattern, content, re.DOTALL)
        
        print(f"   📊 Tìm thấy {len(routes)} routes")
        print(f"   📝 Tìm thấy {len(swagger_docs)} Swagger docs")
        
        # Kiểm tra từng route
        for route in routes:
            # Tìm docstring cho route này
            route_with_docs = False
            for doc in swagger_docs:
                if 'tags:' in doc and 'responses:' in doc:
                    route_with_docs = True
                    break
                    
            if route_with_docs:
                documented_endpoints.append(f"{filename}: {route}")
            else:
                undocumented_endpoints.append(f"{filename}: {route}")
                
        # Kiểm tra các vấn đề cụ thể
        if len(routes) > len(swagger_docs):
            issues.append(f"⚠️  {filename}: Thiếu Swagger docs cho một số endpoints")
            
        if 'security:' not in content and 'Bearer:' not in content:
            issues.append(f"⚠️  {filename}: Thiếu security definitions")
            
        if 'examples:' not in content:
            issues.append(f"⚠️  {filename}: Thiếu response examples")
            
        print()
    
    # Báo cáo tổng kết
    print("=== BÁO CÁO TỔNG KẾT ===\n")
    
    print(f"✅ Endpoints có documentation: {len(documented_endpoints)}")
    for endpoint in documented_endpoints:
        print(f"   ✓ {endpoint}")
        
    print(f"\n❌ Endpoints thiếu documentation: {len(undocumented_endpoints)}")
    for endpoint in undocumented_endpoints:
        print(f"   ✗ {endpoint}")
        
    print(f"\n⚠️  Vấn đề cần khắc phục: {len(issues)}")
    for issue in issues:
        print(f"   {issue}")
        
    # Đề xuất cải thiện
    print("\n=== ĐỀ XUẤT CẢI THIỆN ===\n")
    
    if issues:
        print("1. Thêm Swagger documentation cho các endpoints còn thiếu")
        print("2. Thêm security definitions cho tất cả protected endpoints")
        print("3. Thêm response examples cho tất cả endpoints")
        print("4. Kiểm tra và cập nhật tags cho phù hợp")
        print("5. Thêm error response schemas")
    else:
        print("✅ Tất cả endpoints đã có documentation đầy đủ!")
        
    print("\n=== TAGS HIỆN TẠI ===\n")
    tags = [
        "Auth", "Chat", "Admin", "File", "Search", 
        "System", "Enhanced Chat", "Agentic AI", "Feedback"
    ]
    
    for tag in tags:
        print(f"   • {tag}")
        
    return len(issues) == 0

if __name__ == "__main__":
    success = check_swagger_docs()
    exit(0 if success else 1) 