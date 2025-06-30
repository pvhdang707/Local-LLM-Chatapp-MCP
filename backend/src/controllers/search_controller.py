from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.file_search import file_search_engine

search_bp = Blueprint('search', __name__)

# ==================== FILE SEARCH ====================

@search_bp.route('/search/files', methods=['POST'])
@require_auth
def search_files():
    """Tìm kiếm files theo tên và nội dung"""
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
        results = file_search_engine.search_files(
            query=query,
            user_id=user_id,
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
    """Lấy gợi ý tìm kiếm dựa trên lịch sử và files hiện có"""
    try:
        user_id = request.user['user_id']
        query = request.args.get('query', '').strip()
        
        suggestions = file_search_engine.get_search_suggestions(
            user_id=user_id,
            query=query
        )
        
        return jsonify({
            'query': query,
            'suggestions': suggestions
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 