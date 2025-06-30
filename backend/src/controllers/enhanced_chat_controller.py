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
    """Enhanced chat với tích hợp tìm kiếm file và phân loại"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        search_files = data.get('search_files', False)
        include_classification = data.get('include_classification', False)
        
        if not message:
            return jsonify({'error': 'Message không được để trống'}), 400
        
        user_id = request.user['user_id']
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