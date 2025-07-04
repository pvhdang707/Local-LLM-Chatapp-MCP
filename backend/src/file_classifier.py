import os
import re
from typing import Dict, List, Optional
from langchain_ollama import ChatOllama
from src.config import OllamaConfig
from src.file_utils.file_loader import load_document_from_file
from src.database import get_db, File as DBFile

class FileClassifier:
    def __init__(self):
        self.llm = ChatOllama(
            model=OllamaConfig.RagModel,
            temperature=0,
            base_url=OllamaConfig.Host,
        )
        
        # Định nghĩa các nhóm file
        self.file_groups = {
            'A': {
                'name': 'Tài liệu quan trọng',
                'description': 'Các file chứa thông tin quan trọng, kế hoạch, báo cáo',
                'keywords': ['kế hoạch', 'báo cáo', 'chiến lược', 'quan trọng', 'plan', 'report', 'strategy']
            },
            'B': {
                'name': 'Tài liệu marketing',
                'description': 'Các file liên quan đến marketing, quảng cáo, thuyết trình',
                'keywords': ['marketing', 'quảng cáo', 'thuyết trình', 'presentation', 'advertisement']
            },
            'C': {
                'name': 'Tài liệu kỹ thuật',
                'description': 'Các file code, tài liệu kỹ thuật, hướng dẫn',
                'keywords': ['code', 'kỹ thuật', 'technical', 'hướng dẫn', 'guide', 'manual']
            },
            'D': {
                'name': 'Tài liệu tài chính',
                'description': 'Các file báo cáo tài chính, ngân sách, kế toán',
                'keywords': ['tài chính', 'ngân sách', 'kế toán', 'financial', 'budget', 'accounting']
            },
            'E': {
                'name': 'Tài liệu nhân sự',
                'description': 'Các file liên quan đến nhân sự, tuyển dụng, đào tạo',
                'keywords': ['nhân sự', 'tuyển dụng', 'đào tạo', 'hr', 'recruitment', 'training']
            },
            'F': {
                'name': 'Tài liệu khác',
                'description': 'Các file không thuộc nhóm trên',
                'keywords': []
            }
        }
    
    def classify_file_by_name(self, filename: str) -> Dict:
        """Phân loại file dựa trên tên file"""
        filename_lower = filename.lower()
        
        # Kiểm tra từng nhóm
        for group_id, group_info in self.file_groups.items():
            for keyword in group_info['keywords']:
                if keyword.lower() in filename_lower:
                    return {
                        'group_id': group_id,
                        'group_name': group_info['name'],
                        'confidence': 0.8,
                        'method': 'name_based',
                        'matched_keyword': keyword
                    }
        
        # Nếu không match, trả về nhóm F
        return {
            'group_id': 'F',
            'group_name': 'Tài liệu khác',
            'confidence': 0.3,
            'method': 'default',
            'matched_keyword': None
        }
    
    def classify_file_by_content(self, file_path: str) -> Dict:
        """Phân loại file dựa trên nội dung bằng AI"""
        try:
            # Đọc nội dung file
            content = self.extract_file_content(file_path)
            if not content:
                return self.classify_file_by_name(os.path.basename(file_path))
            
            # Tạo prompt cho AI
            prompt = f"""
            Phân loại file này vào một trong các nhóm sau dựa trên nội dung:
            
            A - Tài liệu quan trọng: kế hoạch, báo cáo, chiến lược
            B - Tài liệu marketing: quảng cáo, thuyết trình, marketing
            C - Tài liệu kỹ thuật: code, hướng dẫn kỹ thuật
            D - Tài liệu tài chính: báo cáo tài chính, ngân sách
            E - Tài liệu nhân sự: tuyển dụng, đào tạo, HR
            F - Tài liệu khác
            
            Nội dung file:
            {content[:2000]}
            
            Trả lời theo format: GROUP_ID|GROUP_NAME|CONFIDENCE|REASON
            Ví dụ: A|Tài liệu quan trọng|0.9|Chứa thông tin về kế hoạch kinh doanh
            """
            
            # Gọi AI
            response = self.llm.invoke(prompt)
            result = response.content.strip()
            
            # Parse kết quả
            if '|' in result:
                parts = result.split('|')
                if len(parts) >= 4:
                    group_id = parts[0].strip()
                    group_name = parts[1].strip()
                    
                    # Parse confidence với error handling
                    try:
                        confidence_str = parts[2].strip()
                        if confidence_str.upper() == 'CONFIDENCE':
                            confidence = 0.5  # Default confidence nếu AI trả về 'CONFIDENCE'
                        else:
                            confidence = float(confidence_str)
                    except (ValueError, IndexError):
                        confidence = 0.5  # Default confidence nếu parse lỗi
                    
                    reason = parts[3].strip()
                    
                    return {
                        'group_id': group_id,
                        'group_name': group_name,
                        'confidence': confidence,
                        'method': 'ai_based',
                        'reason': reason
                    }
            
            # Fallback nếu AI không trả về đúng format
            return self.classify_file_by_name(os.path.basename(file_path))
            
        except Exception as e:
            print(f"Error classifying file by content: {e}")
            return self.classify_file_by_name(os.path.basename(file_path))
    
    def classify_file(self, file_path: str, filename: str) -> Dict:
        """Phân loại file tổng hợp"""
        print(f"Classifying file: {file_path}")
        # Thử phân loại theo nội dung trước
        content_classification = self.classify_file_by_content(file_path)
        
        # Nếu confidence thấp, thử phân loại theo tên
        if content_classification['confidence'] < 0.6:
            name_classification = self.classify_file_by_name(filename)
            
            # So sánh và chọn kết quả tốt hơn
            if name_classification['confidence'] > content_classification['confidence']:
                return name_classification
        
        return content_classification
    
    def extract_file_content(self, file_path: str) -> str:
        """Trích xuất nội dung file"""
        try:
            if file_path.lower().endswith(('.txt', '.md', '.py', '.js', '.html', '.css')):
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read(3000)  # Đọc 3000 ký tự đầu
            elif file_path.lower().endswith('.pdf'):
                documents = load_document_from_file(file_path)
                if documents:
                    return documents[0].page_content[:3000]
            elif file_path.lower().endswith(('.doc', '.docx')):
                # Có thể thêm logic đọc Word documents
                return ""
            return ""
        except Exception as e:
            print(f"Error extracting content from {file_path}: {e}")
            return ""
    
    def get_group_info(self, group_id: str) -> Optional[Dict]:
        """Lấy thông tin nhóm file"""
        return self.file_groups.get(group_id)
    
    def get_all_groups(self) -> Dict:
        """Lấy tất cả thông tin nhóm file"""
        return self.file_groups
    
    def update_file_metadata(self, file_id: str, classification: Dict) -> Dict:
        """Cập nhật metadata cho file"""
        print(f"Updating file metadata: {file_id}")
        try:
            db = next(get_db())
            file = db.query(DBFile).filter(DBFile.id == file_id).first()
            
            if file:
                # Tạo metadata
                metadata = {
                    'classification': classification,
                    'classified_at': classification.get('classified_at'),
                    'method': classification.get('method'),
                    'confidence': classification.get('confidence')
                }
                
                # Lưu metadata vào database (có thể thêm field metadata vào File model)
                # file.metadata = json.dumps(metadata)
                # db.commit()
                
                return {
                    'success': True,
                    'file_id': file_id,
                    'classification': classification,
                    'metadata': metadata
                }
            
            return {'success': False, 'error': 'File not found'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            db.close()

    def get_file_groups_by_user(self, user_id):
        """Lấy danh sách nhóm file cho user (dummy)"""
        # Trả về tất cả các nhóm, có thể lọc theo user nếu cần
        return [
            {"group_id": gid, "name": info["name"]}
            for gid, info in self.file_groups.items()
        ]

# Khởi tạo classifier
file_classifier = FileClassifier() 