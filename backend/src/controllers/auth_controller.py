from flask import Blueprint, request, jsonify
from src.auth import auth_manager, require_auth

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """Đăng ký user mới (ai cũng đăng ký được)"""
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        if not username or not password:
            return jsonify({'error': 'Username và password không được để trống'}), 400
        if len(password) < 6:
            return jsonify({'error': 'Password phải có ít nhất 6 ký tự'}), 400
        result = auth_manager.register_user(username, password)
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Đăng nhập"""
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if not username or not password:
            return jsonify({'error': 'Username và password không được để trống'}), 400

        result = auth_manager.login_user(username, password)
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/auth/profile', methods=['GET'])
@require_auth
def get_profile():
    """Lấy thông tin profile của user hiện tại"""
    try:
        user_id = request.user['user_id']
        user = auth_manager.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User không tồn tại'}), 404

        return jsonify({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'created_at': user.created_at,
            'is_active': user.is_active
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500 