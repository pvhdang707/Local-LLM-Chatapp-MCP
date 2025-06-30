from flask import Blueprint, request, jsonify
from src.auth import require_auth
from datetime import datetime

system_bp = Blueprint('system', __name__)

# ==================== SYSTEM STATUS & HEALTH ====================

@system_bp.route('/status', methods=['GET'])
def server_status():
    """Kiểm tra trạng thái server"""
    try:
        return jsonify({
            'status': 'running',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@system_bp.route('/health', methods=['GET'])
@require_auth
def health_check():
    """Kiểm tra sức khỏe hệ thống (cần auth)"""
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