from flask import Blueprint, request, jsonify, send_file
from src.auth import require_auth
from src.file_manager import file_manager
from src.file_classifier import file_classifier
from src.cloud_integration import cloud_integration
import os

file_bp = Blueprint('file', __name__)

# ==================== USER FILE MANAGEMENT ====================

@file_bp.route('/user/files', methods=['GET'])
@require_auth
def get_user_files():
    """Lấy danh sách files của user hiện tại"""
    try:
        user_id = request.user['user_id']
        files = file_manager.get_files_by_user(user_id)
        return jsonify({'files': files})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/user/files', methods=['POST'])
@require_auth
def user_upload_file():
    """Upload file cho user hiện tại"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Không có file được chọn'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Không có file được chọn'}), 400
            
        user_id = request.user['user_id']
        result = file_manager.add_file(file, user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/user/files/enhanced', methods=['GET'])
@require_auth
def get_user_files_enhanced():
    """Lấy danh sách files với thông tin chi tiết và phân loại"""
    try:
        user_id = request.user['user_id']
        files = file_manager.get_files_by_user(user_id)
        
        # Thêm thông tin phân loại cho từng file
        enhanced_files = []
        for file_info in files:
            file_id = file_info['id']
            
            # Lấy thông tin phân loại
            classification = file_classifier.get_file_classification(file_id)
            file_info['classification'] = classification
            
            # Lấy metadata từ cloud
            metadata = cloud_integration.get_file_metadata(file_id)
            file_info['cloud_metadata'] = metadata
            
            enhanced_files.append(file_info)
        
        return jsonify({'files': enhanced_files})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/user/files/download/<file_id>', methods=['GET'])
@require_auth
def download_file(file_id):
    """Cho phép user tải file của mình về"""
    try:
        user_id = request.user['user_id']
        file_info = file_manager.get_file_by_id(file_id)
        if not file_info:
            return jsonify({'error': 'File không tồn tại'}), 404
        if file_info['user_id'] != user_id:
            return jsonify({'error': 'Không có quyền tải file này'}), 403
        file_path = file_manager.get_file_path(file_id)
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'File không tồn tại trên server'}), 404
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== FILE CLASSIFICATION ====================

@file_bp.route('/files/<file_id>/classify', methods=['POST'])
@require_auth
def classify_file(file_id):
    """Phân loại file bằng AI"""
    try:
        # Kiểm tra quyền truy cập file
        user_id = request.user['user_id']
        file_info = file_manager.get_file_by_id(file_id)
        
        if not file_info:
            return jsonify({'error': 'File không tồn tại'}), 404
            
        if file_info['user_id'] != user_id:
            return jsonify({'error': 'Không có quyền truy cập file này'}), 403
        
        # Thực hiện phân loại
        result = file_classifier.classify_file(file_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/files/classify/batch', methods=['POST'])
@require_auth
def classify_files_batch():
    """Phân loại nhiều files cùng lúc"""
    try:
        data = request.json
        file_ids = data.get('file_ids', [])
        
        if not file_ids:
            return jsonify({'error': 'Danh sách file IDs không được để trống'}), 400
        
        user_id = request.user['user_id']
        results = []
        
        for file_id in file_ids:
            # Kiểm tra quyền truy cập
            file_info = file_manager.get_file_by_id(file_id)
            if not file_info:
                results.append({
                    'file_id': file_id,
                    'success': False,
                    'error': 'File không tồn tại'
                })
                continue
                
            if file_info['user_id'] != user_id:
                results.append({
                    'file_id': file_id,
                    'success': False,
                    'error': 'Không có quyền truy cập'
                })
                continue
            
            # Thực hiện phân loại
            result = file_classifier.classify_file(file_id)
            result['file_id'] = file_id
            results.append(result)
        
        return jsonify({'results': results})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/files/groups', methods=['GET'])
@require_auth
def get_file_groups():
    """Lấy danh sách nhóm files theo phân loại"""
    try:
        user_id = request.user['user_id']
        groups = file_classifier.get_file_groups_by_user(user_id)
        return jsonify({'groups': groups})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== FILE METADATA & CLOUD INTEGRATION ====================

@file_bp.route('/files/<file_id>/metadata', methods=['GET'])
@require_auth
def get_file_metadata(file_id):
    """Lấy metadata của file từ cloud"""
    try:
        user_id = request.user['user_id']
        file_info = file_manager.get_file_by_id(file_id)
        
        if not file_info:
            return jsonify({'error': 'File không tồn tại'}), 404
            
        if file_info['user_id'] != user_id:
            return jsonify({'error': 'Không có quyền truy cập file này'}), 403
        
        metadata = cloud_integration.get_file_metadata(file_id)
        return jsonify({'metadata': metadata})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/files/metadata/batch', methods=['POST'])
@require_auth
def send_metadata_batch():
    """Gửi metadata của nhiều files lên cloud"""
    try:
        data = request.json
        file_ids = data.get('file_ids', [])
        
        if not file_ids:
            return jsonify({'error': 'Danh sách file IDs không được để trống'}), 400
        
        user_id = request.user['user_id']
        results = []
        
        for file_id in file_ids:
            # Kiểm tra quyền truy cập
            file_info = file_manager.get_file_by_id(file_id)
            if not file_info:
                results.append({
                    'file_id': file_id,
                    'success': False,
                    'error': 'File không tồn tại'
                })
                continue
                
            if file_info['user_id'] != user_id:
                results.append({
                    'file_id': file_id,
                    'success': False,
                    'error': 'Không có quyền truy cập'
                })
                continue
            
            # Gửi metadata lên cloud
            result = cloud_integration.send_file_metadata(file_id)
            result['file_id'] = file_id
            results.append(result)
        
        return jsonify({'results': results})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 