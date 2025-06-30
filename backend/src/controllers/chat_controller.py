from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.chat_manager import chat_manager
from src.file_search import file_search_engine
from src.file_classifier import file_classifier
from src.cloud_integration import cloud_integration
from src.file_manager import file_manager

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat/sessions', methods=['POST'])
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

@chat_bp.route('/chat/sessions', methods=['GET'])
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

@chat_bp.route('/chat/sessions/<session_id>', methods=['GET'])
@require_auth
def get_chat_messages(session_id):
    """Lấy danh sách messages trong một session"""
    try:
        limit = request.args.get('limit', 50, type=int)
        messages = chat_manager.get_chat_messages(session_id, limit)
        return jsonify({'messages': messages})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/chat/sessions/<session_id>/send', methods=['POST'])
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

@chat_bp.route('/chat/sessions/<session_id>', methods=['DELETE'])
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

@chat_bp.route('/chat/sessions/<session_id>/title', methods=['PUT'])
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

@chat_bp.route('/chat/public/sessions', methods=['POST'])
def create_public_chat_session():
    """Tạo public chat session (không cần auth)"""
    try:
        data = request.json
        title = data.get('title', 'Public Chat')
        
        result = chat_manager.create_chat_session(
            user_id=None,
            username="anonymous",
            title=title
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/chat/public/sessions/<session_id>/send', methods=['POST'])
def send_public_message(session_id):
    """Gửi message trong public session"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        result = chat_manager.send_message(
            session_id=session_id,
            message=message,
            user_id=None,
            username="anonymous"
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/chat', methods=['POST'])
@require_auth
def chat():
    """Legacy chat endpoint"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        user_id = request.user['user_id']
        username = request.user['username']
        
        # Tạo session mới nếu cần
        session_result = chat_manager.create_chat_session(
            user_id=user_id,
            username=username,
            title=f"Chat: {message[:50]}..."
        )
        
        if session_result['success']:
            session_id = session_result['session']['id']
            result = chat_manager.send_message(
                session_id=session_id,
                message=message,
                user_id=user_id,
                username=username
            )
            
            if result['success']:
                return jsonify({'response': result['response']})
            else:
                return jsonify(result), 400
        else:
            return jsonify(session_result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/chat/public', methods=['POST'])
def chat_public():
    """Public chat endpoint cũ (legacy)"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        # Tạo public session
        session_result = chat_manager.create_chat_session(
            user_id=None,
            username="anonymous",
            title="Public Chat"
        )
        
        if session_result['success']:
            session_id = session_result['session']['id']
            result = chat_manager.send_message(
                session_id=session_id,
                message=message,
                user_id=None,
                username="anonymous"
            )
            
            if result['success']:
                return jsonify({'response': result['response']})
            else:
                return jsonify(result), 400
        else:
            return jsonify(session_result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/chat/enhanced', methods=['POST'])
@require_auth
def chat_enhanced():
    """Chat với khả năng tìm kiếm file"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        session_id = data.get('session_id')
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        # Kiểm tra xem có phải là câu hỏi tìm kiếm file không
        search_keywords = ['tìm', 'file', 'tài liệu', 'document', 'search', 'find']
        is_file_search = any(keyword in message.lower() for keyword in search_keywords)
        
        if is_file_search:
            # Thực hiện tìm kiếm file
            search_results = file_search_engine.search_all(message)
            
            # Tạo response cho tìm kiếm file
            if search_results['total_results'] > 0:
                files_found = []
                for result in search_results['results'][:5]:  # Lấy 5 kết quả đầu
                    files_found.append({
                        'name': result['name'],
                        'type': result['type'],
                        'uploaded_by': result['uploaded_by'],
                        'match_score': result['match_score']
                    })
                
                response = f"Đã tìm thấy {search_results['total_results']} file phù hợp:\n"
                for i, file_info in enumerate(files_found, 1):
                    response += f"{i}. {file_info['name']} ({file_info['type']}) - Điểm: {file_info['match_score']}\n"
                
                # Gửi metadata lên cloud cho các file tìm được
                for result in search_results['results']:
                    try:
                        file_info = file_manager.get_file_by_id(result['id'])
                        if file_info:
                            # Lấy classification nếu có
                            metadata_result = cloud_integration.get_metadata_from_cloud(result['id'])
                            classification = metadata_result.get('metadata', {}).get('classification', {})
                            
                            # Gửi metadata
                            cloud_integration.send_metadata_to_cloud(file_info, classification)
                    except Exception as e:
                        print(f"Error sending metadata for file {result['id']}: {e}")
                
            else:
                response = "Không tìm thấy file nào phù hợp với yêu cầu của bạn."
            
            return jsonify({
                'success': True,
                'response': response,
                'search_results': search_results,
                'is_file_search': True
            })
        else:
            # Sử dụng chat thông thường
            if session_id:
                result = chat_manager.send_message(
                    session_id=session_id,
                    message=message,
                    user_id=request.user['user_id'],
                    username=request.user['username']
                )
            else:
                # Tạo session mới
                session_result = chat_manager.create_chat_session(
                    user_id=request.user['user_id'],
                    username=request.user['username'],
                    title=f"Chat: {message[:50]}..."
                )
                
                if session_result['success']:
                    result = chat_manager.send_message(
                        session_id=session_result['session']['id'],
                        message=message,
                        user_id=request.user['user_id'],
                        username=request.user['username']
                    )
                else:
                    return jsonify(session_result), 400
            
            return jsonify({
                'success': True,
                'response': result.get('response', ''),
                'session_id': session_id or session_result['session']['id'],
                'is_file_search': False
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500 