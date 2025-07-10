import json
import os

FEEDBACK_FILE = "./src/data/feedback_store.json"

def load_feedback():
    if not os.path.exists(FEEDBACK_FILE):
        return {}
    with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_feedback(feedback_data):
    with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
        json.dump(feedback_data, f, indent=2, ensure_ascii=False)

def record_feedback(file_name, original_group, corrected_group, user_id=None):
    feedback = load_feedback()
    feedback[file_name] = {
        "original_group": original_group,
        "corrected_group": corrected_group,
        "user_id": user_id
    }
    save_feedback(feedback)
