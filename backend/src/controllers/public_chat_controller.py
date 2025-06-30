from flask import Blueprint, request, jsonify
from src.chat_manager import chat_manager
from src.llm import workflow, RagDataContext

public_chat_bp = Blueprint('public_chat', __name__)

# ==================== PUBLIC CHAT ENDPOINTS ====================

@public_chat_bp.route('/chat/public/sessions', methods=['POST'])
def create_public_chat_session():
    """Tạo public chat session (không cần auth)"""
    try:
        data = request.json
        title = data.get('title', 'Public Chat')
        
        result = chat_manager.create_public_chat_session(title=title)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@public_chat_bp.route('/chat/public/sessions/<session_id>/send', methods=['POST'])
def send_public_message(session_id):
    """Gửi message trong public chat session (không cần auth)"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        result = chat_manager.send_public_message(
            session_id=session_id,
            message=message
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@public_chat_bp.route('/chat/public', methods=['POST'])
def chat_public():
    """Chat công khai với LLM (không cần auth)"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        # Sử dụng LLM workflow để xử lý message
        response = workflow.process_message(message)
        
        return jsonify({
            'success': True,
            'message': message,
            'response': response,
            'timestamp': chat_manager.get_current_timestamp()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 