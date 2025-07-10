from flask import Blueprint, request, jsonify
from src.llm import workflow, RagDataContext
import uuid
from datetime import datetime

public_chat_bp = Blueprint('public_chat', __name__)

# ==================== PUBLIC CHAT ENDPOINTS ====================

@public_chat_bp.route('/public/chat', methods=['POST'])
def public_chat():
    """
    Chat công khai không cần đăng nhập
    ---
    tags:
      - Public Chat
    consumes:
      - application/json
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - message
          properties:
            message:
              type: string
              description: Nội dung tin nhắn
              example: "Xin chào, bạn có thể giúp gì cho tôi?"
    responses:
      200:
        description: Chat thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Xin chào, bạn có thể giúp gì cho tôi?"
            response:
              type: string
              example: "Xin chào! Tôi là AI assistant, tôi có thể giúp bạn..."
            timestamp:
              type: string
              format: date-time
              example: "2024-01-01T12:00:00Z"
        examples:
          application/json: {
            "success": true,
            "message": "Xin chào, bạn có thể giúp gì cho tôi?",
            "response": "Xin chào! Tôi là AI assistant, tôi có thể giúp bạn trả lời các câu hỏi, tìm kiếm thông tin, và hỗ trợ nhiều tác vụ khác. Bạn cần tôi giúp gì cụ thể không?",
            "timestamp": "2024-01-01T12:00:00Z"
          }
      400:
        description: Dữ liệu không hợp lệ
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Message không được để trống"
          }
      500:
        description: Lỗi server
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Lỗi server nội bộ"
          }
    """
    try:
        data = request.json
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        # Tạo RagDataContext cho public chat
        rag_context = RagDataContext(
            question=message,
            generation="",
            documents=[],
            steps=[],
            file_urls=[],
            file_documents=[],
            chat_context=""
        )
        
        # Chạy workflow để generate response
        config = {"configurable": {"thread_id": str(uuid.uuid4())}}
        result = workflow.invoke(rag_context, config)
        
        response = result.get("generation", "Xin lỗi, tôi không thể trả lời câu hỏi này.")
        
        return jsonify({
            'success': True,
            'message': message,
            'response': response,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@public_chat_bp.route('/public/chat/simple', methods=['POST'])
def simple_chat():
    """
    Chat đơn giản không cần đăng nhập
    ---
    tags:
      - Public Chat
    consumes:
      - application/json
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - message
          properties:
            message:
              type: string
              description: Nội dung tin nhắn
              example: "Xin chào"
    responses:
      200:
        description: Chat thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            response:
              type: string
              example: "Xin chào! Tôi có thể giúp gì cho bạn?"
        examples:
          application/json: {
            "success": true,
            "response": "Xin chào! Tôi có thể giúp gì cho bạn?"
          }
      400:
        description: Dữ liệu không hợp lệ
      500:
        description: Lỗi server
    """
    try:
        data = request.json
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        # Tạo response đơn giản
        if 'xin chào' in message.lower() or 'hello' in message.lower():
            response = "Xin chào! Tôi có thể giúp gì cho bạn?"
        elif 'cảm ơn' in message.lower() or 'thank' in message.lower():
            response = "Không có gì! Tôi rất vui được giúp bạn."
        elif 'tạm biệt' in message.lower() or 'goodbye' in message.lower():
            response = "Tạm biệt! Hẹn gặp lại bạn!"
        else:
            response = "Tôi hiểu bạn đang nói về: " + message + ". Bạn cần tôi giúp gì thêm không?"
        
        return jsonify({
            'success': True,
            'response': response
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@public_chat_bp.route('/public/health', methods=['GET'])
def health_check():
    """
    Kiểm tra trạng thái hệ thống
    ---
    tags:
      - Public Chat
    responses:
      200:
        description: Hệ thống hoạt động bình thường
        schema:
          type: object
          properties:
            status:
              type: string
              example: "healthy"
            timestamp:
              type: string
              format: date-time
              example: "2024-01-01T12:00:00Z"
            version:
              type: string
              example: "1.0.0"
        examples:
          application/json: {
            "status": "healthy",
            "timestamp": "2024-01-01T12:00:00Z",
            "version": "1.0.0"
          }
    """
    try:
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'message': 'Local LLM Chat App is running'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500 