import os
import re
from typing import List, Dict, Optional
from src.database import get_db, File as DBFile
from src.file_utils.file_loader import load_document_from_file
import json

class FileSearchEngine:
    def __init__(self):
        self.index_data = {}
        try:
            self.load_index()
        except Exception as e:
            print(f"[FILE SEARCH] Error in __init__: {e}")
            import traceback
            traceback.print_exc()
    
    def load_index(self):
        """Load file index từ database"""
        try:
            print("[FILE SEARCH] Loading file index...")
            db = next(get_db())
            files = db.query(DBFile).filter(DBFile.is_active == True).all()
            
            print(f"[FILE SEARCH] Found {len(files)} files in database")
            
            for file in files:
                try:
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
                    else:
                        print(f"[FILE SEARCH] File not found: {file.file_path}")
                except Exception as e:
                    print(f"[FILE SEARCH] Error processing file {file.id}: {e}")
                    continue
            
            print(f"[FILE SEARCH] Index loaded successfully with {len(self.index_data)} files")
        except Exception as e:
            print(f"[FILE SEARCH] Error loading file index: {e}")
            import traceback
            traceback.print_exc()
        finally:
            try:
                db.close()
            except:
                pass
    
    def extract_content_preview(self, file_path: str) -> str:
        """Trích xuất preview nội dung file"""
        try:
            if file_path.lower().endswith(('.txt', '.md', '.py', '.js', '.html', '.css')):
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(1000)  # Đọc 1000 ký tự đầu
                    return content
            elif file_path.lower().endswith('.pdf'):
                # Sử dụng file_loader để đọc PDF
                try:
                    documents = load_document_from_file(file_path)
                    if documents:
                        return documents[0].page_content[:1000]
                except Exception as pdf_error:
                    print(f"[FILE SEARCH] Error reading PDF {file_path}: {pdf_error}")
            return ""
        except Exception as e:
            print(f"[FILE SEARCH] Error extracting content from {file_path}: {e}")
            return ""
    
    def extract_keywords(self, filename: str, file_path: str) -> List[str]:
        """Trích xuất keywords từ tên file và nội dung"""
        try:
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
        except Exception as e:
            print(f"[FILE SEARCH] Error extracting keywords from {filename}: {e}")
            return []
    
    def search_by_name(self, query: str, user_id: str = None, user_role: str = None) -> List[Dict]:
        """Tìm kiếm file theo tên với lọc theo quyền truy cập"""
        try:
            query_lower = query.lower()
            results = []
            
            print(f"[FILE SEARCH] search_by_name: query='{query_lower}', user_id={user_id}, user_role={user_role}")
            print(f"[FILE SEARCH] Total files in index: {len(self.index_data)}")
            
            for file_id, file_data in self.index_data.items():
                try:
                    # Lọc theo quyền truy cập
                    if user_id and user_role != 'admin':
                        if file_data['uploaded_by'] != user_id:
                            continue
                    
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
                            'match_score': self.calculate_name_match_score(query_lower, original_name),
                            'content_preview': file_data['content_preview'][:500] + "..." if len(file_data['content_preview']) > 500 else file_data['content_preview']
                        })
                except Exception as e:
                    print(f"[FILE SEARCH] Error processing file {file_id} in search_by_name: {e}")
                    continue
            
            # Sắp xếp theo độ phù hợp
            results.sort(key=lambda x: x['match_score'], reverse=True)
            print(f"[FILE SEARCH] search_by_name found {len(results)} results")
            return results[:10]  # Trả về top 10
        except Exception as e:
            print(f"[FILE SEARCH] Error in search_by_name: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def search_by_content(self, query: str, user_id: str = None, user_role: str = None) -> List[Dict]:
        """Tìm kiếm file theo nội dung với lọc theo quyền truy cập"""
        try:
            query_lower = query.lower()
            query_words = set(query_lower.split())
            results = []
            print(f"[FILE SEARCH] search_by_content: query='{query_lower}', user_id={user_id}, user_role={user_role}")
            
            for file_id, file_data in self.index_data.items():
                try:
                    # Lọc theo quyền truy cập
                    if user_id and user_role != 'admin':
                        if file_data['uploaded_by'] != user_id:
                            continue
                    
                    content_preview = file_data['content_preview'].lower()
                    keywords = set(file_data['keywords'])
                    # Tính điểm match
                    content_match = sum(1 for word in query_words if word in content_preview)
                    keyword_match = len(query_words.intersection(keywords))
                    
                    if content_match > 0 or keyword_match > 0:
                        results.append({
                            'id': file_data['id'],
                            'name': file_data['original_name'],
                            'type': file_data['file_type'],
                            'uploaded_by': file_data['uploaded_by'],
                            'uploaded_at': file_data['uploaded_at'],
                            'match_type': 'content',
                            'match_score': content_match + keyword_match * 2,
                            'content_preview': file_data['content_preview'][:500] + "..." if len(file_data['content_preview']) > 500 else file_data['content_preview']
                        })
                except Exception as e:
                    print(f"[FILE SEARCH] Error processing file {file_id} in search_by_content: {e}")
                    continue
            
            # Sắp xếp theo độ phù hợp
            results.sort(key=lambda x: x['match_score'], reverse=True)
            print(f"[FILE SEARCH] search_by_content found {len(results)} results")
            return results[:10]
        except Exception as e:
            print(f"[FILE SEARCH] Error in search_by_content: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def search_all(self, query: str, user_id: str = None, user_role: str = None) -> Dict:
        """Tìm kiếm tổng hợp theo tên và nội dung với lọc theo quyền truy cập"""
        try:
            print(f"[FILE SEARCH] search_all called with query: '{query}'")
            
            name_results = self.search_by_name(query, user_id, user_role)
            content_results = self.search_by_content(query, user_id, user_role)
            
            print(f"[FILE SEARCH] Name results: {len(name_results)}, Content results: {len(content_results)}")
            
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
            print(f"[FILE SEARCH] Final results count: {len(final_results)}")
            return {
                'query': query,
                'total_results': len(final_results),
                'name_results': len(name_results),
                'content_results': len(content_results),
                'results': final_results[:10]
            }
        except Exception as e:
            print(f"[FILE SEARCH] Error in search_all: {e}")
            import traceback
            traceback.print_exc()
            return {
                'query': query,
                'total_results': 0,
                'name_results': 0,
                'content_results': 0,
                'results': []
            }
    
    def search_files(self, query: str, user_id: str = None, user_role: str = None, search_type: str = 'both', limit: int = 20) -> List[Dict]:
        """Tìm kiếm file với các tùy chọn linh hoạt"""
        try:
            print(f"[FILE SEARCH] Searching files with query: '{query}', type: {search_type}, user_id: {user_id}, user_role: {user_role}")
            
            if search_type == 'name':
                results = self.search_by_name(query, user_id, user_role)
            elif search_type == 'content':
                results = self.search_by_content(query, user_id, user_role)
            else:  # 'both'
                # Sử dụng search_all nhưng chỉ lấy results
                search_result = self.search_all(query, user_id, user_role)
                results = search_result['results']
            
            print(f"[FILE SEARCH] Search completed, found {len(results)} results")
            
            # Giới hạn số lượng kết quả
            return results[:limit]
        except Exception as e:
            print(f"[FILE SEARCH] Error in search_files: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def get_search_suggestions(self, user_id: str = None, user_role: str = None, query: str = '') -> List[str]:
        """Lấy gợi ý từ khóa tìm kiếm dựa trên file của user"""
        suggestions = []
        
        # Lấy tất cả file mà user có quyền truy cập
        user_files = []
        for file_id, file_data in self.index_data.items():
            if user_id and user_role != 'admin':
                if file_data['uploaded_by'] != user_id:
                    continue
            user_files.append(file_data)
        
        # Trích xuất keywords từ tên file và nội dung
        all_keywords = set()
        for file_data in user_files:
            # Keywords từ tên file
            filename_words = re.findall(r'\w+', file_data['original_name'].lower())
            all_keywords.update(filename_words)
            
            # Keywords từ nội dung
            if file_data['keywords']:
                all_keywords.update(file_data['keywords'])
        
        # Lọc theo query nếu có
        if query:
            query_lower = query.lower()
            suggestions = [kw for kw in all_keywords if query_lower in kw.lower() and len(kw) > 2]
        else:
            suggestions = [kw for kw in all_keywords if len(kw) > 2]
        
        # Sắp xếp và giới hạn kết quả
        suggestions.sort()
        return suggestions[:10]
    
    def calculate_name_match_score(self, query: str, filename: str) -> int:
        """Tính điểm match cho tên file"""
        try:
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
        except Exception as e:
            print(f"[FILE SEARCH] Error calculating match score: {e}")
            return 0
    
    def update_index(self, file_id: str):
        """Cập nhật index cho file mới"""
        try:
            print(f"[FILE SEARCH] Updating index for file {file_id}")
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
                print(f"[FILE SEARCH] Successfully updated index for file {file_id}")
            else:
                print(f"[FILE SEARCH] File {file_id} not found or file path doesn't exist")
        except Exception as e:
            print(f"[FILE SEARCH] Error updating index for file {file_id}: {e}")
            import traceback
            traceback.print_exc()
        finally:
            try:
                db.close()
            except:
                pass

# Khởi tạo search engine
try:
    print("[FILE SEARCH] Initializing file search engine...")
    file_search_engine = FileSearchEngine()
    print("[FILE SEARCH] File search engine initialized successfully")
except Exception as e:
    print(f"[FILE SEARCH] Error initializing file search engine: {e}")
    import traceback
    traceback.print_exc()
    # Tạo instance rỗng để tránh crash
    file_search_engine = FileSearchEngine()
    file_search_engine.index_data = {} 