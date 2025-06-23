import cloudinary
import os
import uuid
from cloudinary.uploader import upload
from config import CloudinaryConfig

# Cấu hình Cloudinary từ config đã có
cloudinary.config(
    cloud_name=CloudinaryConfig.CloudName,
    api_key=CloudinaryConfig.ApiKey,
    api_secret=CloudinaryConfig.ApiSecret,
    secure=True
)

def upload_file(file, folder="uploads"):
    try:
        filename, ext = os.path.splitext(file.filename)
        ext = ext.lower()
        result = upload(
            file,
            type="upload",
            resource_type="raw",
            public_id=f"{folder}/{uuid.uuid4().hex}{ext}",
            use_filename=True,
            unique_filename=False,
            overwrite=True,
        )
        return {
            "url": result.get("secure_url"),
            "filename": result.get("original_filename"),
            "type": result.get("resource_type"),
            "public_id": result.get("public_id")
        }
    except Exception as e:
        raise RuntimeError(f"Upload failed: {str(e)}")
