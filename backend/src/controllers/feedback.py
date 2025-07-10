from flask import Blueprint, request, jsonify
from src.feedback_store import record_feedback
from src.auth import require_auth

feedback_bp = Blueprint("feedback", __name__)

@feedback_bp.route("/feedback", methods=["POST"])
@require_auth
def give_feedback():
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
