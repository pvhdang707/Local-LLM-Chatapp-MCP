from flask import Blueprint, request, jsonify
from src.auth import require_auth, require_admin
from src.database import get_db, User as DBUser, File as DBFile
from datetime import datetime
import os

admin_bp = Blueprint('admin', __name__)

# ==================== ADMIN ENDPOINTS ====================

@admin_bp.route('/admin/users', methods=['GET'])
@require_auth
@require_admin
def get_users():
    """
    Lấy danh sách tất cả users (Admin only)
    ---
    tags:
      - Admin
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
    responses:
      200:
        description: Lấy danh sách users thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            users:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                    example: "user_123"
                  username:
                    type: string
                    example: "user1"
                  role:
                    type: string
                    example: "user"
                  created_at:
                    type: string
                    format: date-time
                    example: "2024-01-01T12:00:00Z"
        examples:
          application/json: {
            "success": true,
            "users": [
              {
                "id": "user_123",
                "username": "user1",
                "role": "user",
                "created_at": "2024-01-01T12:00:00Z"
              }
            ]
          }
      401:
        description: Không xác thực hoặc không có quyền admin
      500:
        description: Lỗi server
    """
    try:
        db = next(get_db())
        users = db.query(DBUser).all()
        
        user_list = []
        for user in users:
            user_list.append({
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'created_at': user.created_at.isoformat() if user.created_at else None
            })
        
        return jsonify({
            'success': True,
            'users': user_list,
            'total_users': len(user_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@admin_bp.route('/admin/users/<user_id>/role', methods=['PUT'])
@require_auth
@require_admin
def update_user_role(user_id):
    """
    Cập nhật role của user (Admin only)
    ---
    tags:
      - Admin
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
      - name: user_id
        in: path
        type: string
        required: true
        description: ID của user
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - role
          properties:
            role:
              type: string
              description: Role mới (user/admin)
              example: "admin"
    responses:
      200:
        description: Cập nhật role thành công
      400:
        description: Dữ liệu không hợp lệ
      401:
        description: Không xác thực hoặc không có quyền admin
      404:
        description: User không tồn tại
      500:
        description: Lỗi server
    """
    try:
        data = request.json
        new_role = data.get('role')
        
        if not new_role or new_role not in ['user', 'admin']:
            return jsonify({'error': 'Role phải là "user" hoặc "admin"'}), 400
        
        db = next(get_db())
        user = db.query(DBUser).filter(DBUser.id == user_id).first()
        
        if not user:
            return jsonify({'error': 'User không tồn tại'}), 404
        
        user.role = new_role
        user.updated_at = datetime.utcnow()
        db.commit()
        
        return jsonify({
            'success': True,
            'message': f'Cập nhật role thành công: {user.username} -> {new_role}',
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@admin_bp.route('/admin/users/create', methods=['POST'])
@require_auth
@require_admin
def create_user():
    """
    Tạo user mới (Admin only)
    ---
    tags:
      - Admin
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: Username mới
              example: "newuser"
            password:
              type: string
              description: Password mới
              example: "password123"
            role:
              type: string
              description: Role (mặc định: user)
              example: "user"
    responses:
      201:
        description: Tạo user thành công
      400:
        description: Dữ liệu không hợp lệ
      401:
        description: Không xác thực hoặc không có quyền admin
      409:
        description: Username đã tồn tại
      500:
        description: Lỗi server
    """
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        role = data.get('role', 'user')
        
        if not username or not password:
            return jsonify({'error': 'Username và password không được để trống'}), 400
        
        if role not in ['user', 'admin']:
            return jsonify({'error': 'Role phải là "user" hoặc "admin"'}), 400
        
        db = next(get_db())
        
        # Kiểm tra username đã tồn tại chưa
        existing_user = db.query(DBUser).filter(DBUser.username == username).first()
        if existing_user:
            return jsonify({'error': 'Username đã tồn tại'}), 409
        
        # Tạo user mới
        from src.auth import hash_password
        hashed_password = hash_password(password)
        
        new_user = DBUser(
            username=username,
            password=hashed_password,
            role=role,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return jsonify({
            'success': True,
            'message': 'Tạo user thành công',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'role': new_user.role,
                'created_at': new_user.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@admin_bp.route('/admin/users/<user_id>', methods=['DELETE'])
@require_auth
@require_admin
def delete_user(user_id):
    """
    Xóa user (Admin only)
    ---
    tags:
      - Admin
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
      - name: user_id
        in: path
        type: string
        required: true
        description: ID của user cần xóa
    responses:
      200:
        description: Xóa user thành công
      401:
        description: Không xác thực hoặc không có quyền admin
      404:
        description: User không tồn tại
      500:
        description: Lỗi server
    """
    try:
        db = next(get_db())
        user = db.query(DBUser).filter(DBUser.id == user_id).first()
        
        if not user:
            return jsonify({'error': 'User không tồn tại'}), 404
        
        # Không cho phép xóa chính mình
        current_user_id = request.user['user_id']
        if user_id == current_user_id:
            return jsonify({'error': 'Không thể xóa chính mình'}), 400
        
        username = user.username
        db.delete(user)
        db.commit()
        
        return jsonify({
            'success': True,
            'message': f'Xóa user "{username}" thành công'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@admin_bp.route('/admin/files', methods=['GET'])
@require_auth
@require_admin
def get_all_files():
    """
    Lấy danh sách tất cả files (Admin only)
    ---
    tags:
      - Admin
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
      - name: page
        in: query
        type: integer
        description: Số trang (mặc định: 1)
        example: 1
      - name: limit
        in: query
        type: integer
        description: Số items per page (mặc định: 10)
        example: 10
    responses:
      200:
        description: Lấy danh sách files thành công
      401:
        description: Không xác thực hoặc không có quyền admin
      500:
        description: Lỗi server
    """
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        db = next(get_db())
        files = db.query(DBFile).offset((page - 1) * limit).limit(limit).all()
        total_files = db.query(DBFile).count()
        
        file_list = []
        for file in files:
            file_list.append({
                'id': file.id,
                'original_name': file.original_name,
                'file_type': file.file_type,
                'file_size': file.file_size,
                'uploaded_by': file.uploaded_by,
                'uploaded_at': file.uploaded_at.isoformat() if file.uploaded_at else None,
                'file_path': file.file_path
            })
        
        return jsonify({
            'success': True,
            'files': file_list,
            'total_files': total_files,
            'page': page,
            'limit': limit,
            'total_pages': (total_files + limit - 1) // limit
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@admin_bp.route('/admin/stats', methods=['GET'])
@require_auth
@require_admin
def get_system_stats():
    """
    Lấy thống kê hệ thống (Admin only)
    ---
    tags:
      - Admin
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
    responses:
      200:
        description: Lấy thống kê thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            stats:
              type: object
              properties:
                total_users:
                  type: integer
                  example: 10
                total_files:
                  type: integer
                  example: 50
                total_size:
                  type: integer
                  example: 1024000
                users_by_role:
                  type: object
                  example: {"user": 8, "admin": 2}
                files_by_type:
                  type: object
                  example: {"pdf": 20, "docx": 15, "txt": 15}
      401:
        description: Không xác thực hoặc không có quyền admin
      500:
        description: Lỗi server
    """
    try:
        db = next(get_db())
        
        # Thống kê users
        total_users = db.query(DBUser).count()
        users_by_role = db.query(DBUser.role, db.func.count(DBUser.id)).group_by(DBUser.role).all()
        role_stats = {role: count for role, count in users_by_role}
        
        # Thống kê files
        total_files = db.query(DBFile).count()
        total_size = db.query(db.func.sum(DBFile.file_size)).scalar() or 0
        
        # Thống kê files theo type
        files_by_type = db.query(DBFile.file_type, db.func.count(DBFile.id)).group_by(DBFile.file_type).all()
        type_stats = {file_type: count for file_type, count in files_by_type}
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'total_files': total_files,
                'total_size': total_size,
                'users_by_role': role_stats,
                'files_by_type': type_stats
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close() 