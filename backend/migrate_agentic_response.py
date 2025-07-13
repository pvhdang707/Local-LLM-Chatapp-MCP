#!/usr/bin/env python3
"""
Migration script để thêm cột response vào bảng agentic_messages
"""

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))
from src.database import get_db, AgenticMessage

def migrate_message_type_to_assistant(ids):
    db = next(get_db())
    try:
        for msg_id in ids:
            msg = db.query(AgenticMessage).filter(AgenticMessage.id == msg_id).first()
            if msg:
                print(f"Updating message {msg_id} to assistant...")
                msg.message_type = 'assistant'
        db.commit()
        print("Migration completed!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    ids = [
        "11bad77e-c3cc-4380-9d29-e317c4d798b3",
        "e3729ca4-49d3-4bbb-8aee-6b9a80f18ad6",
        "bfb0453f-7a8d-489b-b1e9-4c2a92438b57",
        "1bb0e8e0-2326-42f9-990d-447830dc998f"
    ]
    migrate_message_type_to_assistant(ids) 