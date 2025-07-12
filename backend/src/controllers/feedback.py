from flask import Blueprint, request, jsonify
from src.feedback_store import record_feedback
from src.auth import require_auth

feedback_bp = Blueprint("feedback", __name__)

@feedback_bp.route("/feedback", methods=["POST"])
@require_auth
def give_feedback():
    """
    Gửi feedback về phân loại file
    ---
    tags:
      - Feedback
    security:
      - Bearer: []
    consumes:
      - application/json
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Bearer token JWT"
        example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ.example_signature"
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - file_name
            - original_group
            - corrected_group
          properties:
            file_name:
              type: string
              description: "Tên file được phân loại"
              example: "sample.txt"
            original_group:
              type: string
              description: "Nhóm phân loại ban đầu"
              example: "B"
            corrected_group:
              type: string
              description: "Nhóm phân loại đúng"
              example: "E"
    responses:
      200:
        description: Feedback được ghi nhận thành công
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Đã ghi nhận phản hồi"
        examples:
          application/json: {
            "message": "Đã ghi nhận phản hồi"
          }
      400:
        description: Thiếu thông tin phản hồi
        schema:
          type: object
          properties:
            error:
              type: string
        examples:
          application/json: {
            "error": "Thiếu thông tin phản hồi"
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
        file_name = data.get("file_name")
        original_group = data.get("original_group")
        corrected_group = data.get("corrected_group")
        user_id = request.user["user_id"]

        if not all([file_name, original_group, corrected_group]):
            return jsonify({"error": "Thiếu thông tin phản hồi"}), 400

        record_feedback(file_name, original_group, corrected_group, user_id)
        return jsonify({"message": "Đã ghi nhận phản hồi"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
