import traceback
import uuid
import os
from flask import Flask, request, jsonify
from auth import auth_manager, require_auth, require_admin
from file_manager import file_manager
from chat_manager import chat_manager
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

# ==================== CHAT SESSION ENDPOINTS ====================

@app.route('/chat/sessions', methods=['POST'])
@require_auth
def create_chat_session():
    """Tạo chat session mới"""
    try:
        data = request.json
        title = data.get('title', 'New Chat')
        user_id = request.user['user_id']
        username = request.user['username']
        
        result = chat_manager.create_chat_session(
            user_id=user_id,
            username=username,
            title=title
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/sessions', methods=['GET'])
@require_auth
def get_chat_sessions():
    """Lấy danh sách chat sessions của user"""
    try:
        user_id = request.user['user_id']
        username = request.user['username']
        
        sessions = chat_manager.get_chat_sessions(user_id=user_id)
        return jsonify({'sessions': sessions})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/sessions/<session_id>', methods=['GET'])
@require_auth
def get_chat_messages(session_id):
    """Lấy danh sách messages trong một session"""
    try:
        limit = request.args.get('limit', 50, type=int)
        messages = chat_manager.get_chat_messages(session_id, limit)
        return jsonify({'messages': messages})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/sessions/<session_id>/send', methods=['POST'])
@require_auth
def send_message(session_id):
    """Gửi message trong một session"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        file_urls = data.get('file_urls', [])
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        user_id = request.user['user_id']
        username = request.user['username']
        
        result = chat_manager.send_message(
            session_id=session_id,
            message=message,
            user_id=user_id,
            username=username,
            file_urls=file_urls
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/sessions/<session_id>', methods=['DELETE'])
@require_auth
def delete_chat_session(session_id):
    """Xóa chat session"""
    try:
        user_id = request.user['user_id']
        result = chat_manager.delete_chat_session(session_id, user_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/sessions/<session_id>/title', methods=['PUT'])
@require_auth
def update_session_title(session_id):
    """Cập nhật tiêu đề chat session"""
    try:
        data = request.json
        title = data.get('title', '').strip()
        
        if not title:
            return jsonify({'error': 'Title không được để trống'}), 400
        
        user_id = request.user['user_id']
        result = chat_manager.update_session_title(session_id, title, user_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== PUBLIC CHAT ENDPOINTS ====================

@app.route('/chat/public/sessions', methods=['POST'])
def create_public_chat_session():
    """Tạo public chat session (không cần auth)"""
    try:
        data = request.json
        title = data.get('title', 'Public Chat')
        username = data.get('username', 'anonymous')
        
        result = chat_manager.create_chat_session(
            username=username,
            title=title
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/public/sessions/<session_id>/send', methods=['POST'])
def send_public_message(session_id):
    """Gửi message trong public session"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        username = data.get('username', 'anonymous')
        file_urls = data.get('file_urls', [])
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        result = chat_manager.send_message(
            session_id=session_id,
            message=message,
            username=username,
            file_urls=file_urls
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
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

# ==================== USER FILE MANAGEMENT ENDPOINTS ====================

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
    """Upload file (user)"""
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

# ==================== LEGACY CHAT ENDPOINTS (for backward compatibility) ====================

@app.route('/chat', methods=['POST'])
@require_auth
def chat():
    """Chat endpoint cũ (legacy)"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        file_urls = data.get('file_urls', [])

        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400

        # Tạo context cho chat
        rag_context = RagDataContext(
            question=message,
            generation="",
            documents=[],
            steps=[],
            file_urls=file_urls,
            file_documents=[],
            chat_context=""  # Không có context cho legacy chat
        )

        # Chạy workflow
        config = {"configurable": {"thread_id": str(uuid.uuid4())}}
        result = workflow.invoke(rag_context, config)
        
        response = result.get("generation", "Xin lỗi, tôi không thể trả lời câu hỏi này.")

        return jsonify({
            'success': True,
            'response': response,
            'steps': result.get('steps', [])
        })

    except Exception as e:
        print(f"Error in chat: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/chat/public', methods=['POST'])
def chat_public():
    """Public chat endpoint cũ (legacy)"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        file_urls = data.get('file_urls', [])

        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400

        # Tạo context cho chat
        rag_context = RagDataContext(
            question=message,
            generation="",
            documents=[],
            steps=[],
            file_urls=file_urls,
            file_documents=[],
            chat_context=""  # Không có context cho legacy chat
        )

        # Chạy workflow
        config = {"configurable": {"thread_id": str(uuid.uuid4())}}
        result = workflow.invoke(rag_context, config)
        
        response = result.get("generation", "Xin lỗi, tôi không thể trả lời câu hỏi này.")

        return jsonify({
            'success': True,
            'response': response,
            'steps': result.get('steps', [])
        })

    except Exception as e:
        print(f"Error in public chat: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

# ==================== UTILITY ENDPOINTS ====================

@app.route('/status', methods=['GET'])
def server_status():
    """Kiểm tra trạng thái server"""
    return jsonify({
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/health', methods=['GET'])
@require_auth
def health_check():
    """Health check endpoint (cần auth)"""
    return jsonify({
        'status': 'healthy',
        'user': request.user,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)