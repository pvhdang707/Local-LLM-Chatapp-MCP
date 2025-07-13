from flask import Blueprint, request, jsonify
from src.auth import auth_manager, require_auth, require_admin

auth_bp = Blueprint('auth', __name__)



@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """
    Đăng nhập
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: Tên đăng nhập
              example: "user1"
            password:
              type: string
              description: Mật khẩu
              example: "123123"
    responses:
      200:
        description: Đăng nhập thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            access_token:
              type: string
              description: JWT token để xác thực
              example: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
            user:
              type: object
              properties:
                id:
                  type: string
                  example: "123"
                username:
                  type: string
                  example: "user1"
                role:
                  type: string
                  example: "user"
        examples:
          application/json: {
            "success": true,
            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature",
            "user": {
              "id": "123",
              "username": "user1",
              "role": "user"
            }
          }
      400:
        description: Thiếu thông tin đăng nhập
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Username và password không được để trống"
          }
      401:
        description: Sai thông tin đăng nhập
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Sai username hoặc password"
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
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if not username or not password:
            return jsonify({'error': 'Username và password không được để trống'}), 400

        result = auth_manager.login_user(username, password)
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """
    Đăng ký user mới
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: "Tên đăng nhập - tối thiểu 3 ký tự"
              example: "newuser"
              minLength: 3
            password:
              type: string
              description: "Mật khẩu - tối thiểu 6 ký tự"
              example: "123456"
              minLength: 6
            department:
              type: string
              description: "Phòng ban - Sales, Tài chính, HR"
              example: "Sales"
              enum: ["Sales", "Tài chính", "HR"]
    responses:
      201:
        description: Đăng ký thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Đăng ký thành công"
            user:
              type: object
              properties:
                id:
                  type: string
                  example: "user_123"
                username:
                  type: string
                  example: "newuser"
                role:
                  type: string
                  example: "user"
                department:
                  type: string
                  example: "Sales"
        examples:
          application/json: {
            "success": true,
            "message": "Đăng ký thành công",
            "user": {
              "id": "user_123",
              "username": "newuser",
              "role": "user",
              "department": "Sales"
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
            "error": "Username đã tồn tại"
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
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        department = data.get('department')

        # Validate input
        if not username or len(username) < 3:
            return jsonify({'error': 'Username phải có ít nhất 3 ký tự'}), 400

        if not password or len(password) < 6:
            return jsonify({'error': 'Password phải có ít nhất 6 ký tự'}), 400

        # Validate department
        valid_departments = ["Sales", "Tài chính", "HR", None]
        if department not in valid_departments:
            return jsonify({'error': 'Department phải là "Sales", "Tài chính", "HR" hoặc để trống'}), 400

        result = auth_manager.register_user(username, password, department)
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/auth/profile', methods=['GET'])
@require_auth
def get_profile():
    """
    Lấy thông tin profile user
    ---
    tags:
      - Auth
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
    responses:
      200:
        description: Thông tin user
        schema:
          type: object
          properties:
            id:
              type: string
              example: "123"
            username:
              type: string
              example: "user1"
            role:
              type: string
              example: "user"
            created_at:
              type: string
              format: date-time
              example: "2024-01-01T00:00:00Z"
            is_active:
              type: boolean
              example: true
        examples:
          application/json: {
            "id": "123",
            "username": "user1",
            "role": "user",
            "created_at": "2024-01-01T00:00:00Z",
            "is_active": true
          }
      401:
        description: Không xác thực hoặc token không hợp lệ
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Token không hợp lệ"
          }
      404:
        description: User không tồn tại
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "User không tồn tại"
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
        user = auth_manager.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User không tồn tại'}), 404

        return jsonify({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'department': user.department,
            'created_at': user.created_at,
            'is_active': user.is_active
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/admin/register_user', methods=['POST'])
@require_auth
@require_admin
def admin_register_user():
    """
    Admin đăng ký user mới
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT - Admin only"
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTczNTY4OTYwMH0.example_signature"
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: "Tên đăng nhập - tối thiểu 3 ký tự"
              example: "newuser"
              minLength: 3
            password:
              type: string
              description: "Mật khẩu - tối thiểu 6 ký tự"
              example: "123456"
              minLength: 6
            role:
              type: string
              description: "Vai trò của user - user hoặc admin"
              example: "user"
              enum: ["user", "admin"]
            department:
              type: string
              description: "Phòng ban - Sales, Tài chính, HR"
              example: "Sales"
              enum: ["Sales", "Tài chính", "HR"]
    responses:
      201:
        description: Tạo user thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Tạo user thành công"
            user:
              type: object
              properties:
                id:
                  type: string
                  example: "124"
                username:
                  type: string
                  example: "newuser"
                role:
                  type: string
                  example: "user"
                department:
                  type: string
                  example: "Sales"
        examples:
          application/json: {
            "success": true,
            "message": "Tạo user thành công",
            "user": {
              "id": "124",
              "username": "newuser",
              "role": "user",
              "department": "Sales"
            }
          }
      400:
        description: Thiếu thông tin hoặc username đã tồn tại
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: false
            message:
              type: string
        examples:
          application/json: {
            "success": false,
            "message": "Thiếu username hoặc password"
          }
          application/json: {
            "success": false,
            "message": "Username đã tồn tại"
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
      403:
        description: Không phải admin
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Chỉ admin mới được phép thực hiện thao tác này"
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
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user')
    department = data.get('department')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Thiếu username hoặc password'}), 400
    
    # Validate department
    valid_departments = ["Sales", "Tài chính", "HR", None]
    if department not in valid_departments:
        return jsonify({'success': False, 'message': 'Department phải là "Sales", "Tài chính", "HR" hoặc để trống'}), 400
    
    # Sử dụng logic tương tự như register_user trong auth_manager
    from src.database import get_db, User as DBUser
    import uuid
    from datetime import datetime
    
    db = next(get_db())
    try:
        if db.query(DBUser).filter(DBUser.username == username).first():
            return jsonify({'success': False, 'message': 'Username đã tồn tại'}), 400
        
        # Hash password
        hashed_password = auth_manager.hash_password(password)
        
        # Tạo user mới với role và department được chỉ định
        new_user = DBUser(
            id=str(uuid.uuid4()),
            username=username,
            password=hashed_password,
            role=role,
            department=department,
            created_at=datetime.utcnow(),
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return jsonify({
            'success': True,
            'message': 'Tạo user thành công',
            'user': {
                'id': str(new_user.id),
                'username': new_user.username,
                'role': new_user.role,
                'department': new_user.department
            }
        }), 201
        
    except Exception as e:
        db.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        db.close()

@auth_bp.route('/admin/users', methods=['GET'])
@require_auth
@require_admin
def get_all_users():
    """
    Lấy danh sách tất cả users (Admin only)
    ---
    tags:
      - Auth
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT - Admin only"
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTczNTY4OTYwMH0.example_signature"
      - name: page
        in: query
        type: integer
        required: false
        description: Số trang (mặc định là 1)
        example: 1
      - name: per_page
        in: query
        type: integer
        required: false
        description: "Số user mỗi trang - mặc định 10"
        example: 10
    responses:
      200:
        description: Danh sách users
        schema:
          type: object
          properties:
            users:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                    example: "123"
                  username:
                    type: string
                    example: "user1"
                  role:
                    type: string
                    example: "user"
                  created_at:
                    type: string
                    format: date-time
                    example: "2024-01-01T00:00:00Z"
                  is_active:
                    type: boolean
                    example: true
            total:
              type: integer
              example: 25
            page:
              type: integer
              example: 1
            per_page:
              type: integer
              example: 10
        examples:
          application/json: {
            "users": [
              {
                "id": "123",
                "username": "user1",
                "role": "user",
                "created_at": "2024-01-01T00:00:00Z",
                "is_active": true
              },
              {
                "id": "124",
                "username": "admin",
                "role": "admin",
                "created_at": "2024-01-01T00:00:00Z",
                "is_active": true
              }
            ],
            "total": 25,
            "page": 1,
            "per_page": 10
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
      403:
        description: Không phải admin
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Chỉ admin mới được phép thực hiện thao tác này"
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
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        from src.database import get_db, User as DBUser
        db = next(get_db())
        
        # Lấy tổng số users
        total = db.query(DBUser).count()
        
        # Lấy users theo trang
        users = db.query(DBUser).offset((page - 1) * per_page).limit(per_page).all()
        
        users_data = []
        for user in users:
            users_data.append({
                'id': str(user.id),
                'username': user.username,
                'role': user.role,
                'department': user.department,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'is_active': user.is_active
            })
        
        return jsonify({
            'users': users_data,
            'total': total,
            'page': page,
            'per_page': per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@auth_bp.route('/admin/users/<user_id>', methods=['PUT'])
@require_auth
@require_admin
def update_user(user_id):
    """
    Cập nhật thông tin user (Admin only)
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT - Admin only"
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTczNTY4OTYwMH0.example_signature"
      - name: user_id
        in: path
        type: string
        required: true
        description: ID của user cần cập nhật
        example: "123"
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            username:
              type: string
              description: Tên đăng nhập mới
              example: "newusername"
            role:
              type: string
              description: Vai trò mới (user/admin)
              example: "admin"
              enum: ["user", "admin"]
            is_active:
              type: boolean
              description: Trạng thái hoạt động
              example: true
    responses:
      200:
        description: Cập nhật thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Cập nhật user thành công"
            user:
              type: object
              properties:
                id:
                  type: string
                  example: "123"
                username:
                  type: string
                  example: "newusername"
                role:
                  type: string
                  example: "admin"
                is_active:
                  type: boolean
                  example: true
        examples:
          application/json: {
            "success": true,
            "message": "Cập nhật user thành công",
            "user": {
              "id": "123",
              "username": "newusername",
              "role": "admin",
              "is_active": true
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
            "error": "Username đã tồn tại"
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
      403:
        description: Không phải admin
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Chỉ admin mới được phép thực hiện thao tác này"
          }
      404:
        description: User không tồn tại
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "User không tồn tại"
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
        
        from src.database import get_db, User as DBUser
        db = next(get_db())
        
        user = db.query(DBUser).filter(DBUser.id == user_id).first()
        if not user:
            return jsonify({'error': 'User không tồn tại'}), 404
        
        # Cập nhật thông tin
        if 'username' in data:
            # Kiểm tra username mới có trùng không
            existing_user = db.query(DBUser).filter(DBUser.username == data['username'], DBUser.id != user_id).first()
            if existing_user:
                return jsonify({'error': 'Username đã tồn tại'}), 400
            user.username = data['username']
        
        if 'role' in data:
            user.role = data['role']
        
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        db.commit()
        db.refresh(user)
        
        return jsonify({
            'success': True,
            'message': 'Cập nhật user thành công',
            'user': {
                'id': str(user.id),
                'username': user.username,
                'role': user.role,
                'is_active': user.is_active
            }
        })
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@auth_bp.route('/admin/users/<user_id>', methods=['DELETE'])
@require_auth
@require_admin
def delete_user(user_id):
    """
    Xóa user (Admin only)
    ---
    tags:
      - Auth
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT - Admin only"
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTczNTY4OTYwMH0.example_signature"
      - name: user_id
        in: path
        type: string
        required: true
        description: ID của user cần xóa
        example: "123"
    responses:
      200:
        description: Xóa user thành công
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Xóa user thành công"
        examples:
          application/json: {
            "success": true,
            "message": "Xóa user thành công"
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
      403:
        description: Không phải admin
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Chỉ admin mới được phép thực hiện thao tác này"
          }
      404:
        description: User không tồn tại
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "User không tồn tại"
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
        from src.database import get_db, User as DBUser
        db = next(get_db())
        
        user = db.query(DBUser).filter(DBUser.id == user_id).first()
        if not user:
            return jsonify({'error': 'User không tồn tại'}), 404
        
        # Không cho phép xóa chính mình
        if str(user.id) == request.user['user_id']:
            return jsonify({'error': 'Không thể xóa chính mình'}), 400
        
        db.delete(user)
        db.commit()
        
        return jsonify({
            'success': True,
            'message': 'Xóa user thành công'
        })
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close() 