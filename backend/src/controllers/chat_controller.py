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
    """
    Tạo chat session mới
    ---
    tags:
      - Chat
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
              example: "Chat về kế hoạch"
    responses:
      200:
        description: Tạo session thành công
        examples:
          application/json: { "success": true, "session": {"id": "abc123", "title": "Chat về kế hoạch"} }
      401:
        description: Không xác thực
    """
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
    """
    Lấy danh sách chat sessions của user
    ---
    tags:
      - Chat
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
    responses:
      200:
        description: Danh sách chat sessions
        schema:
          type: object
          properties:
            sessions:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                    example: "session_123"
                  title:
                    type: string
                    example: "Chat về kế hoạch 2024"
                  created_at:
                    type: string
                    format: date-time
                    example: "2024-01-01T00:00:00Z"
                  updated_at:
                    type: string
                    format: date-time
                    example: "2024-01-01T12:00:00Z"
                  message_count:
                    type: integer
                    example: 5
        examples:
          application/json: {
            "sessions": [
              {
                "id": "session_123",
                "title": "Chat về kế hoạch 2024",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T12:00:00Z",
                "message_count": 5
              }
            ]
          }
      401:
        description: Không xác thực
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Token không hợp lệ"
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
        user_id = request.user['user_id']
        username = request.user['username']
        
        sessions = chat_manager.get_chat_sessions(user_id=user_id)
        return jsonify({'sessions': sessions})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/chat/sessions/<session_id>', methods=['GET'])
@require_auth
def get_chat_messages(session_id):
    """
    Lấy danh sách messages trong một session
    ---
    tags:
      - Chat
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
      - name: session_id
        in: path
        type: string
        required: true
        description: ID của chat session
        example: "session_123"
      - name: limit
        in: query
        type: integer
        required: false
        description: Số lượng messages tối đa (mặc định 50)
        example: 50
    responses:
      200:
        description: Danh sách messages
        schema:
          type: object
          properties:
            messages:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                    example: "msg_123"
                  content:
                    type: string
                    example: "Xin chào, tôi cần tìm file về kế hoạch 2024"
                  role:
                    type: string
                    example: "user"
                    enum: ["user", "assistant"]
                  timestamp:
                    type: string
                    format: date-time
                    example: "2024-01-01T12:00:00Z"
        examples:
          application/json: {
            "messages": [
              {
                "id": "msg_123",
                "content": "Xin chào, tôi cần tìm file về kế hoạch 2024",
                "role": "user",
                "timestamp": "2024-01-01T12:00:00Z"
              },
              {
                "id": "msg_124",
                "content": "Tôi đã tìm thấy 2 file phù hợp với yêu cầu của bạn...",
                "role": "assistant",
                "timestamp": "2024-01-01T12:01:00Z"
              }
            ]
          }
      401:
        description: Không xác thực
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Token không hợp lệ"
          }
      404:
        description: Session không tồn tại
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Session không tồn tại"
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
        limit = request.args.get('limit', 50, type=int)
        messages = chat_manager.get_chat_messages(session_id, limit)
        return jsonify({'messages': messages})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/chat/sessions/<session_id>/send', methods=['POST'])
