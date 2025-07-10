import uuid
import json
import pandas as pd
from typing import Dict, List, Optional, Any
from datetime import datetime
from langchain_ollama import ChatOllama
from src.config import OllamaConfig
from src.file_search import file_search_engine
from src.file_classifier import file_classifier
from src.cloud_integration import cloud_integration
from src.file_manager import file_manager
import os

class AgenticAI:
    def __init__(self):
        self.llm = ChatOllama(
            model=OllamaConfig.RagModel,
            temperature=0.1,
            base_url=OllamaConfig.Host,
        )
        
        # Định nghĩa các action có thể thực hiện
        self.available_actions = {
            'search_files': {
                'name': 'Tìm kiếm file',
                'description': 'Tìm kiếm file theo tên hoặc nội dung',
                'parameters': ['query', 'search_type']
            },
            'classify_files': {
                'name': 'Phân loại file',
                'description': 'Phân loại file thành các nhóm',
                'parameters': ['file_ids']
            },
            'extract_metadata': {
                'name': 'Trích xuất metadata',
                'description': 'Trích xuất thông tin metadata từ file',
                'parameters': ['file_ids']
            },
            'export_metadata': {
                'name': 'Xuất metadata',
                'description': 'Xuất metadata ra file Excel',
                'parameters': ['file_ids', 'output_format']
            },
            'upload_to_cloud': {
                'name': 'Upload lên cloud',
                'description': 'Gửi metadata lên cloud storage',
                'parameters': ['file_ids']
            }
        }
    
    def plan_actions(self, user_request: str) -> Dict:
        """Lên kế hoạch hành động dựa trên yêu cầu của user"""
        try:
            # Tạo prompt để AI lên kế hoạch
            prompt = f"""
            Bạn là một AI Agent thông minh. Dựa trên yêu cầu của user, hãy lên kế hoạch các hành động cần thực hiện.
            
            Yêu cầu của user: "{user_request}"
            
            Các hành động có thể thực hiện:
            {json.dumps(self.available_actions, indent=2, ensure_ascii=False)}
            
            Hãy phân tích yêu cầu và trả về kế hoạch hành động theo format JSON:
            {{
                "plan": [
                    {{
                        "action": "tên_hành_động",
                        "description": "Mô tả hành động",
                        "parameters": {{"param1": "value1"}},
                        "order": 1
                    }}
                ],
                "expected_output": "Mô tả kết quả mong đợi",
                "estimated_steps": 3
            }}
            
            Ví dụ cho yêu cầu "Tìm file 'kế hoạch marketing 2024' và xuất danh sách":
            {{
                "plan": [
                    {{
                        "action": "search_files",
                        "description": "Tìm kiếm file có chứa 'kế hoạch marketing 2024'",
                        "parameters": {{"query": "kế hoạch marketing 2024", "search_type": "both"}},
                        "order": 1
                    }},
                    {{
                        "action": "classify_files",
                        "description": "Phân loại các file tìm được",
                        "parameters": {{"file_ids": "dynamic"}},
                        "order": 2
                    }},
                    {{
                        "action": "export_metadata",
                        "description": "Xuất metadata ra file Excel",
                        "parameters": {{"file_ids": "dynamic", "output_format": "excel"}},
                        "order": 3
                    }}
                ],
                "expected_output": "Danh sách file tìm được với phân loại và file Excel metadata",
                "estimated_steps": 3
            }}
            """
            
            # Gọi AI để lên kế hoạch
            response = self.llm.invoke(prompt)
            plan_text = response.content.strip()
            
            # Parse JSON từ response
            try:
                # Tìm JSON trong response
                start_idx = plan_text.find('{')
                end_idx = plan_text.rfind('}') + 1
                if start_idx != -1 and end_idx != -1:
                    plan_json = plan_text[start_idx:end_idx]
                    plan = json.loads(plan_json)
                else:
                    raise ValueError("Không tìm thấy JSON trong response")
                    
            except json.JSONDecodeError:
                # Fallback: tạo plan mặc định
                plan = self._create_default_plan(user_request)
            
            return {
                'success': True,
                'plan': plan,
                'user_request': user_request,
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'plan': self._create_default_plan(user_request)
            }
    
    def _create_default_plan(self, user_request: str) -> Dict:
        """Tạo kế hoạch mặc định khi AI không thể parse"""
        return {
            "plan": [
                {
                    "action": "search_files",
                    "description": f"Tìm kiếm file theo yêu cầu: {user_request}",
                    "parameters": {"query": user_request, "search_type": "both"},
                    "order": 1
                }
            ],
            "expected_output": "Kết quả tìm kiếm file",
            "estimated_steps": 1
        }
    
    def execute_plan(self, plan: Dict, user_id: str, user_role: str) -> Dict:
        """Thực hiện kế hoạch hành động"""
        try:
            execution_results = []
            current_files = []
            
            # Sắp xếp plan theo thứ tự
            sorted_plan = sorted(plan['plan'], key=lambda x: x['order'])
            
            for step in sorted_plan:
                action = step['action']
                parameters = step['parameters']
                description = step['description']
                
                print(f"🔧 Thực hiện: {description}")
                
                # Thực hiện từng action
                if action == 'search_files':
                    result = self._execute_search_files(parameters, user_id, user_role)
                    current_files = result.get('files', [])
                    execution_results.append({
                        'step': step,
                        'result': result,
                        'status': 'success'
                    })
                
                elif action == 'classify_files':
                    # Sử dụng file_ids từ kết quả search trước đó
                    if current_files:
                        file_ids = [f['id'] for f in current_files]
                        result = self._execute_classify_files(file_ids)
                        execution_results.append({
                            'step': step,
                            'result': result,
                            'status': 'success'
                        })
                
                elif action == 'extract_metadata':
                    if current_files:
                        file_ids = [f['id'] for f in current_files]
                        result = self._execute_extract_metadata(file_ids)
                        execution_results.append({
                            'step': step,
                            'result': result,
                            'status': 'success'
                        })
                
                elif action == 'export_metadata':
                    if current_files:
                        file_ids = [f['id'] for f in current_files]
                        result = self._execute_export_metadata(file_ids, parameters.get('output_format', 'excel'))
                        execution_results.append({
                            'step': step,
                            'result': result,
                            'status': 'success'
                        })
                
                elif action == 'upload_to_cloud':
                    if current_files:
                        file_ids = [f['id'] for f in current_files]
                        result = self._execute_upload_to_cloud(file_ids)
                        execution_results.append({
                            'step': step,
                            'result': result,
                            'status': 'success'
                        })
            
            # Tạo summary
            summary = self._create_execution_summary(execution_results, current_files)
            
            return {
                'success': True,
                'execution_results': execution_results,
                'summary': summary,
                'total_steps': len(execution_results),
                'completed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'execution_results': execution_results if 'execution_results' in locals() else []
            }
    
    def _execute_search_files(self, parameters: Dict, user_id: str, user_role: str) -> Dict:
        """Thực hiện tìm kiếm file"""
        query = parameters.get('query', '')
        search_type = parameters.get('search_type', 'both')
        
        results = file_search_engine.search_files(
            query=query,
            user_id=user_id,
            user_role=user_role,
            search_type=search_type,
            limit=10
        )
        
        return {
            'action': 'search_files',
            'query': query,
            'files_found': len(results),
            'files': results
        }
    
    def _execute_classify_files(self, file_ids: List[str]) -> Dict:
        """Thực hiện phân loại file"""
        classifications = []
        
        for file_id in file_ids:
            try:
                classification = file_classifier.get_file_classification(file_id)
                classifications.append({
                    'file_id': file_id,
                    'classification': classification
                })
            except Exception as e:
                classifications.append({
                    'file_id': file_id,
                    'error': str(e)
                })
        
        return {
            'action': 'classify_files',
            'total_files': len(file_ids),
            'classifications': classifications
        }
    
    def _execute_extract_metadata(self, file_ids: List[str]) -> Dict:
        """Thực hiện trích xuất metadata"""
        metadata_list = []
        
        for file_id in file_ids:
            try:
                file_info = file_manager.get_file_by_id(file_id)
                if file_info:
                    metadata = {
                        'file_id': file_id,
                        'filename': file_info.get('original_name', ''),
                        'file_type': file_info.get('file_type', ''),
                        'size': file_info.get('file_size', 0),
                        'uploaded_by': file_info.get('uploaded_by', ''),
                        'uploaded_at': file_info.get('uploaded_at', ''),
                        'classification': file_classifier.get_file_classification(file_id)
                    }
                    metadata_list.append(metadata)
            except Exception as e:
                metadata_list.append({
                    'file_id': file_id,
                    'error': str(e)
                })
        
        return {
            'action': 'extract_metadata',
            'total_files': len(file_ids),
            'metadata': metadata_list
        }
    
    def _execute_export_metadata(self, file_ids: List[str], output_format: str = 'excel') -> Dict:
        """Thực hiện xuất metadata"""
        try:
            # Lấy metadata cho tất cả files
            metadata_list = []
            for file_id in file_ids:
                try:
                    file_info = file_manager.get_file_by_id(file_id)
                    if file_info:
                        classification = file_classifier.get_file_classification(file_id)
                        metadata = {
                            'File ID': file_id,
                            'Tên file': file_info.get('original_name', ''),
                            'Loại file': file_info.get('file_type', ''),
                            'Kích thước (bytes)': file_info.get('file_size', 0),
                            'Người upload': file_info.get('uploaded_by', ''),
                            'Ngày upload': file_info.get('uploaded_at', ''),
                            'Nhóm': classification.get('group_name', ''),
                            'Độ tin cậy': classification.get('confidence', 0),
                            'Lý do phân loại': classification.get('reason', '')
                        }
                        metadata_list.append(metadata)
                except Exception as e:
                    metadata_list.append({
                        'File ID': file_id,
                        'Lỗi': str(e)
                    })
            
            # Tạo DataFrame và xuất Excel
            df = pd.DataFrame(metadata_list)
            
            # Tạo thư mục exports nếu chưa có
            exports_dir = 'uploads/exports'
            os.makedirs(exports_dir, exist_ok=True)
            
            # Tạo tên file
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'metadata_export_{timestamp}.xlsx'
            filepath = os.path.join(exports_dir, filename)
            
            # Xuất Excel
            df.to_excel(filepath, index=False, engine='openpyxl')
            
            return {
                'action': 'export_metadata',
                'format': output_format,
                'filename': filename,
                'filepath': filepath,
                'total_records': len(metadata_list),
                'download_url': f'/api/files/download/export/{filename}'
            }
            
        except Exception as e:
            return {
                'action': 'export_metadata',
                'error': str(e)
            }
    
    def _execute_upload_to_cloud(self, file_ids: List[str]) -> Dict:
        """Thực hiện upload metadata lên cloud"""
        upload_results = []
        
        for file_id in file_ids:
            try:
                file_info = file_manager.get_file_by_id(file_id)
                if file_info:
                    classification = file_classifier.get_file_classification(file_id)
                    cloud_result = cloud_integration.send_metadata_to_cloud(file_info, classification)
                    upload_results.append({
                        'file_id': file_id,
                        'success': True,
                        'cloud_result': cloud_result
                    })
                else:
                    upload_results.append({
                        'file_id': file_id,
                        'success': False,
                        'error': 'File not found'
                    })
            except Exception as e:
                upload_results.append({
                    'file_id': file_id,
                    'success': False,
                    'error': str(e)
                })
        
        return {
            'action': 'upload_to_cloud',
            'total_files': len(file_ids),
            'successful_uploads': len([r for r in upload_results if r['success']]),
            'failed_uploads': len([r for r in upload_results if not r['success']]),
            'results': upload_results
        }
    
    def _create_execution_summary(self, execution_results: List[Dict], files: List[Dict]) -> Dict:
        """Tạo summary của quá trình thực hiện"""
        summary = {
            'total_steps_completed': len(execution_results),
            'files_processed': len(files),
            'actions_performed': []
        }
        
        for result in execution_results:
            step = result['step']
            action_result = result['result']
            
            summary['actions_performed'].append({
                'action': step['action'],
                'description': step['description'],
                'status': result['status'],
                'details': action_result
            })
        
        return summary

# Khởi tạo instance
agentic_ai = AgenticAI() 