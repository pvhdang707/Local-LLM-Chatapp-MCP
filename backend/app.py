import traceback
import uuid
import os
from flask import Flask, request, jsonify
from auth import auth_manager, require_auth, require_admin
from file_manager import file_manager
from flask_cors import CORS
from datetime import datetime

# Import LLM components
from llm import workflow, RagDataContext

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)  # Cho phép CORS

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.route('/auth/register', methods=['POST'])
@require_auth
@require_admin
def register():
    """Đăng ký user mới (chỉ admin)"""
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

@app.route('/auth/login', methods=['POST'])
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

@app.route('/auth/profile', methods=['GET'])
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

# ==================== ADMIN USER MANAGEMENT ENDPOINTS ====================

@app.route('/admin/users', methods=['GET'])
@require_auth
@require_admin
def get_all_users():
    """Lấy danh sách tất cả users (chỉ admin)"""
    try:
        users = auth_manager.get_all_users()
        return jsonify({'users': users})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/users/<user_id>', methods=['DELETE'])
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

@app.route('/admin/users/<user_id>/role', methods=['PUT'])
@require_auth
@require_admin
def update_user_role(user_id):
    """Cập nhật role của user (chỉ admin)"""
    try:
        data = request.json
        new_role = data.get('role')

        if not new_role or new_role not in ['admin', 'user']:
            return jsonify({'error': 'Role không hợp lệ'}), 400

        result = auth_manager.update_user_role(user_id, new_role)
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/users/create', methods=['POST'])
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

        if role not in ['admin', 'user']:
            return jsonify({'error': 'Role không hợp lệ'}), 400

        result = auth_manager.register_user(username, password, role)
        if result['success']:
            return jsonify({
                'success': True,
                'message': f'Đã tạo user {username} thành công',
                'user': result['user']
            }), 201
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ADMIN FILE MANAGEMENT ENDPOINTS ====================

@app.route('/admin/files', methods=['GET'])
@require_auth
@require_admin
def get_all_files():
    """Lấy danh sách tất cả files (chỉ admin)"""
    try:
        files = file_manager.get_all_files()
        stats = file_manager.get_file_stats()
        return jsonify({
            'files': files,
            'stats': stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/files', methods=['POST'])
@require_auth
@require_admin
def admin_upload_file():
    """Upload file (chỉ admin)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        uploaded_by = request.user['username']
        result = file_manager.add_file(file, uploaded_by)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/files/<file_id>', methods=['DELETE'])
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

@app.route('/admin/files/<file_id>/status', methods=['PUT'])
@require_auth
@require_admin
def update_file_status(file_id):
    """Cập nhật trạng thái file (chỉ admin)"""
    try:
        data = request.json
        is_active = data.get('is_active', True)
        
        result = file_manager.update_file_status(file_id, is_active)
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/files/cleanup', methods=['POST'])
@require_auth
@require_admin
def cleanup_files():
    """Dọn dẹp files orphaned (chỉ admin)"""
    try:
        result = file_manager.cleanup_orphaned_files()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== USER FILE ENDPOINTS ====================

@app.route('/user/files', methods=['GET'])
@require_auth
def get_user_files():
    """Lấy danh sách files của user hiện tại"""
    try:
        username = request.user['username']
        files = file_manager.get_files_by_user(username)
        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user/files', methods=['POST'])
@require_auth
def user_upload_file():
    """Upload file (user thường)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        uploaded_by = request.user['username']
        result = file_manager.add_file(file, uploaded_by)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== SIMPLE CHAT ENDPOINT ====================

@app.route('/chat', methods=['POST'])
@require_auth
def chat():
    """Chat với AI Mistral (yêu cầu đăng nhập)"""
    try:
        data = request.json
        msg = data.get('msg', '').strip()
        file_urls = data.get('urls', [])  # Optional file URLs

        if not msg:
            return jsonify({'error': 'Message không được để trống'}), 400

        # Tạo context cho LLM workflow
        initial_state = {
            "question": msg,
            "steps": [],
            "file_urls": file_urls,
            "file_documents": [],
            "documents": [],
            "generation": ""
        }
        
        # Chạy LLM workflow
        config = {"configurable": {"thread_id": str(uuid.uuid4())}}
        state_dict = workflow.invoke(initial_state, config)
        
        # Lấy kết quả từ AI
        ai_answer = state_dict.get("generation", "Sorry, I couldn't generate a response.")
        steps = state_dict.get("steps", [])
        
        return jsonify({
            "answer": ai_answer,
            "steps": steps,
            "user": request.user['username'],
            "question": msg
        })

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/chat/public', methods=['POST'])
def chat_public():
    """Chat public với AI Mistral (không cần đăng nhập) - để test"""
    try:
        data = request.json
        msg = data.get('msg', '').strip()
        file_urls = data.get('urls', [])  # Optional file URLs

        if not msg:
            return jsonify({'error': 'Message không được để trống'}), 400

        # Tạo context cho LLM workflow
        initial_state = {
            "question": msg,
            "steps": [],
            "file_urls": file_urls,
            "file_documents": [],
            "documents": [],
            "generation": ""
        }
        
        # Chạy LLM workflow
        config = {"configurable": {"thread_id": str(uuid.uuid4())}}
        state_dict = workflow.invoke(initial_state, config)
        
        # Lấy kết quả từ AI
        ai_answer = state_dict.get("generation", "Sorry, I couldn't generate a response.")
        steps = state_dict.get("steps", [])
        
        return jsonify({
            "answer": ai_answer,
            "steps": steps,
            "user": "public",
            "question": msg,
            "note": "This is a public endpoint for testing"
        })

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

# ==================== HEALTH CHECK ====================

@app.route('/status', methods=['GET'])
def server_status():
    """Server status endpoint - không yêu cầu đăng nhập"""
    return jsonify({
        'status': 'running',
        'message': 'Server is running',
        'auth_required': 'true',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
@require_auth
def health_check():
    """Health check endpoint - yêu cầu đăng nhập"""
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running',
        'auth_system': 'enabled',
        'user': request.user['username'],
        'role': request.user['role']
    })

if __name__ == '__main__':
    host = os.getenv("SERVER__HOST", "0.0.0.0")
    port = int(os.getenv("SERVER__PORT", 5000))
    
    print(f"🚀 Starting server on {host}:{port}")
    print(f"📋 Default admin account: admin / admin123")
    print(f"🔗 Health check: http://{host}:{port}/health")
    
    app.run(host=host, port=port, debug=True)