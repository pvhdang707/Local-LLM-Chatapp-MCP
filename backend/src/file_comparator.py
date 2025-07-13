"""
Module so sánh nội dung file
"""
import os
import difflib
from typing import List, Dict, Any
from src.file_manager import file_manager
from src.llm import llm_manager
import re

class FileComparator:
    
    def compare_files(self, file_ids: List[str], comparison_type: str = "content") -> Dict[str, Any]:
        """
        So sánh nhiều file với nhau
        
        Args:
            file_ids: Danh sách ID của các file cần so sánh
            comparison_type: Loại so sánh ("content", "metadata", "summary")
        
        Returns:
            Kết quả so sánh
        """
        if len(file_ids) < 2:
            return {
                "success": False,
                "error": "Cần ít nhất 2 file để so sánh"
            }
        
        # Lấy thông tin và nội dung các file
        files_data = []
        for file_id in file_ids:
            file_info = file_manager.get_file_by_id(file_id)
            if not file_info:
                continue
                
            # Đọc nội dung file
            content = self._read_file_content(file_info['file_path'])
            files_data.append({
                'id': file_id,
                'name': file_info['original_name'],
                'content': content,
                'metadata': {
                    'size': file_info['file_size'],
                    'type': file_info['file_type'],
                    'uploaded_at': file_info['uploaded_at']
                }
            })
        
        if len(files_data) < 2:
            return {
                "success": False,
                "error": "Không thể đọc được nội dung file"
            }
        
        # Thực hiện so sánh theo loại
        if comparison_type == "content":
            return self._compare_content(files_data)
        elif comparison_type == "metadata":
            return self._compare_metadata(files_data)
        elif comparison_type == "summary":
            return self._compare_with_ai_summary(files_data)
        else:
            return self._compare_content(files_data)
    
    def _read_file_content(self, file_path: str) -> str:
        """Đọc nội dung file"""
        try:
            if not os.path.exists(file_path):
                return ""
            
            # Hỗ trợ các loại file text
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return ""
    
    def _compare_content(self, files_data: List[Dict]) -> Dict[str, Any]:
        """So sánh nội dung raw của các file"""
        comparison_results = []
        
        # So sánh từng cặp file
        for i in range(len(files_data)):
            for j in range(i + 1, len(files_data)):
                file1 = files_data[i]
                file2 = files_data[j]
                
                # Tính độ tương đồng
                similarity = self._calculate_similarity(file1['content'], file2['content'])
                
                # Tìm khác biệt
                differences = list(difflib.unified_diff(
                    file1['content'].splitlines(keepends=True),
                    file2['content'].splitlines(keepends=True),
                    fromfile=file1['name'],
                    tofile=file2['name'],
                    n=3
                ))
                
                comparison_results.append({
                    'file1': {
                        'id': file1['id'],
                        'name': file1['name']
                    },
                    'file2': {
                        'id': file2['id'],
                        'name': file2['name']
                    },
                    'similarity_score': similarity,
                    'differences_count': len([d for d in differences if d.startswith(('+', '-')) and not d.startswith(('+++', '---'))]),
                    'differences_preview': differences[:10] if differences else []
                })
        
        return {
            "success": True,
            "comparison_type": "content",
            "files_compared": len(files_data),
            "comparisons": comparison_results
        }
    
    def _compare_metadata(self, files_data: List[Dict]) -> Dict[str, Any]:
        """So sánh metadata của các file"""
        metadata_comparison = []
        
        for i in range(len(files_data)):
            for j in range(i + 1, len(files_data)):
                file1 = files_data[i]
                file2 = files_data[j]
                
                size_diff = abs(file1['metadata']['size'] - file2['metadata']['size'])
                size_diff_percent = (size_diff / max(file1['metadata']['size'], file2['metadata']['size'])) * 100 if max(file1['metadata']['size'], file2['metadata']['size']) > 0 else 0
                
                metadata_comparison.append({
                    'file1': {
                        'id': file1['id'],
                        'name': file1['name'],
                        'size': file1['metadata']['size'],
                        'type': file1['metadata']['type']
                    },
                    'file2': {
                        'id': file2['id'],
                        'name': file2['name'],
                        'size': file2['metadata']['size'],
                        'type': file2['metadata']['type']
                    },
                    'size_difference': size_diff,
                    'size_difference_percent': round(size_diff_percent, 2),
                    'same_type': file1['metadata']['type'] == file2['metadata']['type']
                })
        
        return {
            "success": True,
            "comparison_type": "metadata",
            "files_compared": len(files_data),
            "comparisons": metadata_comparison        }
    
    def _compare_with_ai_summary(self, files_data: List[Dict]) -> Dict[str, Any]:
        """Sử dụng AI để so sánh và tóm tắt sự khác biệt"""
        try:
            # Rút trích thông tin quan trọng từ mỗi file
            extracted_info = []
            for file_data in files_data:
                file_info = self._extract_key_information(file_data)
                extracted_info.append(file_info)
            
            # Tạo prompt chi tiết để so sánh
            files_analysis = []
            for i, info in enumerate(extracted_info):
                files_analysis.append(f"""
FILE {i+1}: {info['name']}
- Loại: {info['type']}
- Kích thước: {info['size']} bytes
- Thông tin chính: {info['key_info']}
- Nội dung chính: {info['main_content']}
- Số liệu quan trọng: {info['numbers']}
- Từ khóa: {', '.join(info['keywords'])}
""")
            
            prompt = f"""
Bạn là chuyên gia phân tích tài liệu. Hãy so sánh chi tiết các file sau:

{chr(10).join(files_analysis)}

Hãy phân tích một cách chi tiết và có cấu trúc:

## 📊 THÔNG TIN TỔNG QUAN
- Số lượng file: {len(files_data)}
- Loại file: [liệt kê các loại]

## 🔍 PHÂN TÍCH CHI TIẾT

### 1. ĐIỂM GIỐNG NHAU
- [Liệt kê các điểm tương đồng về nội dung, cấu trúc, mục đích]

### 2. ĐIỂM KHÁC BIỆT CHÍNH
- [So sánh chi tiết các khác biệt quan trọng]
- [Phân tích số liệu nếu có]

### 3. XU HƯỚNG & THAY ĐỔI
- [Nếu có thể xác định được thời gian, phân tích xu hướng]
- [Các thay đổi đáng chú ý]

### 4. ĐÁNH GIÁ & KẾT LUẬN
- [Tổng kết ý nghĩa của sự khác biệt]
- [Khuyến nghị hoặc nhận xét]

Trả lời bằng tiếng Việt, chi tiết và có cấu trúc rõ ràng.
"""

            ai_comparison = llm_manager.generate_response(prompt)
            
            return {
                "success": True,
                "comparison_type": "ai_summary",
                "files_compared": len(files_data),
                "ai_analysis": ai_comparison,
                "extracted_info": extracted_info,
                "files": [{'id': f['id'], 'name': f['name'], 'size': f['metadata']['size']} for f in files_data]
            }
            
        except Exception as e:
            print(f"Error in AI comparison: {e}")
            return {
                "success": False,
                "error": "Không thể thực hiện so sánh bằng AI"
            }
    
    def _extract_key_information(self, file_data: Dict) -> Dict[str, Any]:
        """Rút trích thông tin quan trọng từ file"""
        content = file_data['content']
        name = file_data['name']
        
        # Rút trích số liệu
        numbers = re.findall(r'\d{1,3}(?:,\d{3})*(?:\.\d+)?', content)
        
        # Rút trích từ khóa quan trọng
        keywords = self._extract_keywords(content)
        
        # Lấy phần nội dung chính (1000 ký tự đầu)
        main_content = content[:1000] + "..." if len(content) > 1000 else content
        
        # Tóm tắt thông tin chính bằng AI
        key_info_prompt = f"""
Tóm tắt nội dung chính của file "{name}" trong 2-3 câu:

{main_content}

Chỉ trả lời nội dung tóm tắt, không cần giải thích thêm.
"""
        
        try:
            key_info = llm_manager.generate_response(key_info_prompt)
        except:
            key_info = "Không thể tóm tắt nội dung"
        
        return {
            'name': name,
            'type': file_data['metadata']['type'],
            'size': file_data['metadata']['size'],
            'key_info': key_info,
            'main_content': main_content,
            'numbers': numbers[:10],  # Lấy 10 số đầu tiên
            'keywords': keywords[:15]  # Lấy 15 từ khóa đầu tiên
        }
    
    def _extract_keywords(self, content: str) -> List[str]:
        """Rút trích từ khóa quan trọng từ nội dung"""
        # Loại bỏ các từ phổ biến
        stop_words = {'và', 'của', 'là', 'có', 'được', 'cho', 'với', 'từ', 'về', 
                     'trong', 'để', 'này', 'đó', 'các', 'một', 'những', 'như', 
                     'sẽ', 'đã', 'thì', 'cũng', 'còn', 'không', 'theo', 'lại'}
        
        # Tách từ và lọc
        words = re.findall(r'\b[a-zA-ZÀ-ỹ]{3,}\b', content.lower())
        keywords = [word for word in words if word not in stop_words]
        
        # Đếm tần suất và lấy các từ phổ biến
        word_count = {}
        for word in keywords:
            word_count[word] = word_count.get(word, 0) + 1
        
        # Sắp xếp theo tần suất và lấy top keywords
        sorted_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
        return [word for word, count in sorted_words if count > 1][:15]
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Tính độ tương đồng giữa 2 đoạn text"""
        try:
            # Sử dụng SequenceMatcher để tính similarity
            similarity = difflib.SequenceMatcher(None, text1, text2).ratio()
            return round(similarity * 100, 2)
        except Exception:
            return 0.0
    
    def find_files_for_comparison(self, query: str, user_id: str, user_role: str) -> List[Dict[str, Any]]:
        """
        Tìm file dành cho so sánh dựa trên query
        Ví dụ: "so sánh budget 2024 và 2025" -> tìm file có chứa "budget 2024" và "budget 2025"
        """
        from src.file_search import file_search_engine
        
        # Tách các từ khóa từ query
        keywords = self._extract_comparison_keywords(query)
        
        if len(keywords) < 2:
            # Nếu không tách được, tìm chung với query gốc
            search_results = file_search_engine.search_all(query, user_id, user_role)
            return search_results.get('results', [])[:5]  # Lấy tối đa 5 file
        
        # Tìm file cho từng keyword
        all_files = []
        for keyword in keywords:
            search_results = file_search_engine.search_all(keyword, user_id, user_role)
            all_files.extend(search_results.get('results', []))
        
        # Loại bỏ trùng lặp
        seen_ids = set()
        unique_files = []
        for file in all_files:
            if file['id'] not in seen_ids:
                seen_ids.add(file['id'])
                unique_files.append(file)
        
        # Sắp xếp theo độ phù hợp
        unique_files.sort(key=lambda x: x.get('match_score', 0), reverse=True)
        
        return unique_files[:5]  # Lấy tối đa 5 file
    
    def _extract_comparison_keywords(self, query: str) -> List[str]:
        """
        Trích xuất các từ khóa để so sánh từ query
        Ví dụ: "so sánh budget 2024 và 2025" -> ["budget 2024", "budget 2025"]
        """
        # Loại bỏ từ "so sánh"
        clean_query = re.sub(r'\b(so sánh|compare|vs|versus)\b', '', query, flags=re.IGNORECASE).strip()
        
        # Tách theo "và", "vs", "với"
        keywords = re.split(r'\b(và|vs|versus|với|,)\b', clean_query, flags=re.IGNORECASE)
        
        # Làm sạch và loại bỏ từ kết nối
        result = []
        for keyword in keywords:
            keyword = keyword.strip()
            if keyword and keyword.lower() not in ['và', 'vs', 'versus', 'với', ',']:
                result.append(keyword)
        
        return result[:5]  # Tối đa 5 keyword


# Khởi tạo instance global
file_comparator = FileComparator()
