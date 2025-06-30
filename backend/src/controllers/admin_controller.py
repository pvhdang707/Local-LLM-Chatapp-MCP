from flask import Blueprint, request, jsonify
from src.auth import require_auth, require_admin
from src.file_manager import file_manager
from src.auth import auth_manager

admin_bp = Blueprint('admin', __name__)

# ==================== ADMIN USER MANAGEMENT ====================

@admin_bp.route('/users', methods=['GET'])
@require_auth
@require_admin
def get_all_users():
    """Lấy danh sách tất cả users (chỉ admin)"""
    try:
        users = auth_manager.get_all_users()
        return jsonify({'users': users})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@require_auth
@require_admin
def delete_user(user_id):
    """Xóa user (chỉ admin)"""
    try:
        result = auth_manager.delete_user(user_id)
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/role', methods=['PUT'])
@require_auth
@require_admin
def update_user_role(user_id):
    """Cập nhật role của user (chỉ admin)"""
    try:
        data = request.json
        new_role = data.get('role')
        
        if not new_role or new_role not in ['user', 'admin']:
            return jsonify({'error': 'Role không hợp lệ'}), 400
            
        result = auth_manager.update_user_role(user_id, new_role)
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/create', methods=['POST'])
@require_auth
@require_admin
def admin_create_user():
    """Tạo user mới (chỉ admin)"""
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        role = data.get('role', 'user')

        if not username or not password:
            return jsonify({'error': 'Username và password không được để trống'}), 400

        if len(password) < 6:
            return jsonify({'error': 'Password phải có ít nhất 6 ký tự'}), 400

        result = auth_manager.register_user(username, password, role)
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ADMIN FILE MANAGEMENT ====================

@admin_bp.route('/files', methods=['GET'])
@require_auth
@require_admin
def get_all_files():
    """Lấy danh sách tất cả files (chỉ admin)"""
    try:
        files = file_manager.get_all_files()
        return jsonify({'files': files})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/files', methods=['POST'])
@require_auth
@require_admin
def admin_upload_file():
    """Upload file (chỉ admin)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Không có file được chọn'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Không có file được chọn'}), 400
            
        result = file_manager.upload_file(file)
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/files/<file_id>', methods=['DELETE'])
@require_auth
@require_admin
def admin_delete_file(file_id):
    """Xóa file (chỉ admin)"""
    try:
        result = file_manager.delete_file(file_id)
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/files/<file_id>/status', methods=['PUT'])
@require_auth
@require_admin
def update_file_status(file_id):
    """Cập nhật trạng thái file (chỉ admin)"""
    try:
        data = request.json
        status = data.get('status')
        
        if status not in ['pending', 'approved', 'rejected']:
            return jsonify({'error': 'Trạng thái không hợp lệ'}), 400
            
        result = file_manager.update_file_status(file_id, status)
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/files/cleanup', methods=['POST'])
@require_auth
@require_admin
def cleanup_files():
    """Dọn dẹp files không sử dụng (chỉ admin)"""
    try:
        result = file_manager.cleanup_unused_files()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 