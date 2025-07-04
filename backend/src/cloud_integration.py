import requests
import json
from typing import Dict, List, Optional
from datetime import datetime
from src.config import CloudinaryConfig
import os

class CloudIntegration:
    def __init__(self):
        self.cloudinary_config = CloudinaryConfig
        self.api_endpoint = "https://api.cloudinary.com/v1_1"
        
    def send_metadata_to_cloud(self, file_data: Dict, classification: Dict) -> Dict:
        """Gửi metadata file lên cloud"""
        try:
            # Tạo metadata payload
            metadata_payload = {
                "filename": file_data.get('original_name'),
                "file_id": file_data.get('id'),
                "file_type": file_data.get('file_type'),
                "file_size": file_data.get('file_size'),
                "uploaded_by": file_data.get('uploaded_by'),
                "uploaded_at": file_data.get('uploaded_at'),
                "classification": {
                    "group_id": classification.get('group_id'),
                    "group_name": classification.get('group_name'),
                    "confidence": classification.get('confidence'),
                    "method": classification.get('method'),
                    "reason": classification.get('reason', ''),
                    "classified_at": datetime.utcnow().isoformat()
                },
                "metadata": {
                    "source": "local_llm_chatapp",
                    "version": "1.0",
                    "processed_at": datetime.utcnow().isoformat()
                }
            }
            
            # Gửi lên Cloudinary (nếu có config)
            if self.cloudinary_config.CloudName:
                return self.send_to_cloudinary(metadata_payload)
            else:
                # Lưu locally nếu không có cloud config
                return self.save_metadata_locally(metadata_payload)
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Lỗi khi gửi metadata lên cloud"
            }
    
    def send_to_cloudinary(self, metadata: Dict) -> Dict:
        """Gửi metadata lên Cloudinary"""
        try:
            # Tạo resource type cho metadata
            resource_type = "raw"
            
            # Tạo URL cho Cloudinary API
            url = f"{self.api_endpoint}/{self.cloudinary_config.CloudName}/{resource_type}/upload"
            
            # Headers
            headers = {
                "Content-Type": "application/json"
            }
            
            # Data payload
            data = {
                "file": json.dumps(metadata),  # Convert metadata to JSON string
                "public_id": f"metadata/{metadata['file_id']}",
                "resource_type": resource_type,
                "api_key": self.cloudinary_config.ApiKey,
                "timestamp": int(datetime.utcnow().timestamp())
            }
            
            # Gửi request
            response = requests.post(url, data=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "cloud_url": result.get('secure_url'),
                    "public_id": result.get('public_id'),
                    "message": "Metadata đã được gửi lên cloud thành công"
                }
            else:
                return {
                    "success": False,
                    "error": f"Cloudinary API error: {response.status_code}",
                    "response": response.text
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Lỗi khi gửi lên Cloudinary"
            }
    
    def save_metadata_locally(self, metadata: Dict) -> Dict:
        """Lưu metadata locally"""
        try:
            # Tạo thư mục metadata nếu chưa có
            metadata_dir = "metadata"
            if not os.path.exists(metadata_dir):
                os.makedirs(metadata_dir)
            
            # Tạo tên file
            filename = f"metadata_{metadata['file_id']}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            filepath = os.path.join(metadata_dir, filename)
            
            # Lưu file
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            return {
                "success": True,
                "local_path": filepath,
                "message": "Metadata đã được lưu locally"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Lỗi khi lưu metadata locally"
            }
    
    def get_metadata_from_cloud(self, file_id: str) -> Dict:
        """Lấy metadata từ cloud"""
        try:
            if self.cloudinary_config.CloudName:
                # Lấy từ Cloudinary
                url = f"{self.api_endpoint}/{self.cloudinary_config.CloudName}/raw/upload"
                params = {
                    "public_id": f"metadata/{file_id}",
                    "api_key": self.cloudinary_config.ApiKey
                }
                
                response = requests.get(url, params=params)
                
                if response.status_code == 200:
                    return {
                        "success": True,
                        "metadata": response.json()
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Không tìm thấy metadata cho file {file_id}"
                    }
            else:
                # Lấy từ local
                return self.get_metadata_from_local(file_id)
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_metadata_from_local(self, file_id: str) -> Dict:
        """Lấy metadata từ local"""
        try:
            metadata_dir = "metadata"
            if not os.path.exists(metadata_dir):
                return {
                    "success": False,
                    "error": "Thư mục metadata không tồn tại"
                }
            
            # Tìm file metadata
            for filename in os.listdir(metadata_dir):
                if filename.startswith(f"metadata_{file_id}_"):
                    filepath = os.path.join(metadata_dir, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        metadata = json.load(f)
                    return {
                        "success": True,
                        "metadata": metadata,
                        "local_path": filepath
                    }
            
            return {
                "success": False,
                "error": f"Không tìm thấy metadata cho file {file_id}"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def batch_send_metadata(self, files_data: List[Dict]) -> Dict:
        """Gửi metadata hàng loạt"""
        results = []
        success_count = 0
        error_count = 0
        
        for file_data in files_data:
            # Giả sử file_data có classification
            classification = file_data.get('classification', {})
            
            result = self.send_metadata_to_cloud(file_data, classification)
            results.append({
                'file_id': file_data.get('id'),
                'filename': file_data.get('original_name'),
                'result': result
            })
            
            if result.get('success'):
                success_count += 1
            else:
                error_count += 1
        
        return {
            "success": True,
            "total_files": len(files_data),
            "success_count": success_count,
            "error_count": error_count,
            "results": results
        }

    def get_file_metadata(self, file_id):
        """Lấy metadata cho file từ cloud hoặc local (dummy)"""
        # Có thể gọi get_metadata_from_cloud hoặc get_metadata_from_local nếu muốn
        # Ở đây trả về mẫu đơn giản
        return {
            "synced": True,
            "last_sync": "2024-01-01T00:00:00Z",
            "success": True
        }

# Khởi tạo cloud integration
cloud_integration = CloudIntegration() 