from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.file_search import file_search_engine

search_bp = Blueprint('search', __name__)

# ==================== FILE SEARCH ====================

@search_bp.route('/search/files', methods=['POST'])
@require_auth
def search_files():
    """
    Tìm kiếm file theo tên hoặc nội dung
    ---
    tags:
      - Search
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
            - query
          properties:
            query:
              type: string
              description: Từ khóa tìm kiếm
              example: "kế hoạch 2024"
            search_type:
              type: string
              description: Loại tìm kiếm (name/content/both)
              example: "both"
              enum: ["name", "content", "both"]
            limit:
              type: integer
              description: Số lượng kết quả tối đa (mặc định 20)
              example: 20
    responses:
      200:
        description: Kết quả tìm kiếm file
        schema:
          type: object
          properties:
            query:
              type: string
              example: "kế hoạch 2024"
            search_type:
              type: string
              example: "both"
            total:
              type: integer
              example: 5
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
                  file_type:
                    type: string
                    example: "pdf"
                  match_score:
                    type: number
                    example: 0.85
                  uploaded_by:
                    type: string
                    example: "user1"
                  uploaded_at:
                    type: string
                    format: date-time
                    example: "2024-01-01T00:00:00Z"
        examples:
          application/json: {
            "query": "kế hoạch 2024",
            "search_type": "both",
            "total": 5,
            "results": [
              {
                "id": "file_123",
                "name": "ke_hoach_2024.pdf",
                "file_type": "pdf",
                "match_score": 0.85,
                "uploaded_by": "user1",
                "uploaded_at": "2024-01-01T00:00:00Z"
              }
            ]
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
            "error": "Query không được để trống"
          }
          application/json: {
            "error": "Search type không hợp lệ"
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
        query = data.get('query', '').strip()
        search_type = data.get('search_type', 'both')  # 'name', 'content', 'both'
        limit = data.get('limit', 20)
        
        if not query:
            return jsonify({'error': 'Query không được để trống'}), 400
            
        if search_type not in ['name', 'content', 'both']:
            return jsonify({'error': 'Search type không hợp lệ'}), 400
        
        user_id = request.user['user_id']
        user_role = request.user['role']
        results = file_search_engine.search_files(
            query=query,
            user_id=user_id,
            user_role=user_role,
            search_type=search_type,
            limit=limit
        )
        
        return jsonify({
            'query': query,
            'search_type': search_type,
            'results': results,
            'total': len(results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/search/files/suggestions', methods=['GET'])
@require_auth
def get_search_suggestions():
    """
    Gợi ý từ khóa tìm kiếm file
    ---
    tags:
      - Search
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
      - name: query
        in: query
        type: string
        required: false
        description: Từ khóa để gợi ý (tùy chọn)
        example: "kế"
    responses:
      200:
        description: Danh sách gợi ý từ khóa
        schema:
          type: object
          properties:
            query:
              type: string
              example: "kế"
            suggestions:
              type: array
              items:
                type: string
              example: ["kế hoạch", "kế toán", "kế hoạch 2024"]
        examples:
          application/json: {
            "query": "kế",
            "suggestions": ["kế hoạch", "kế toán", "kế hoạch 2024"]
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
        user_role = request.user['role']
        query = request.args.get('query', '').strip()
        
        suggestions = file_search_engine.get_search_suggestions(
            user_id=user_id,
            user_role=user_role,
            query=query
        )
        
        return jsonify({
            'query': query,
            'suggestions': suggestions
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 