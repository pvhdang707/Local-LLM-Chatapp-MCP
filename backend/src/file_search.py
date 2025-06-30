import os
import re
from typing import List, Dict, Optional
from src.database import get_db, File as DBFile
from src.file_utils.file_loader import load_document_from_file
import json

class FileSearchEngine:
    def __init__(self):
        self.index_data = {}
        self.load_index()
    
    def load_index(self):
        """Load file index từ database"""
        try:
            db = next(get_db())
            files = db.query(DBFile).filter(DBFile.is_active == True).all()
            
            for file in files:
                if os.path.exists(file.file_path):
                    self.index_data[file.id] = {
                        'id': file.id,
                        'original_name': file.original_name,
                        'stored_name': file.stored_name,
                        'file_path': file.file_path,
                        'file_type': file.file_type,
                        'uploaded_by': file.uploaded_by,
                        'uploaded_at': file.uploaded_at.isoformat() if file.uploaded_at else None,
                        'content_preview': self.extract_content_preview(file.file_path),
                        'keywords': self.extract_keywords(file.original_name, file.file_path)
                    }
        except Exception as e:
            print(f"Error loading file index: {e}")
        finally:
            db.close()
    
    def extract_content_preview(self, file_path: str) -> str:
        """Trích xuất preview nội dung file"""
        try:
            if file_path.lower().endswith(('.txt', '.md', '.py', '.js', '.html', '.css')):
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(1000)  # Đọc 1000 ký tự đầu
                    return content
            elif file_path.lower().endswith('.pdf'):
                # Sử dụng file_loader để đọc PDF
                documents = load_document_from_file(file_path)
                if documents:
                    return documents[0].page_content[:1000]
            return ""
        except Exception as e:
            print(f"Error extracting content from {file_path}: {e}")
            return ""
    
    def extract_keywords(self, filename: str, file_path: str) -> List[str]:
        """Trích xuất keywords từ tên file và nội dung"""
        keywords = []
        
        # Keywords từ tên file
        filename_lower = filename.lower()
        keywords.extend(re.findall(r'\w+', filename_lower))
        
        # Keywords từ nội dung
        content = self.extract_content_preview(file_path)
        if content:
            content_lower = content.lower()
            # Tìm các từ có ý nghĩa (loại bỏ stop words)
            words = re.findall(r'\b[a-zA-ZÀ-ỹ]{3,}\b', content_lower)
            keywords.extend(words[:50])  # Giới hạn 50 từ
        
        return list(set(keywords))  # Loại bỏ duplicate
    
    def search_by_name(self, query: str) -> List[Dict]:
        """Tìm kiếm file theo tên"""
        query_lower = query.lower()
        results = []
        
        for file_id, file_data in self.index_data.items():
            original_name = file_data['original_name'].lower()
            stored_name = file_data['stored_name'].lower()
            
            # Tìm kiếm fuzzy match
            if (query_lower in original_name or 
                query_lower in stored_name or
                any(word in original_name for word in query_lower.split())):
                
                results.append({
                    'id': file_data['id'],
                    'name': file_data['original_name'],
                    'type': file_data['file_type'],
                    'uploaded_by': file_data['uploaded_by'],
                    'uploaded_at': file_data['uploaded_at'],
                    'match_type': 'name',
                    'match_score': self.calculate_name_match_score(query_lower, original_name)
                })
        
        # Sắp xếp theo độ phù hợp
        results.sort(key=lambda x: x['match_score'], reverse=True)
        return results[:10]  # Trả về top 10
    
    def search_by_content(self, query: str) -> List[Dict]:
        """Tìm kiếm file theo nội dung"""
        query_lower = query.lower()
        query_words = set(query_lower.split())
        results = []
        print(f"[DEBUG][search_by_content] Query: {query_lower}")
        for file_id, file_data in self.index_data.items():
            content_preview = file_data['content_preview'].lower()
            keywords = set(file_data['keywords'])
            # Tính điểm match
            content_match = sum(1 for word in query_words if word in content_preview)
            keyword_match = len(query_words.intersection(keywords))
            print(f"[DEBUG][search_by_content] File: {file_data['original_name']}, Content preview: {content_preview[:100]}")
            print(f"[DEBUG][search_by_content] Content match: {content_match}, Keyword match: {keyword_match}")
            if content_match > 0 or keyword_match > 0:
                results.append({
                    'id': file_data['id'],
                    'name': file_data['original_name'],
                    'type': file_data['file_type'],
                    'uploaded_by': file_data['uploaded_by'],
                    'uploaded_at': file_data['uploaded_at'],
                    'match_type': 'content',
                    'match_score': content_match + keyword_match * 2,
                    'content_preview': file_data['content_preview'][:200] + "..."
                })
        # Sắp xếp theo độ phù hợp
        results.sort(key=lambda x: x['match_score'], reverse=True)
        return results[:10]
    
    def search_all(self, query: str) -> Dict:
        """Tìm kiếm tổng hợp theo tên và nội dung"""
        name_results = self.search_by_name(query)
        content_results = self.search_by_content(query)
        # Gộp kết quả và loại bỏ duplicate
        all_results = {}
        for result in name_results:
            all_results[result['id']] = result
        for result in content_results:
            if result['id'] in all_results:
                # Nếu file xuất hiện trong cả 2 kết quả, tăng điểm
                all_results[result['id']]['match_score'] += result['match_score']
                all_results[result['id']]['match_type'] = 'both'
            else:
                all_results[result['id']] = result
        # Sắp xếp theo điểm tổng hợp
        final_results = list(all_results.values())
        final_results.sort(key=lambda x: x['match_score'], reverse=True)
        print(f"[DEBUG][search_all] Tổng kết kết quả search_all: {final_results}")
        return {
            'query': query,
            'total_results': len(final_results),
            'name_results': len(name_results),
            'content_results': len(content_results),
            'results': final_results[:10]
        }
    
    def calculate_name_match_score(self, query: str, filename: str) -> int:
        """Tính điểm match cho tên file"""
        score = 0
        
        # Exact match
        if query in filename:
            score += 10
        
        # Word match
        query_words = query.split()
        filename_words = filename.split()
        
        for qword in query_words:
            for fword in filename_words:
                if qword in fword or fword in qword:
                    score += 5
        
        return score
    
    def update_index(self, file_id: str):
        """Cập nhật index cho file mới"""
        try:
            db = next(get_db())
            file = db.query(DBFile).filter(DBFile.id == file_id).first()
            
            if file and os.path.exists(file.file_path):
                self.index_data[file.id] = {
                    'id': file.id,
                    'original_name': file.original_name,
                    'stored_name': file.stored_name,
                    'file_path': file.file_path,
                    'file_type': file.file_type,
                    'uploaded_by': file.uploaded_by,
                    'uploaded_at': file.uploaded_at.isoformat() if file.uploaded_at else None,
                    'content_preview': self.extract_content_preview(file.file_path),
                    'keywords': self.extract_keywords(file.original_name, file.file_path)
                }
        except Exception as e:
            print(f"Error updating index for file {file_id}: {e}")
        finally:
            db.close()

# Khởi tạo search engine
file_search_engine = FileSearchEngine() 