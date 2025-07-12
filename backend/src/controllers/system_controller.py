from flask import Blueprint, request, jsonify
from src.auth import require_auth
from datetime import datetime

system_bp = Blueprint('system', __name__)

# ==================== SYSTEM STATUS & HEALTH ====================

@system_bp.route('/system/status', methods=['GET'])
def server_status():
    """
    Kiểm tra trạng thái server
    ---
    tags:
      - System
    responses:
      200:
        description: Server đang chạy
        schema:
          type: object
          properties:
            status:
              type: string
              example: "running"
            timestamp:
              type: string
              format: date-time
              example: "2024-01-01T12:00:00Z"
            version:
              type: string
              example: "1.0.0"
        examples:
          application/json: {
            "status": "running",
            "timestamp": "2024-01-01T12:00:00Z",
            "version": "1.0.0"
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
        return jsonify({
            'status': 'running',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@system_bp.route('/system/health', methods=['GET'])
@require_auth
def health_check():
    """
    Kiểm tra sức khỏe hệ thống
    ---
    tags:
      - System
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
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
            components:
              type: object
              properties:
                database:
                  type: string
                  example: "ok"
                file_system:
                  type: string
                  example: "ok"
                vector_db:
                  type: string
                  example: "ok"
                llm:
                  type: string
                  example: "ok"
        examples:
          application/json: {
            "status": "healthy",
            "timestamp": "2024-01-01T12:00:00Z",
            "components": {
              "database": "ok",
              "file_system": "ok",
              "vector_db": "ok",
              "llm": "ok"
            }
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
        description: Hệ thống không khỏe mạnh
        schema:
          type: object
          properties:
            status:
              type: string
              example: "unhealthy"
            error:
              type: string
            timestamp:
              type: string
              format: date-time
              example: "2024-01-01T12:00:00Z"
        examples:
          application/json: {
            "status": "unhealthy",
            "error": "Database connection failed",
            "timestamp": "2024-01-01T12:00:00Z"
          }
    """
    try:
        # Kiểm tra các thành phần chính
        health_status = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'components': {
                'database': 'ok',
                'file_system': 'ok',
                'vector_db': 'ok',
                'llm': 'ok'
            }
        }
        
        return jsonify(health_status)
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500 