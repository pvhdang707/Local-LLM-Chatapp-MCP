import uuid
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session
from src.database import AgenticSession, AgenticMessage, get_db
from src.agentic_ai import agentic_ai

class AgenticSessionManager:
    def __init__(self):
        self.agentic_ai = agentic_ai
    
    def create_session(self, user_id: str, username: str, title: str = None, description: str = None) -> Dict:
        """Tạo session mới cho Agentic AI"""
        try:
            db = next(get_db())
            
            session_id = str(uuid.uuid4())
            session = AgenticSession(
                id=session_id,
                user_id=user_id,
                username=username,
                title=title or "Agentic AI Session",
                description=description,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                last_activity=datetime.utcnow()
            )
            
            db.add(session)
            db.commit()
            db.refresh(session)
            
            return {
                'success': True,
                'session': {
                    'id': session.id,
                    'user_id': session.user_id,
                    'username': session.username,
                    'title': session.title,
                    'description': session.description,
                    'created_at': session.created_at.isoformat(),
                    'updated_at': session.updated_at.isoformat(),
                    'total_messages': session.total_messages,
                    'last_activity': session.last_activity.isoformat()
                }
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            db.close()
    
    def get_user_sessions(self, user_id: str, limit: int = 20) -> Dict:
        """Lấy danh sách sessions của user"""
        try:
            db = next(get_db())
            
            sessions = db.query(AgenticSession).filter(
                AgenticSession.user_id == user_id,
                AgenticSession.is_active == True
            ).order_by(AgenticSession.last_activity.desc()).limit(limit).all()
            
            session_list = []
            for session in sessions:
                session_list.append({
                    'id': session.id,
                    'title': session.title,
                    'description': session.description,
                    'created_at': session.created_at.isoformat(),
                    'updated_at': session.updated_at.isoformat(),
                    'total_messages': session.total_messages,
                    'last_activity': session.last_activity.isoformat()
                })
            
            return {
                'success': True,
                'sessions': session_list
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            db.close()
    
    def get_session_messages(self, session_id: str, user_id: str, limit: int = 50) -> Dict:
        """Lấy tin nhắn của session"""
        try:
            db = next(get_db())
            
            # Kiểm tra session có thuộc về user không
            session = db.query(AgenticSession).filter(
                AgenticSession.id == session_id,
                AgenticSession.user_id == user_id,
                AgenticSession.is_active == True
            ).first()
            
            if not session:
                return {'success': False, 'error': 'Session không tồn tại hoặc không có quyền truy cập'}
            
            messages = db.query(AgenticMessage).filter(
                AgenticMessage.session_id == session_id
            ).order_by(AgenticMessage.created_at.asc()).limit(limit).all()
            
            message_list = []
            for msg in messages:
                message_data = {
                    'id': msg.id,
                    'user_request': msg.user_request,
                    'response': msg.response,
                    'message_type': msg.message_type,
                    'status': msg.status,
                    'created_at': msg.created_at.isoformat(),
                    'completed_at': msg.completed_at.isoformat() if msg.completed_at else None,
                    'error_message': msg.error_message
                }
                
                # Parse JSON data
                if msg.plan:
                    try:
                        message_data['plan'] = json.loads(msg.plan)
                    except:
                        message_data['plan'] = None
                
                if msg.execution_results:
                    try:
                        message_data['execution_results'] = json.loads(msg.execution_results)
                    except:
                        message_data['execution_results'] = None
                
                if msg.summary:
                    try:
                        message_data['summary'] = json.loads(msg.summary)
                    except:
                        message_data['summary'] = None
                
                message_list.append(message_data)
            
            return {
                'success': True,
                'session': {
                    'id': session.id,
                    'title': session.title,
                    'description': session.description,
                    'total_messages': session.total_messages
                },
                'messages': message_list
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            db.close()
    
    def add_message_to_session(self, session_id: str, user_id: str, username: str, 
                              user_request: str, response: str = None, plan: Dict = None, 
                              execution_results: Dict = None, summary: Dict = None,
                              message_type: str = "user", status: str = "completed") -> Dict:
        """Thêm tin nhắn vào session"""
        try:
            db = next(get_db())
            
            # Kiểm tra session
            session = db.query(AgenticSession).filter(
                AgenticSession.id == session_id,
                AgenticSession.user_id == user_id,
                AgenticSession.is_active == True
            ).first()
            
            if not session:
                return {'success': False, 'error': 'Session không tồn tại hoặc không có quyền truy cập'}
            
            # Tạo message mới
            message_id = str(uuid.uuid4())
            message = AgenticMessage(
                id=message_id,
                session_id=session_id,
                user_id=user_id,
                username=username,
                user_request=user_request,
                response=response,
                plan=json.dumps(plan) if plan else None,
                execution_results=json.dumps(execution_results) if execution_results else None,
                summary=json.dumps(summary) if summary else None,
                message_type=message_type,
                status=status,
                created_at=datetime.utcnow(),
                completed_at=datetime.utcnow() if status == "completed" else None
            )
            
            db.add(message)
            
            # Cập nhật session
            session.total_messages += 1
            session.last_activity = datetime.utcnow()
            session.updated_at = datetime.utcnow()
            
            db.commit()
            
            return {
                'success': True,
                'message_id': message_id
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            db.close()
    
    def update_message_status(self, message_id: str, status: str, 
                            execution_results: Dict = None, summary: Dict = None,
                            error_message: str = None) -> Dict:
        """Cập nhật trạng thái message"""
        try:
            db = next(get_db())
            
            message = db.query(AgenticMessage).filter(AgenticMessage.id == message_id).first()
            
            if not message:
                return {'success': False, 'error': 'Message không tồn tại'}
            
            message.status = status
            if status == "completed":
                message.completed_at = datetime.utcnow()
            
            if execution_results:
                message.execution_results = json.dumps(execution_results)
            
            if summary:
                message.summary = json.dumps(summary)
            
            if error_message:
                message.error_message = error_message
            
            db.commit()
            
            return {'success': True}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            db.close()
    
    def delete_session(self, session_id: str, user_id: str) -> Dict:
        """Xóa session"""
        try:
            db = next(get_db())
            
            session = db.query(AgenticSession).filter(
                AgenticSession.id == session_id,
                AgenticSession.user_id == user_id
            ).first()
            
            if not session:
                return {'success': False, 'error': 'Session không tồn tại hoặc không có quyền truy cập'}
            
            session.is_active = False
            db.commit()
            
            return {'success': True}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            db.close()
    
    def process_with_session(self, session_id: str, user_id: str, username: str, 
                           user_request: str, user_role: str) -> Dict:
        """Xử lý yêu cầu với session context"""
        try:
            # Bước 1: Lên kế hoạch
            plan_result = self.agentic_ai.plan_actions(user_request)
            
            if not plan_result['success']:
                # Lưu message với lỗi (user gửi)
                self.add_message_to_session(
                    session_id=session_id,
                    user_id=user_id,
                    username=username,
                    user_request=user_request,
                    message_type="user",
                    status="failed"
                )
                # Lưu message lỗi cho assistant
                self.add_message_to_session(
                    session_id=session_id,
                    user_id=user_id,
                    username=username,
                    user_request="",  # Để trống thay vì None
                    response=plan_result.get('error', 'Lỗi không xác định'),
                    message_type="assistant",
                    status="failed"
                )
                return plan_result
            
            # Bước 2: Thực hiện kế hoạch
            execution_result = self.agentic_ai.execute_plan(
                plan_result['plan'], 
                user_id, 
                user_role
            )
            
            # Bước 3: Tạo response text từ kết quả
            response_text = self._create_response_text(execution_result, plan_result['plan'])
            
            # Bước 4: Lưu message của user
            self.add_message_to_session(
                session_id=session_id,
                user_id=user_id,
                username=username,
                user_request=user_request,
                message_type="user",
                status="completed"
            )
            # Bước 5: Lưu message của assistant (bot)
            message_result = self.add_message_to_session(
                session_id=session_id,
                user_id=user_id,
                username=username,
                user_request="",  # Để trống thay vì None
                response=response_text,
                plan=plan_result['plan'],
                execution_results=execution_result,
                summary=execution_result.get('summary'),
                message_type="assistant",
                status="completed" if execution_result['success'] else "failed"
            )
            
            if not message_result['success']:
                return message_result
            
            # Bước 6: Trả về kết quả
            return {
                'success': True,
                'session_id': session_id,
                'message_id': message_result['message_id'],
                'user_request': user_request,
                'response': response_text,
                'plan': plan_result['plan'],
                'execution_results': execution_result,
                'summary': execution_result.get('summary')
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _create_response_text(self, execution_result: Dict, plan: Dict) -> str:
        """Tạo response text từ kết quả execution"""
        try:
            if not execution_result.get('success'):
                return f"❌ Không thể thực hiện yêu cầu: {execution_result.get('error', 'Lỗi không xác định')}"
            
            # Lấy thông tin từ execution
            summary = execution_result.get('summary', {})
            chain_of_thought = execution_result.get('chain_of_thought', '')
            execution_results = execution_result.get('execution_results', [])
            
            # Tạo response text
            response_parts = []
            
            # Thêm tóm tắt kết quả
            if summary:
                total_steps = summary.get('total_steps_completed', 0)
                files_processed = summary.get('files_processed', 0)
                actions_performed = summary.get('actions_performed', [])
                
                response_parts.append(f"✅ **Hoàn thành {total_steps} bước xử lý**")
                
                if files_processed > 0:
                    response_parts.append(f"📁 **Đã xử lý {files_processed} file**")
                
                if actions_performed:
                    response_parts.append("🔧 **Các hành động đã thực hiện:**")
                    for action in actions_performed:
                        response_parts.append(f"  • {action}")
            
            # Thêm chain of thought nếu có
            if chain_of_thought:
                response_parts.append("\n🧠 **Quá trình suy nghĩ:**")
                response_parts.append(chain_of_thought)
            
            # Thêm chi tiết từng bước
            if execution_results:
                response_parts.append("\n📋 **Chi tiết từng bước:**")
                for i, step_result in enumerate(execution_results, 1):
                    step = step_result.get('step', {})
                    result = step_result.get('result', {})
                    status = step_result.get('status', 'unknown')
                    
                    step_desc = step.get('description', f'Bước {i}')
                    response_parts.append(f"\n**{i}. {step_desc}**")
                    
                    if status == 'success':
                        response_parts.append("✅ Thành công")
                        
                        # Thêm thông tin file nếu có
                        if 'files' in result:
                            files = result['files']
                            if files:
                                response_parts.append(f"📄 Tìm thấy {len(files)} file:")
                                for file in files[:5]:  # Chỉ hiển thị 5 file đầu
                                    name = file.get('name') or file.get('original_name', 'Unknown')
                                    response_parts.append(f"  • {name}")
                                if len(files) > 5:
                                    response_parts.append(f"  ... và {len(files) - 5} file khác")
                    else:
                        response_parts.append(f"❌ Thất bại: {result.get('error', 'Lỗi không xác định')}")
            
            return "\n".join(response_parts)
            
        except Exception as e:
            return f"✅ Đã hoàn thành xử lý yêu cầu của bạn.\n\nLưu ý: Có lỗi khi tạo response chi tiết: {str(e)}"

# Tạo instance global
agentic_session_manager = AgenticSessionManager() 