@require_auth
def send_message(session_id):
    """
    Gửi message trong session (tìm file hoặc chat AI)
    ---
    tags:
      - Chat
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
      - name: session_id
        in: path
        type: string
        required: true
        description: ID session
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Tìm file có nội dung về kế hoạch 2024"
    responses:
      200:
        description: Kết quả chat hoặc tìm file
        examples:
          application/json: { "success": true, "response": "Đã tìm thấy 2 file...", "files": [{"name": "plan2024.pdf"}] }
      401:
        description: Không xác thực
    """
    try:
        data = request.json
        message = data.get('message', '').strip()
        print(f"[DEBUG][send_message] Message: {message}")
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        # Kiểm tra xem có phải là câu hỏi tìm kiếm file không
        search_keywords = ['tìm', 'file', 'tài liệu', 'document', 'search', 'find']
        is_file_search = any(keyword in message.lower() for keyword in search_keywords)
        if is_file_search:
            # 1. Trả về thông báo đang tìm kiếm (nếu muốn streaming thì yield, ở đây trả về sau cùng)
            # 2. Tìm file với lọc theo quyền truy cập
            user_id = request.user['user_id']
            user_role = request.user['role']
            search_results = file_search_engine.search_all(message, user_id, user_role)
            print(f"[DEBUG][send_message] Search results: {search_results}")
            files_found = []
            metadata_results = []
            for result in search_results['results'][:5]:
                # Lấy thông tin file
                file_info = file_manager.get_file_by_id(result['id'])
                if not file_info:
                    continue
                # 3. Phân loại file bằng AI (LLM)
                classification = file_classifier.classify_file(file_info['file_path'], file_info['original_name'])
                # 4. Gửi metadata lên cloud
                cloud_result = cloud_integration.send_metadata_to_cloud(file_info, classification)
                metadata_results.append({
                    'file_id': file_info['id'],
                    'classification': classification,
                    'cloud_result': cloud_result
                })
                # 5. Chuẩn bị dữ liệu trả về
                file_url = f"/api/user/files/download/{file_info['id']}"
                files_found.append({
                    'name': file_info['original_name'],
                    'type': file_info['file_type'],
                    'uploaded_by': file_info['uploaded_by'],
                    'match_score': result['match_score'],
                    'download_url': file_url,
                    'classification': classification
                })
            if files_found:
                response = f"Đã tìm thấy {len(files_found)} file, metadata đã gửi.\n"
                for i, file_info in enumerate(files_found, 1):
                    response += f"{i}. {file_info['name']} ({file_info['type']}) - Nhóm: {file_info['classification'].get('group_name','?')} - [Tải về]({file_info['download_url']})\n"
            else:
                response = "Không tìm thấy file nào phù hợp với yêu cầu của bạn."
            return jsonify({
                'success': True,
                'response': response,
                'files': files_found,
                'metadata_results': metadata_results,
                'is_file_search': True
            })
        # Nếu không phải tìm file, xử lý chat bình thường
        result = chat_manager.send_message(
            session_id=session_id,
            message=message,
            user_id=request.user['user_id'],
            username=request.user['username']
        )
        return jsonify(result)
    except Exception as e:
        print(f"[DEBUG][send_message] Exception: {e}")
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/chat/sessions/<session_id>', methods=['DELETE'])
@require_auth
def delete_chat_session(session_id):
    """
    Xóa chat session
    ---
    tags:
      - Chat
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
      - name: session_id
        in: path
        type: string
        required: true
        description: ID của chat session cần xóa
        example: "session_123"
    responses:
      200:
        description: Xóa session thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Xóa session thành công"
        examples:
          application/json: {
            "success": true,
            "message": "Xóa session thành công"
          }
      400:
        description: Không thể xóa session
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: false
            error:
              type: string
        examples:
          application/json: {
            "success": false,
            "error": "Không thể xóa session"
          }
      401:
        description: Không xác thực
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Token không hợp lệ"
          }
      403:
        description: Không có quyền xóa session
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Không có quyền xóa session này"
          }
      404:
        description: Session không tồn tại
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Session không tồn tại"
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
    """
    Cập nhật tiêu đề chat session
    ---
    tags:
      - Chat
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
      - name: session_id
        in: path
        type: string
        required: true
        description: ID của chat session
        example: "session_123"
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - title
          properties:
            title:
              type: string
              description: Tiêu đề mới cho session
              example: "Kế hoạch kinh doanh 2024"
    responses:
      200:
        description: Cập nhật tiêu đề thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Cập nhật tiêu đề thành công"
            session:
              type: object
              properties:
                id:
                  type: string
                  example: "session_123"
                title:
                  type: string
                  example: "Kế hoạch kinh doanh 2024"
        examples:
          application/json: {
            "success": true,
            "message": "Cập nhật tiêu đề thành công",
            "session": {
              "id": "session_123",
              "title": "Kế hoạch kinh doanh 2024"
            }
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
            "error": "Title không được để trống"
          }
      401:
        description: Không xác thực
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Token không hợp lệ"
          }
      403:
        description: Không có quyền cập nhật session
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Không có quyền cập nhật session này"
          }
      404:
        description: Session không tồn tại
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Session không tồn tại"
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





@chat_bp.route('/chat', methods=['POST'])
@require_auth
def chat():
    """
    Legacy chat endpoint (tự động tạo session)
    ---
    tags:
      - Chat
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
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
              example: "Xin chào, tôi cần tư vấn về dự án"
    responses:
      200:
        description: Chat thành công
        schema:
          type: object
          properties:
            response:
              type: string
              example: "Xin chào! Tôi có thể giúp gì cho bạn về dự án?"
        examples:
          application/json: {
            "response": "Xin chào! Tôi có thể giúp gì cho bạn về dự án?"
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
      401:
        description: Không xác thực
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Token không hợp lệ"
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



@chat_bp.route('/chat/enhanced', methods=['POST'])
@require_auth
def chat_enhanced():
    """
    Chat với khả năng tìm kiếm file
    ---
    tags:
      - Enhanced Chat
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
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
              description: Nội dung tin nhắn hoặc yêu cầu tìm kiếm file
              example: "Tìm file về kế hoạch 2024"
            session_id:
              type: string
              description: ID session (tùy chọn, nếu không có sẽ tạo mới)
              example: "session_123"
    responses:
      200:
        description: Chat hoặc tìm kiếm thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            response:
              type: string
              example: "Đã tìm thấy 2 file phù hợp với yêu cầu của bạn..."
            session_id:
              type: string
              example: "session_123"
            is_file_search:
              type: boolean
              example: true
            search_results:
              type: object
              description: Kết quả tìm kiếm (chỉ có khi is_file_search = true)
              properties:
                total_results:
                  type: integer
                  example: 2
                results:
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        type: string
                        example: "file_123"
                      name:
                        type: string
                        example: "ke_hoach_2024.pdf"
                      type:
                        type: string
                        example: "pdf"
                      match_score:
                        type: number
                        example: 0.85
        examples:
          application/json: {
            "success": true,
            "response": "Đã tìm thấy 2 file phù hợp với yêu cầu của bạn:\n1. ke_hoach_2024.pdf (pdf) - Điểm: 0.85\n2. bao_cao_2024.docx (docx) - Điểm: 0.72",
            "session_id": "session_123",
            "is_file_search": true,
            "search_results": {
              "total_results": 2,
              "results": [
                {
                  "id": "file_123",
                  "name": "ke_hoach_2024.pdf",
                  "type": "pdf",
                  "match_score": 0.85
                }
              ]
            }
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
      401:
        description: Không xác thực
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Token không hợp lệ"
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
        session_id = data.get('session_id')
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        # Kiểm tra xem có phải là câu hỏi tìm kiếm file không
        search_keywords = ['tìm', 'file', 'tài liệu', 'document', 'search', 'find']
        is_file_search = any(keyword in message.lower() for keyword in search_keywords)
        
        if is_file_search:
            # Thực hiện tìm kiếm file với lọc theo quyền truy cập
            user_id = request.user['user_id']
            user_role = request.user['role']
            search_results = file_search_engine.search_all(message, user_id, user_role)
            
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