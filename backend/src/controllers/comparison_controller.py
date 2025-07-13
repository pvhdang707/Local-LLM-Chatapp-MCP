"""
API Controller cho chức năng so sánh file
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from src.auth import require_auth
from src.file_comparator import file_comparator
from src.file_manager import file_manager

comparison_bp = Blueprint('comparison', __name__)

@comparison_bp.route('/files/compare', methods=['POST'])
@require_auth
def compare_files():
    """
    So sánh nhiều file với nhau
    """
    try:
        data = request.json
        file_ids = data.get('file_ids', [])
        comparison_type = data.get('comparison_type', 'ai_summary')
        language = data.get('language', 'vi')  # Mặc định tiếng Việt
        
        if not file_ids or len(file_ids) < 2:
            return jsonify({'error': 'Cần ít nhất 2 file để so sánh'}), 400
        
        # Kiểm tra quyền truy cập file
        user_id = request.user['user_id']
        user_role = request.user['role']
        user_department = request.user.get('department')
        
        accessible_files = []
        file_details = []
        
        for file_id in file_ids:
            file_info = file_manager.get_file_by_id(file_id)
            if file_info:
                # Kiểm tra quyền truy cập với logic rõ ràng hơn
                has_access = False
                
                if user_role == 'admin':
                    has_access = True
                elif file_info['uploaded_by'] == user_id:
                    has_access = True
                elif file_info.get('department') == user_department and user_department:
                    has_access = True
                elif file_info.get('is_public', False):
                    has_access = True
                
                if has_access:
                    accessible_files.append(file_id)
                    file_details.append({
                        'id': file_id,
                        'name': file_info['original_name'],
                        'type': file_info['file_type'],
                        'size': file_info['file_size']
                    })
        
        if len(accessible_files) < 2:
            return jsonify({
                'success': False,
                'error': 'Không đủ quyền truy cập file để so sánh',
                'accessible_files': len(accessible_files),
                'required_files': 2
            }), 403
        
        # Cấu hình so sánh với ngôn ngữ
        comparison_config = {
            'language': language,
            'format': 'detailed',
            'include_summary': True,
            'include_differences': True,
            'user_context': {
                'department': user_department,
                'role': user_role
            }
        }
        
        # Thực hiện so sánh với cấu hình
        result = file_comparator.compare_files(
            accessible_files, 
            comparison_type, 
            config=comparison_config
        )
        
        # Đảm bảo phản hồi có cấu trúc nhất quán
        response = {
            'success': True,
            'comparison_type': comparison_type,
            'language': language,
            'files_compared': len(accessible_files),
            'files_info': file_details,
            'comparison_result': result,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Dữ liệu không hợp lệ: {str(e)}',
            'error_type': 'validation_error'
        }), 400
    except PermissionError as e:
        return jsonify({
            'success': False,
            'error': f'Không có quyền truy cập: {str(e)}',
            'error_type': 'permission_error'
        }), 403
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Lỗi hệ thống: {str(e)}',
            'error_type': 'system_error'
        }), 500

@comparison_bp.route('/files/compare/search', methods=['POST'])
@require_auth
def compare_search():
    """
    Tìm kiếm file để so sánh dựa trên query
    """
    try:
        data = request.json
        query = data.get('query', '').strip()
        comparison_type = data.get('comparison_type', 'ai_summary')
        language = data.get('language', 'vi')
        max_files = min(data.get('max_files', 3), 5)  # Giới hạn tối đa 5 file
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query không được để trống',
                'error_type': 'validation_error'
            }), 400
        
        user_id = request.user['user_id']
        user_role = request.user['role']
        user_department = request.user.get('department')
        
        # Tìm file phù hợp với context cải thiện
        search_context = {
            'user_id': user_id,
            'user_role': user_role,
            'user_department': user_department,
            'language': language,
            'query_intent': _analyze_query_intent(query)
        }
        
        files_to_compare = file_comparator.find_files_for_comparison(
            query, 
            search_context,
            max_results=max_files
        )
        
        if len(files_to_compare) < 2:
            return jsonify({
                'success': False,
                'error': 'Không tìm đủ file phù hợp để so sánh',
                'files_found': len(files_to_compare),
                'suggestion': 'Thử sử dụng từ khóa khác hoặc mở rộng phạm vi tìm kiếm',
                'query_analyzed': _analyze_query_intent(query)
            })
        
        # Lấy ID của các file
        file_ids = [f['id'] for f in files_to_compare[:max_files]]
        
        # Cấu hình so sánh
        comparison_config = {
            'language': language,
            'format': 'detailed',
            'include_summary': True,
            'include_differences': True,
            'search_query': query,
            'user_context': search_context
        }
        
        # Thực hiện so sánh
        comparison_result = file_comparator.compare_files(
            file_ids, 
            comparison_type,
            config=comparison_config
        )
        
        # Chuẩn bị thông tin file với điểm phù hợp
        files_info = []
        for f in files_to_compare[:max_files]:
            file_info = file_manager.get_file_by_id(f['id'])
            if file_info:
                files_info.append({
                    'id': f['id'],
                    'name': file_info['original_name'],
                    'type': file_info['file_type'],
                    'size': file_info['file_size'],
                    'uploaded_at': file_info['uploaded_at'],
                    'match_score': f.get('match_score', 0),
                    'relevance_reason': f.get('relevance_reason', 'Phù hợp với query')
                })
        
        response = {
            'success': True,
            'query': query,
            'language': language,
            'query_intent': _analyze_query_intent(query),
            'files_found': len(files_to_compare),
            'files_compared': len(file_ids),
            'files_info': files_info,
            'comparison_result': comparison_result,
            'search_context': {
                'department': user_department,
                'role': user_role
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Lỗi trong quá trình tìm kiếm và so sánh: {str(e)}',
            'error_type': 'search_error'
        }), 500

@comparison_bp.route('/files/compare/types', methods=['GET'])
@require_auth
def get_comparison_types():
    """
    Lấy danh sách các loại so sánh có sẵn
    """
    language = request.args.get('language', 'vi')
    
    if language == 'vi':
        comparison_types = [
            {
                'type': 'content',
                'name': 'So sánh nội dung',
                'description': 'So sánh chi tiết nội dung văn bản, tìm điểm khác biệt và tương đồng',
                'best_for': 'Tài liệu văn bản, báo cáo, kế hoạch',
                'output_format': 'Bảng so sánh với highlight khác biệt'
            },
            {
                'type': 'metadata',
                'name': 'So sánh thông tin file', 
                'description': 'So sánh metadata như kích thước, loại file, ngày tạo, người tạo',
                'best_for': 'Kiểm tra phiên bản, quản lý file',
                'output_format': 'Bảng thông tin cơ bản'
            },
            {
                'type': 'ai_summary',
                'name': 'Phân tích bằng AI',
                'description': 'Sử dụng AI để phân tích sâu, tóm tắt khác biệt và đưa ra nhận xét',
                'best_for': 'Tài liệu phức tạp, cần phân tích chuyên sâu',
                'output_format': 'Báo cáo phân tích với insights và recommendations'
            }
        ]
    else:
        comparison_types = [
            {
                'type': 'content',
                'name': 'Content Comparison',
                'description': 'Compare detailed text content, find differences and similarities',
                'best_for': 'Documents, reports, plans',
                'output_format': 'Comparison table with highlighted differences'
            },
            {
                'type': 'metadata',
                'name': 'Metadata Comparison', 
                'description': 'Compare file metadata like size, type, creation date, creator',
                'best_for': 'Version control, file management',
                'output_format': 'Basic information table'
            },
            {
                'type': 'ai_summary',
                'name': 'AI Analysis',
                'description': 'Use AI for deep analysis, summarize differences and provide insights',
                'best_for': 'Complex documents requiring deep analysis',
                'output_format': 'Analysis report with insights and recommendations'
            }
        ]
    
    return jsonify({
        'comparison_types': comparison_types,
        'language': language,
        'default_type': 'ai_summary',
        'supported_languages': ['vi', 'en']
    })

def _analyze_query_intent(query):
    """
    Phân tích ý định của query để cải thiện kết quả tìm kiếm
    """
    query_lower = query.lower()
    intent = {
        'type': 'general',
        'keywords': [],
        'time_period': None,
        'department': None,
        'document_type': None
    }
    
    # Phát hiện loại tài liệu
    if any(word in query_lower for word in ['budget', 'ngân sách', 'chi phí']):
        intent['document_type'] = 'budget'
        intent['keywords'].append('budget')
    
    if any(word in query_lower for word in ['strategy', 'chiến lược', 'kế hoạch']):
        intent['document_type'] = 'strategy'
        intent['keywords'].append('strategy')
    
    # Phát hiện thời gian
    import re
    year_matches = re.findall(r'\b(20\d{2})\b', query)
    if year_matches:
        intent['time_period'] = year_matches
        intent['keywords'].extend(year_matches)
    
    # Phát hiện từ khóa so sánh
    if any(word in query_lower for word in ['so sánh', 'compare', 'khác biệt', 'difference']):
        intent['type'] = 'comparison'
    
    return intent
