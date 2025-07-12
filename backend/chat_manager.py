import uuid
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from database import get_db, ChatSession as DBChatSession, ChatMessage as DBChatMessage
from llm import workflow, RagDataContext, smart_answer_question, get_system_info, should_use_agentic_system
import vectordb

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
                    username: str = "anonymous", file_urls: List[str] = None,
                    use_agentic: bool = None, strategy: str = "adaptive") -> Dict:
        """Gửi message và nhận response với AI Agentic system"""
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
            
            # Sử dụng AI Smart System để generate response
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                ai_result = loop.run_until_complete(
                    smart_answer_question(
                        question=message,
                        file_urls=file_urls or [],
                        chat_context=context,
                        use_agentic=use_agentic,
                        strategy=strategy
                    )
                )
                
                response = ai_result.get("answer", "Xin lỗi, tôi không thể trả lời câu hỏi này.")
                method_used = ai_result.get("method", "unknown")
                confidence = ai_result.get("confidence", 0.0)
                
            except Exception as e:
                print(f"AI system error, falling back to traditional RAG: {e}")
                # Fallback về RAG system cũ
                rag_context = RagDataContext(
                    question=message,
                    generation="",
                    documents=[],
                    steps=[],
                    file_urls=file_urls or [],
                    file_documents=[],
                    chat_context=context
                )
                
                config = {"configurable": {"thread_id": str(uuid.uuid4())}}
                result = workflow.invoke(rag_context, config)
                response = result.get("generation", "Xin lỗi, tôi không thể trả lời câu hỏi này.")
                method_used = "traditional_rag_fallback"
                confidence = 0.7
            finally:
                loop.close()
            
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
                "ai_method": method_used,
                "confidence": confidence,
                "system_info": {
                    "agentic_recommended": should_use_agentic_system(message, file_urls),
                    "strategy_used": strategy,
                    "file_count": len(file_urls) if file_urls else 0
                }
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

    def get_ai_system_info(self) -> Dict:
        """Lấy thông tin về AI system"""
        return get_system_info()
    
    def send_message_with_strategy(self, session_id: str, message: str, 
                                 strategy: str = "adaptive", **kwargs) -> Dict:
        """Gửi message với strategy cụ thể"""
        return self.send_message(
            session_id=session_id,
            message=message,
            strategy=strategy,
            **kwargs
        )
    
    def analyze_message_complexity(self, message: str, file_urls: List[str] = None) -> Dict:
        """Phân tích độ phức tạp của message để đề xuất system"""
        is_complex = should_use_agentic_system(message, file_urls)
        
        complexity_indicators = {
            "has_analysis_keywords": any(keyword in message.lower() for keyword in 
                                       ["phân tích", "so sánh", "đánh giá", "analyze", "compare"]),
            "has_planning_keywords": any(keyword in message.lower() for keyword in 
                                       ["kế hoạch", "chiến lược", "plan", "strategy"]),
            "has_multiple_files": file_urls and len(file_urls) > 1,
            "is_long_question": len(message.split()) > 10,
            "has_reasoning_keywords": any(keyword in message.lower() for keyword in 
                                        ["tại sao", "như thế nào", "why", "how", "explain"])
        }
        
        return {
            "is_complex": is_complex,
            "recommended_system": "agentic" if is_complex else "rag",
            "complexity_indicators": complexity_indicators,
            "recommended_strategy": "adaptive" if is_complex else "sequential"
        }
        
# Khởi tạo ChatManager
chat_manager = ChatManager()