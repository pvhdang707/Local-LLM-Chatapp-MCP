from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.llm import workflow, RagDataContext
from src.file_search import file_search_engine
from src.file_classifier import file_classifier
from src.cloud_integration import cloud_integration

enhanced_chat_bp = Blueprint('enhanced_chat', __name__)

# ==================== ENHANCED CHAT ENDPOINTS ====================

@enhanced_chat_bp.route('/chat/enhanced', methods=['POST'])
@require_auth
def chat_enhanced():
    """
    Enhanced chat với tích hợp tìm kiếm file và phân loại
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
              description: Nội dung tin nhắn
              example: "Tìm file về kế hoạch 2024 và phân tích nội dung"
            search_files:
              type: boolean
              description: Có tìm kiếm files liên quan không
              example: true
            include_classification:
              type: boolean
              description: Có bao gồm thông tin phân loại không
              example: true
    responses:
      200:
        description: Enhanced chat thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Tìm file về kế hoạch 2024 và phân tích nội dung"
            response:
              type: string
              example: "Tôi đã tìm thấy 3 file liên quan đến kế hoạch 2024..."
            timestamp:
              type: string
              format: date-time
              example: "2024-01-01T12:00:00Z"
            related_files:
              type: array
              description: Danh sách files liên quan (nếu search_files=true)
              items:
                type: object
                properties:
                  id:
                    type: string
                    example: "file_123"
                  name:
                    type: string
                    example: "ke_hoach_2024.pdf"
                  file_type:
                    type: string
                    example: "pdf"
                  match_score:
                    type: number
                    example: 0.85
                  classification:
                    type: object
                    description: Thông tin phân loại (nếu include_classification=true)
                    properties:
                      group_name:
                        type: string
                        example: "Tài liệu kinh doanh"
                      confidence:
                        type: number
                        example: 0.95
                  cloud_metadata:
                    type: object
                    description: Metadata từ cloud
                    properties:
                      synced:
                        type: boolean
                        example: true
            context:
              type: object
              description: Thông tin context (nếu có files liên quan)
              properties:
                files_found:
                  type: integer
                  example: 3
                search_query:
                  type: string
                  example: "kế hoạch 2024"
        examples:
          application/json: {
            "success": true,
            "message": "Tìm file về kế hoạch 2024 và phân tích nội dung",
            "response": "Tôi đã tìm thấy 3 file liên quan đến kế hoạch 2024. Các file này thuộc nhóm 'Tài liệu kinh doanh' với độ tin cậy cao...",
            "timestamp": "2024-01-01T12:00:00Z",
            "related_files": [
              {
                "id": "file_123",
                "name": "ke_hoach_2024.pdf",
                "file_type": "pdf",
                "match_score": 0.85,
                "classification": {
                  "group_name": "Tài liệu kinh doanh",
                  "confidence": 0.95
                },
                "cloud_metadata": {
                  "synced": true
                }
              }
            ],
            "context": {
              "files_found": 3,
              "search_query": "kế hoạch 2024"
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
        search_files = data.get('search_files', False)
        include_classification = data.get('include_classification', False)
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        user_id = request.user['user_id']
        user_role = request.user['role']
        response_data = {
            'success': True,
            'message': message,
            'timestamp': workflow.get_current_timestamp()
        }
        
        # Tìm kiếm files liên quan nếu được yêu cầu
        if search_files:
            search_results = file_search_engine.search_files(
                query=message,
                user_id=user_id,
                user_role=user_role,
                search_type='both',
                limit=5
            )
            response_data['related_files'] = search_results
            
            # Thêm thông tin phân loại nếu được yêu cầu
            if include_classification and search_results:
                for file_result in search_results:
                    file_id = file_result.get('id')
                    if file_id:
                        classification = file_classifier.get_file_classification(file_id)
                        file_result['classification'] = classification
                        
                        metadata = cloud_integration.get_file_metadata(file_id)
                        file_result['cloud_metadata'] = metadata
        
        # Xử lý message với LLM
        llm_response = workflow.process_message(message)
        response_data['response'] = llm_response
        
        # Thêm context từ files liên quan nếu có
        if search_files and response_data.get('related_files'):
            context_info = {
                'files_found': len(response_data['related_files']),
                'search_query': message
            }
            response_data['context'] = context_info
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 