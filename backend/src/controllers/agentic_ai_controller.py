from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.agentic_ai import agentic_ai
from src.agentic_session_manager import agentic_session_manager

agentic_ai_bp = Blueprint('agentic_ai', __name__)

# ==================== AGENTIC AI ENDPOINTS ====================

@agentic_ai_bp.route('/agentic/plan', methods=['POST'])
@require_auth
def plan_actions():
    """
    Lên kế hoạch hành động cho Agentic AI
    ---
    tags:
      - Agentic AI
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - user_request
          properties:
            user_request:
              type: string
              description: Yêu cầu của user
              example: "Tìm file 'kế hoạch marketing 2024' và xuất danh sách"
    responses:
      200:
        description: Lên kế hoạch thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            plan:
              type: object
              properties:
                plan:
                  type: array
                  items:
                    type: object
                    properties:
                      action:
                        type: string
                        example: "search_files"
                      description:
                        type: string
                        example: "Tìm kiếm file có chứa 'kế hoạch marketing 2024'"
                      parameters:
                        type: object
                        example: {"query": "kế hoạch marketing 2024", "search_type": "both"}
                      order:
                        type: integer
                        example: 1
                expected_output:
                  type: string
                  example: "Danh sách file tìm được với phân loại và file Excel metadata"
                estimated_steps:
                  type: integer
                  example: 3
            user_request:
              type: string
              example: "Tìm file 'kế hoạch marketing 2024' và xuất danh sách"
            created_at:
              type: string
              format: date-time
        examples:
          application/json: {
            "success": true,
            "plan": {
              "plan": [
                {
                  "action": "search_files",
                  "description": "Tìm kiếm file có chứa 'kế hoạch marketing 2024'",
                  "parameters": {"query": "kế hoạch marketing 2024", "search_type": "both"},
                  "order": 1
                },
                {
                  "action": "classify_files",
                  "description": "Phân loại các file tìm được",
                  "parameters": {"file_ids": "dynamic"},
                  "order": 2
                },
                {
                  "action": "export_metadata",
                  "description": "Xuất metadata ra file Excel",
                  "parameters": {"file_ids": "dynamic", "output_format": "excel"},
                  "order": 3
                }
              ],
              "expected_output": "Danh sách file tìm được với phân loại và file Excel metadata",
              "estimated_steps": 3
            },
            "user_request": "Tìm file 'kế hoạch marketing 2024' và xuất danh sách",
            "created_at": "2024-01-01T12:00:00Z"
          }
      400:
        description: Dữ liệu không hợp lệ
      401:
        description: Không xác thực
      500:
        description: Lỗi server
    """
    try:
        data = request.json
        user_request = data.get('user_request', '').strip()
        
        if not user_request:
            return jsonify({'error': 'User request không được để trống'}), 400
        
        # Lên kế hoạch hành động
        plan_result = agentic_ai.plan_actions(user_request)
        
        return jsonify(plan_result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_ai_bp.route('/agentic/execute', methods=['POST'])
@require_auth
def execute_plan():
    """
    Thực hiện kế hoạch hành động của Agentic AI
    ---
    tags:
      - Agentic AI
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - plan
          properties:
            plan:
              type: object
              description: Kế hoạch hành động từ /agentic/plan
              example: {
                "plan": [
                  {
                    "action": "search_files",
                    "description": "Tìm kiếm file có chứa 'kế hoạch marketing 2024'",
                    "parameters": {"query": "kế hoạch marketing 2024", "search_type": "both"},
                    "order": 1
                  }
                ],
                "expected_output": "Danh sách file tìm được",
                "estimated_steps": 1
              }
    responses:
      200:
        description: Thực hiện kế hoạch thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            execution_results:
              type: array
              items:
                type: object
                properties:
                  step:
                    type: object
                  result:
                    type: object
                  status:
                    type: string
                    example: "success"
            summary:
              type: object
              properties:
                total_steps_completed:
                  type: integer
                  example: 3
                files_processed:
                  type: integer
                  example: 5
                actions_performed:
                  type: array
                  items:
                    type: object
            total_steps:
              type: integer
              example: 3
            completed_at:
              type: string
              format: date-time
        examples:
          application/json: {
            "success": true,
            "execution_results": [
              {
                "step": {
                  "action": "search_files",
                  "description": "Tìm kiếm file có chứa 'kế hoạch marketing 2024'",
                  "parameters": {"query": "kế hoạch marketing 2024", "search_type": "both"},
                  "order": 1
                },
                "result": {
                  "action": "search_files",
                  "query": "kế hoạch marketing 2024",
                  "files_found": 2,
                  "files": [
                    {
                      "id": "file_123",
                      "name": "marketing_plan_2024.pdf",
                      "file_type": "application/pdf",
                      "match_score": 0.95
                    }
                  ]
                },
                "status": "success"
              }
            ],
            "summary": {
              "total_steps_completed": 1,
              "files_processed": 2,
              "actions_performed": [
                {
                  "action": "search_files",
                  "description": "Tìm kiếm file có chứa 'kế hoạch marketing 2024'",
                  "status": "success",
                  "details": {
                    "action": "search_files",
                    "query": "kế hoạch marketing 2024",
                    "files_found": 2
                  }
                }
              ]
            },
            "total_steps": 1,
            "completed_at": "2024-01-01T12:00:00Z"
          }
      400:
        description: Dữ liệu không hợp lệ
      401:
        description: Không xác thực
      500:
        description: Lỗi server
    """
    try:
        data = request.json
        plan = data.get('plan')
        
        if not plan:
            return jsonify({'error': 'Plan không được để trống'}), 400
        
        user_id = request.user['user_id']
        user_role = request.user['role']
        
        # Thực hiện kế hoạch
        execution_result = agentic_ai.execute_plan(plan, user_id, user_role)
        
        return jsonify(execution_result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_ai_bp.route('/agentic/plan-and-execute', methods=['POST'])
@require_auth
def plan_and_execute():
    """
    Lên kế hoạch và thực hiện ngay lập tức (One-step)
    ---
    tags:
      - Agentic AI
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - user_request
          properties:
            user_request:
              type: string
              description: Yêu cầu của user
              example: "Tìm file 'kế hoạch marketing 2024' và xuất danh sách"
    responses:
      200:
        description: Thực hiện thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            user_request:
              type: string
              example: "Tìm file 'kế hoạch marketing 2024' và xuất danh sách"
            plan:
              type: object
              description: Kế hoạch đã tạo
            execution_results:
              type: object
              description: Kết quả thực hiện
            summary:
              type: object
              description: Tóm tắt kết quả
        examples:
          application/json: {
            "success": true,
            "user_request": "Tìm file 'kế hoạch marketing 2024' và xuất danh sách",
            "plan": {
              "plan": [
                {
                  "action": "search_files",
                  "description": "Tìm kiếm file có chứa 'kế hoạch marketing 2024'",
                  "parameters": {"query": "kế hoạch marketing 2024", "search_type": "both"},
                  "order": 1
                }
              ],
              "expected_output": "Danh sách file tìm được",
              "estimated_steps": 1
            },
            "execution_results": {
              "success": true,
              "execution_results": [...],
              "summary": {
                "total_steps_completed": 1,
                "files_processed": 2
              }
            },
            "summary": {
              "total_steps": 1,
              "files_found": 2,
              "export_file": "metadata_export_20240101_120000.xlsx"
            }
          }
      400:
        description: Dữ liệu không hợp lệ
      401:
        description: Không xác thực
      500:
        description: Lỗi server
    """
    try:
        data = request.json
        user_request = data.get('user_request', '').strip()
        
        if not user_request:
            return jsonify({'error': 'User request không được để trống'}), 400
        
        user_id = request.user['user_id']
        user_role = request.user['role']
        
        # Bước 1: Lên kế hoạch
        plan_result = agentic_ai.plan_actions(user_request)
        
        if not plan_result['success']:
            return jsonify(plan_result), 400
        
        # Bước 2: Thực hiện kế hoạch
        execution_result = agentic_ai.execute_plan(plan_result['plan'], user_id, user_role)
        
        # Bước 3: Tạo summary tổng hợp
        summary = {
            'total_steps': execution_result.get('total_steps', 0),
            'files_found': 0,
            'export_file': None
        }
        
        # Đếm files tìm được
        for result in execution_result.get('execution_results', []):
            if result['step']['action'] == 'search_files':
                summary['files_found'] = result['result'].get('files_found', 0)
            elif result['step']['action'] == 'export_metadata':
                summary['export_file'] = result['result'].get('filename')
        
        return jsonify({
            'success': True,
            'user_request': user_request,
            'plan': plan_result['plan'],
            'execution_results': execution_result,
            'summary': summary
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_ai_bp.route('/agentic/available-actions', methods=['GET'])
@require_auth
def get_available_actions():
    """
    Lấy danh sách các hành động có thể thực hiện
    ---
    tags:
      - Agentic AI
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
    responses:
      200:
        description: Danh sách actions thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            actions:
              type: object
              properties:
                search_files:
                  type: object
                  properties:
                    name:
                      type: string
                      example: "Tìm kiếm file"
                    description:
                      type: string
                      example: "Tìm kiếm file theo tên hoặc nội dung"
                    parameters:
                      type: array
                      items:
                        type: string
                      example: ["query", "search_type"]
        examples:
          application/json: {
            "success": true,
            "actions": {
              "search_files": {
                "name": "Tìm kiếm file",
                "description": "Tìm kiếm file theo tên hoặc nội dung",
                "parameters": ["query", "search_type"]
              },
              "classify_files": {
                "name": "Phân loại file",
                "description": "Phân loại file thành các nhóm",
                "parameters": ["file_ids"]
              },
              "export_metadata": {
                "name": "Xuất metadata",
                "description": "Xuất metadata ra file Excel",
                "parameters": ["file_ids", "output_format"]
              }
            }
          }
      401:
        description: Không xác thực
    """
    try:
        return jsonify({
            'success': True,
            'actions': agentic_ai.available_actions
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== AGENTIC AI SESSION ENDPOINTS ====================

@agentic_ai_bp.route('/agentic/sessions', methods=['POST'])
@require_auth
def create_session():
    """
    Tạo session mới cho Agentic AI
    ---
    tags:
      - Agentic AI Sessions
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
      - name: body
        in: body
        required: false
        schema:
          type: object
          properties:
            title:
              type: string
              description: Tiêu đề session
              example: "Tìm kiếm file marketing"
            description:
              type: string
              description: Mô tả session
              example: "Session để tìm kiếm và phân tích file marketing"
    responses:
      200:
        description: Tạo session thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            session:
              type: object
              properties:
                id:
                  type: string
                  example: "session_123"
                title:
                  type: string
                  example: "Tìm kiếm file marketing"
                description:
                  type: string
                  example: "Session để tìm kiếm và phân tích file marketing"
                created_at:
                  type: string
                  format: date-time
                total_messages:
                  type: integer
                  example: 0
        examples:
          application/json: {
            "success": true,
            "session": {
              "id": "session_123",
              "user_id": "user_456",
              "username": "john_doe",
              "title": "Tìm kiếm file marketing",
              "description": "Session để tìm kiếm và phân tích file marketing",
              "created_at": "2024-01-01T12:00:00Z",
              "updated_at": "2024-01-01T12:00:00Z",
              "total_messages": 0,
              "last_activity": "2024-01-01T12:00:00Z"
            }
          }
      401:
        description: Không xác thực
      500:
        description: Lỗi server
    """
    try:
        data = request.json or {}
        title = data.get('title', 'Agentic AI Session')
        description = data.get('description')
        
        user_id = request.user['user_id']
        username = request.user['username']
        
        result = agentic_session_manager.create_session(
            user_id=user_id,
            username=username,
            title=title,
            description=description
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_ai_bp.route('/agentic/sessions', methods=['GET'])
@require_auth
def get_sessions():
    """
    Lấy danh sách sessions của user
    ---
    tags:
      - Agentic AI Sessions
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
      - name: limit
        in: query
        type: integer
        required: false
        description: Số lượng sessions tối đa
        default: 20
    responses:
      200:
        description: Lấy danh sách sessions thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
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
                    example: "Tìm kiếm file marketing"
                  description:
                    type: string
                    example: "Session để tìm kiếm và phân tích file marketing"
                  created_at:
                    type: string
                    format: date-time
                  total_messages:
                    type: integer
                    example: 5
                  last_activity:
                    type: string
                    format: date-time
        examples:
          application/json: {
            "success": true,
            "sessions": [
              {
                "id": "session_123",
                "title": "Tìm kiếm file marketing",
                "description": "Session để tìm kiếm và phân tích file marketing",
                "created_at": "2024-01-01T12:00:00Z",
                "updated_at": "2024-01-01T12:30:00Z",
                "total_messages": 5,
                "last_activity": "2024-01-01T12:30:00Z"
              }
            ]
          }
      401:
        description: Không xác thực
      500:
        description: Lỗi server
    """
    try:
        limit = request.args.get('limit', 20, type=int)
        user_id = request.user['user_id']
        
        result = agentic_session_manager.get_user_sessions(user_id, limit)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_ai_bp.route('/agentic/sessions/<session_id>', methods=['GET'])
@require_auth
def get_session_messages(session_id):
    """
    Lấy tin nhắn của session
    ---
    tags:
      - Agentic AI Sessions
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
      - name: session_id
        in: path
        type: string
        required: true
        description: ID của session
      - name: limit
        in: query
        type: integer
        required: false
        description: Số lượng tin nhắn tối đa
        default: 50
    responses:
      200:
        description: Lấy tin nhắn thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            session:
              type: object
              properties:
                id:
                  type: string
                  example: "session_123"
                title:
                  type: string
                  example: "Tìm kiếm file marketing"
                total_messages:
                  type: integer
                  example: 5
            messages:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                    example: "msg_123"
                  user_request:
                    type: string
                    example: "Tìm file marketing 2024"
                  message_type:
                    type: string
                    example: "user"
                  status:
                    type: string
                    example: "completed"
                  created_at:
                    type: string
                    format: date-time
                  plan:
                    type: object
                  execution_results:
                    type: object
                  summary:
                    type: object
        examples:
          application/json: {
            "success": true,
            "session": {
              "id": "session_123",
              "title": "Tìm kiếm file marketing",
              "description": "Session để tìm kiếm và phân tích file marketing",
              "total_messages": 5
            },
            "messages": [
              {
                "id": "msg_123",
                "user_request": "Tìm file marketing 2024",
                "message_type": "user",
                "status": "completed",
                "created_at": "2024-01-01T12:00:00Z",
                "completed_at": "2024-01-01T12:00:30Z",
                "plan": {
                  "plan": [
                    {
                      "action": "search_files",
                      "description": "Tìm kiếm file marketing 2024",
                      "parameters": {"query": "marketing 2024", "search_type": "both"},
                      "order": 1
                    }
                  ]
                },
                "execution_results": {
                  "success": true,
                  "execution_results": [...],
                  "summary": {...}
                }
              }
            ]
          }
      401:
        description: Không xác thực
      404:
        description: Session không tồn tại
      500:
        description: Lỗi server
    """
    try:
        limit = request.args.get('limit', 50, type=int)
        user_id = request.user['user_id']
        
        result = agentic_session_manager.get_session_messages(session_id, user_id, limit)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404 if 'không tồn tại' in result['error'].lower() else 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_ai_bp.route('/agentic/sessions/<session_id>/chat', methods=['POST'])
@require_auth
def chat_with_session(session_id):
    """
    Chat với Agentic AI trong session
    ---
    tags:
      - Agentic AI Sessions
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
      - name: session_id
        in: path
        type: string
        required: true
        description: ID của session
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - user_request
          properties:
            user_request:
              type: string
              description: Yêu cầu của user
              example: "Tìm file 'kế hoạch marketing 2024' và xuất danh sách"
    responses:
      200:
        description: Chat thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            session_id:
              type: string
              example: "session_123"
            message_id:
              type: string
              example: "msg_456"
            user_request:
              type: string
              example: "Tìm file 'kế hoạch marketing 2024' và xuất danh sách"
            plan:
              type: object
              description: Kế hoạch đã tạo
            execution_results:
              type: object
              description: Kết quả thực hiện
            summary:
              type: object
              description: Tóm tắt kết quả
        examples:
          application/json: {
            "success": true,
            "session_id": "session_123",
            "message_id": "msg_456",
            "user_request": "Tìm file 'kế hoạch marketing 2024' và xuất danh sách",
            "plan": {
              "plan": [
                {
                  "action": "search_files",
                  "description": "Tìm kiếm file có chứa 'kế hoạch marketing 2024'",
                  "parameters": {"query": "kế hoạch marketing 2024", "search_type": "both"},
                  "order": 1
                }
              ],
              "expected_output": "Danh sách file tìm được",
              "estimated_steps": 1
            },
            "execution_results": {
              "success": true,
              "execution_results": [...],
              "summary": {
                "total_steps_completed": 1,
                "files_processed": 2
              }
            },
            "summary": {
              "total_steps": 1,
              "files_found": 2
            }
          }
      400:
        description: Dữ liệu không hợp lệ
      401:
        description: Không xác thực
      404:
        description: Session không tồn tại
      500:
        description: Lỗi server
    """
    try:
        data = request.json
        user_request = data.get('user_request', '').strip()
        
        if not user_request:
            return jsonify({'error': 'User request không được để trống'}), 400
        
        user_id = request.user['user_id']
        username = request.user['username']
        user_role = request.user['role']
        
        result = agentic_session_manager.process_with_session(
            session_id=session_id,
            user_id=user_id,
            username=username,
            user_request=user_request,
            user_role=user_role
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agentic_ai_bp.route('/agentic/sessions/<session_id>', methods=['DELETE'])
@require_auth
def delete_session(session_id):
    """
    Xóa session
    ---
    tags:
      - Agentic AI Sessions
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
      - name: session_id
        in: path
        type: string
        required: true
        description: ID của session
    responses:
      200:
        description: Xóa session thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
        examples:
          application/json: {
            "success": true
          }
      401:
        description: Không xác thực
      404:
        description: Session không tồn tại
      500:
        description: Lỗi server
    """
    try:
        user_id = request.user['user_id']
        
        result = agentic_session_manager.delete_session(session_id, user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404 if 'không tồn tại' in result['error'].lower() else 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500 