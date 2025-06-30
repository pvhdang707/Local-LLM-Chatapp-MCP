import uuid
from typing import Dict, List, Optional
from datetime import datetime
from src.database import get_db, ChatSession as DBChatSession, ChatMessage as DBChatMessage
from src.llm import workflow, RagDataContext
import src.vectordb as vectordb
import logging

class ChatManager:
    def __init__(self):
        self.vectorstore = vectordb.init_vector_store()

    def create_chat_session(self, user_id: str = None, username: str = "anonymous", title: str = "New Chat") -> Dict:
        """Tạo chat session mới"""
        db = next(get_db())
        try:
            session = DBChatSession(
                id=str(uuid.uuid4()),
                user_id=user_id,
                username=username,
                title=title,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                is_active=True
            )
            
            db.add(session)
            db.commit()
            db.refresh(session)
            
            return {
                "success": True,
                "message": "Tạo chat session thành công",
                "session": {
                    "id": session.id,
                    "title": session.title,
                    "created_at": session.created_at.isoformat(),
                    "message_count": 0
                }
            }
            
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Lỗi khi tạo chat session: {str(e)}"}
        finally:
            db.close()

    def get_chat_sessions(self, user_id: str = None, username: str = None) -> List[Dict]:
        """Lấy danh sách chat sessions của user"""
        db = next(get_db())
        try:
            query = db.query(DBChatSession).filter(DBChatSession.is_active == True)
            
            if user_id:
                query = query.filter(DBChatSession.user_id == user_id)
            elif username:
                query = query.filter(DBChatSession.username == username)
            
            sessions = query.order_by(DBChatSession.updated_at.desc()).all()
            
            result = []
            for session in sessions:
                # Đếm số message trong session
                message_count = db.query(DBChatMessage).filter(
                    DBChatMessage.session_id == session.id
                ).count()
                
                result.append({
                    "id": session.id,
                    "title": session.title,
                    "created_at": session.created_at.isoformat(),
                    "updated_at": session.updated_at.isoformat(),
                    "message_count": message_count
                })
            
            return result
            
        except Exception as e:
            print(f"Error getting chat sessions: {e}")
            return []
        finally:
            db.close()

    def get_chat_messages(self, session_id: str, limit: int = 50) -> List[Dict]:
        """Lấy danh sách messages trong một session"""
        db = next(get_db())
        try:
            messages = db.query(DBChatMessage).filter(
                DBChatMessage.session_id == session_id
            ).order_by(DBChatMessage.created_at.asc()).limit(limit).all()
            
            return [
                {
                    "id": msg.id,
                    "message": msg.message,
                    "response": msg.response,
                    "created_at": msg.created_at.isoformat(),
                    "message_type": msg.message_type
                }
                for msg in messages
            ]
            
        except Exception as e:
            print(f"Error getting chat messages: {e}")
            return []
        finally:
            db.close()

    def send_message(self, session_id: str, message: str, user_id: str = None, 
                    username: str = "anonymous", file_urls: List[str] = None) -> Dict:
        """Gửi message và nhận response với context memory"""
        db = next(get_db())
        try:
            # Lấy context từ các messages trước đó
            context_messages = self.get_chat_messages(session_id, limit=10)
            
            # Tạo context string từ lịch sử chat
            context = ""
            if context_messages:
                context = "\n".join([
                    f"User: {msg['message']}\nAssistant: {msg['response']}"
                    for msg in context_messages[-5:]  # Lấy 5 messages gần nhất
                ])
            
            # Tạo RagDataContext với context
            rag_context = RagDataContext(
                question=message,
                generation="",
                documents=[],
                steps=[],
                file_urls=file_urls or [],
                file_documents=[],
                chat_context=context  # Thêm context vào
            )
            
            # Chạy workflow để generate response
            config = {"configurable": {"thread_id": str(uuid.uuid4())}}
            result = workflow.invoke(rag_context, config)
            
            response = result.get("generation", "Xin lỗi, tôi không thể trả lời câu hỏi này.")
            
            # Lấy metadata của documents được sử dụng
            documents = result.get("documents", [])
            file_documents = result.get("file_documents", [])
            
            # Lọc file_sources chỉ lấy file thực sự liên quan đến prompt
            keyword = message.lower()
            file_sources = []
            for doc in documents + file_documents:
                logging.info(f"[DEBUG] doc.metadata: {getattr(doc, 'metadata', None)}")
                logging.info(f"[DEBUG] doc.page_content: {getattr(doc, 'page_content', None)}")
                if hasattr(doc, 'metadata') and doc.metadata:
                    file_name = doc.metadata.get('file_name', '')
                    file_id = doc.metadata.get('file_id', '')
                    content = getattr(doc, 'page_content', '').lower()
                    # Chỉ thêm file nếu có đủ file_name, file_id và nội dung/tên file chứa từ khóa
                    if file_name and file_id and ((keyword in file_name.lower()) or (content and keyword in content)):
                        file_sources.append({
                            'filename': file_name,
                            'download_url': f"/api/user/files/download/{file_id}"
                        })
            
            # Lưu message và response vào database
            chat_message = DBChatMessage(
                id=str(uuid.uuid4()),
                session_id=session_id,
                user_id=user_id,
                username=username,
                message=message,
                response=response,
                created_at=datetime.utcnow(),
                message_type="user"
            )
            
            db.add(chat_message)
            
            # Cập nhật updated_at của session
            session = db.query(DBChatSession).filter(DBChatSession.id == session_id).first()
            if session:
                session.updated_at = datetime.utcnow()
            
            db.commit()
            
            return {
                "success": True,
                "message": "Gửi message thành công",
                "response": response,
                "message_id": chat_message.id,
                "context_used": len(context_messages),
                "documents_used": len(documents + file_documents),
                "file_sources": file_sources  # Danh sách file sources kèm download_url
            }
            
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Lỗi khi gửi message: {str(e)}"}
        finally:
            db.close()

    def delete_chat_session(self, session_id: str, user_id: str = None) -> Dict:
        """Xóa chat session"""
        db = next(get_db())
        try:
            # Kiểm tra quyền xóa
            session = db.query(DBChatSession).filter(
                DBChatSession.id == session_id,
                DBChatSession.is_active == True
            ).first()
            
            if not session:
                return {"success": False, "message": "Chat session không tồn tại"}
            
            if user_id and session.user_id != user_id:
                return {"success": False, "message": "Không có quyền xóa chat session này"}
            
            # Xóa tất cả messages trong session
            db.query(DBChatMessage).filter(DBChatMessage.session_id == session_id).delete()
            
            # Xóa session
            session.is_active = False
            db.commit()
            
            return {"success": True, "message": "Xóa chat session thành công"}
            
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Lỗi khi xóa chat session: {str(e)}"}
        finally:
            db.close()

    def update_session_title(self, session_id: str, title: str, user_id: str = None) -> Dict:
        """Cập nhật tiêu đề chat session"""
        db = next(get_db())
        try:
            session = db.query(DBChatSession).filter(
                DBChatSession.id == session_id,
                DBChatSession.is_active == True
            ).first()
            
            if not session:
                return {"success": False, "message": "Chat session không tồn tại"}
            
            if user_id and session.user_id != user_id:
                return {"success": False, "message": "Không có quyền cập nhật chat session này"}
            
            session.title = title
            session.updated_at = datetime.utcnow()
            db.commit()
            
            return {"success": True, "message": "Cập nhật tiêu đề thành công"}
            
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Lỗi khi cập nhật tiêu đề: {str(e)}"}
        finally:
            db.close()

# Khởi tạo ChatManager
chat_manager = ChatManager() 