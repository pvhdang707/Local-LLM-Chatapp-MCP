from flask import Blueprint, request, jsonify, send_file
from src.auth import require_auth, require_admin
from src.file_manager import file_manager
from src.file_classifier import file_classifier
from src.cloud_integration import cloud_integration
import os
import json

file_bp = Blueprint('file', __name__)

# ==================== USER FILE MANAGEMENT ====================

@file_bp.route('/user/files', methods=['GET'])
@require_auth
def get_user_files():
    """
    Lấy danh sách files của user hiện tại (admin xem được toàn bộ)
    ---
    tags:
      - File
    responses:
      200:
        description: Danh sách file
        schema:
          type: object
          properties:
            files:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                  original_name:
                    type: string
                  file_type:
                    type: string
                  uploaded_by:
                    type: string
                  uploaded_at:
                    type: string
      401:
        description: Không xác thực
    """
    try:
        user_id = request.user['user_id']
        user_role = request.user.get('role', 'user')
        if user_role == 'admin':
            files = file_manager.get_all_files()
        else:
            files = file_manager.get_files_by_user(user_id)
        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/user/files', methods=['POST'])
@require_auth
def user_upload_file():
    """
    Upload file cho user hiện tại
    ---
    tags:
      - File
    consumes:
      - multipart/form-data
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
      - name: file
        in: formData
        type: file
        required: true
        description: File cần upload
    responses:
      201:
        description: Upload file thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Upload file thành công"
            file:
              type: object
              properties:
                id:
                  type: string
                  example: "file_123"
                original_name:
                  type: string
                  example: "document.pdf"
                file_type:
                  type: string
                  example: "pdf"
                file_size:
                  type: integer
                  example: 1024000
                uploaded_by:
                  type: string
                  example: "user1"
                uploaded_at:
                  type: string
                  format: date-time
                  example: "2024-01-01T00:00:00Z"
        examples:
          application/json: {
            "success": true,
            "message": "Upload file thành công",
            "file": {
              "id": "file_123",
              "original_name": "document.pdf",
              "file_type": "pdf",
              "file_size": 1024000,
              "uploaded_by": "user1",
              "uploaded_at": "2024-01-01T00:00:00Z"
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
            "error": "Không có file được chọn"
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
      413:
        description: File quá lớn
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "File quá lớn, vượt quá giới hạn cho phép"
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
    """
    Lấy danh sách files với thông tin chi tiết và phân loại
    ---
    tags:
      - File
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT)
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
    responses:
      200:
        description: Danh sách files với thông tin chi tiết
        schema:
          type: object
          properties:
            files:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                    example: "file_123"
                  original_name:
                    type: string
                    example: "document.pdf"
                  file_type:
                    type: string
                    example: "pdf"
                  file_size:
                    type: integer
                    example: 1024000
                  uploaded_by:
                    type: string
                    example: "user1"
                  uploaded_at:
                    type: string
                    format: date-time
                    example: "2024-01-01T00:00:00Z"
                  classification:
                    type: object
                    properties:
                      group_name:
                        type: string
                        example: "Tài liệu kinh doanh"
                      confidence:
                        type: number
                        example: 0.95
                      keywords:
                        type: array
                        items:
                          type: string
                        example: ["kinh doanh", "báo cáo", "kế hoạch"]
                  cloud_metadata:
                    type: object
                    properties:
                      synced:
                        type: boolean
                        example: true
                      last_sync:
                        type: string
                        format: date-time
                        example: "2024-01-01T00:00:00Z"
        examples:
          application/json: {
            "files": [
              {
                "id": "file_123",
                "original_name": "document.pdf",
                "file_type": "pdf",
                "file_size": 1024000,
                "uploaded_by": "user1",
                "uploaded_at": "2024-01-01T00:00:00Z",
                "classification": {
                  "group_name": "Tài liệu kinh doanh",
                  "confidence": 0.95,
                  "keywords": ["kinh doanh", "báo cáo", "kế hoạch"]
                },
                "cloud_metadata": {
                  "synced": true,
                  "last_sync": "2024-01-01T00:00:00Z"
                }
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
        files = file_manager.get_files_by_user(user_id)
        
        # Thêm thông tin phân loại cho từng file
        enhanced_files = []
        for file_info in files:
            file_id = file_info['id']
            
            # Lấy thông tin phân loại
            # classification = file_classifier.get_file_classification(file_id)
            classification = file_classifier.classify_file(file_id, file_info['original_name'])
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
    """
    Tải file của user (admin tải được mọi file)
    ---
    tags:
      - File
    parameters:
      - name: file_id
        in: path
        type: string
        required: true
        description: ID file
    responses:
      200:
        description: File được tải về
      403:
        description: Không có quyền tải file
      404:
        description: File không tồn tại
    """
    try:
        user_id = request.user['user_id']
        user_role = request.user.get('role', 'user')
        
        file_info = file_manager.get_file_by_id(file_id)
        if not file_info:
            return jsonify({'error': 'File không tồn tại'}), 404
        
        # Chỉ kiểm tra quyền nếu không phải admin
        if user_role != 'admin' and str(file_info['uploaded_by']) != str(user_id):
            return jsonify({'error': 'Không có quyền tải file này'}), 403
            
        file_path = file_manager.get_file_path(file_id)
        
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'File không tồn tại trên server'}), 404
            
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_bp.route('/user/files/<file_id>', methods=['DELETE'])
@require_auth
def delete_file(file_id):
    """
    Xóa file của user (admin xóa được mọi file)
    ---
    tags:
      - File
    parameters:
      - name: file_id
        in: path
        type: string
        required: true
        description: ID file
    responses:
      200:
        description: Xóa file thành công
      403:
        description: Không có quyền xóa file
      404:
        description: File không tồn tại
    """
    try:
        user_id = request.user['user_id']
        user_role = request.user.get('role', 'user')
        file_info = file_manager.get_file_by_id(file_id)
        if not file_info:
            return jsonify({'error': 'File không tồn tại'}), 404
        # Chỉ kiểm tra quyền nếu không phải admin
        if user_role != 'admin' and file_info['uploaded_by'] != user_id:
            return jsonify({'error': 'Không có quyền xóa file này'}), 403
        
        result = file_manager.delete_file(file_id)
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== FILE CLASSIFICATION ====================

@file_bp.route('/files/<file_id>/classify', methods=['POST'])
@require_auth
def classify_file(file_id):
    """
    Phân loại file bằng AI
    ---
    tags:
      - File
    parameters:
      - name: file_id
        in: path
        type: string
        required: true
        description: ID file
    responses:
      200:
        description: Kết quả phân loại
      403:
        description: Không có quyền truy cập file
      404:
        description: File không tồn tại
    """
    try:
        # Kiểm tra quyền truy cập file
        user_id = request.user['user_id']
        user_role = request.user.get('role', 'user')
        file_info = file_manager.get_file_by_id(file_id)
        
        if not file_info:
            return jsonify({'error': 'File không tồn tại'}), 404
            
        if user_role != 'admin' and file_info['uploaded_by'] != user_id:
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
                
            # Admin có thể truy cập tất cả files
            user_role = request.user.get('role', 'user')
            if user_role != 'admin' and file_info['uploaded_by'] != user_id:
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
    """
    Lấy metadata của file từ cloud (admin xem được mọi file)
    ---
    tags:
      - File
    parameters:
      - name: file_id
        in: path
        type: string
        required: true
        description: ID file
    responses:
      200:
        description: Metadata file
      403:
        description: Không có quyền truy cập file
      404:
        description: File không tồn tại
    """
    try:
        user_id = request.user['user_id']
        user_role = request.user.get('role', 'user')
        file_info = file_manager.get_file_by_id(file_id)
        if not file_info:
            return jsonify({'error': 'File không tồn tại'}), 404
        if user_role != 'admin' and file_info['uploaded_by'] != user_id:
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
                
            # Admin có thể truy cập tất cả files
            user_role = request.user.get('role', 'user')
            if user_role != 'admin' and file_info['uploaded_by'] != user_id:
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

@file_bp.route('/admin/upload_file', methods=['POST'])
@require_auth
@require_admin
def admin_upload_file():
    """
    Admin upload file với phân quyền
    ---
    tags:
      - File
    consumes:
      - multipart/form-data
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token (JWT) - Admin only
      - name: file
        in: formData
        type: file
        required: true
        description: File cần upload
      - name: permissions
        in: formData
        type: string
        required: false
        description: JSON string chứa danh sách user_id được phép truy cập
    responses:
      201:
        description: Upload file thành công
      400:
        description: Dữ liệu không hợp lệ
      401:
        description: Không xác thực
      403:
        description: Không phải admin
      500:
        description: Lỗi server
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Không có file được chọn'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Không có file được chọn'}), 400
        
        # Lấy danh sách user được phép truy cập
        permissions = request.form.get('permissions', '[]')
        try:
            allowed_users = json.loads(permissions)
        except json.JSONDecodeError:
            allowed_users = []
        
        # Upload file với thông tin phân quyền
        result = file_manager.add_file_with_permissions(
            file=file,
            uploaded_by=request.user['user_id'],
            allowed_users=allowed_users
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500 