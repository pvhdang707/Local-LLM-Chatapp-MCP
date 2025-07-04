import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Always use 'src/data' relative to the backend directory
PROJECT_ROOT = os.path.dirname(BASE_DIR)  # backend/
DATA_DIR = os.path.join(PROJECT_ROOT, "src", "data")
UPLOADS_DIR = os.path.join(PROJECT_ROOT, "src", "uploads")

class Config:
    # Database Configuration
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'mysql://root:xzMLyUcVdimxMnyZfRrdojhisZltceUc@yamanote.proxy.rlwy.net:58235/railway')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-super-secret-jwt-key-change-this-in-production')
    
    # Flask Configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # LLM Configuration
    OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
    
    # File Upload Configuration
    UPLOAD_FOLDER = UPLOADS_DIR
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'}

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    DEBUG = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

class ServerConfig:
    Host = os.getenv("SERVER__HOST", "0.0.0.0")
    Port = os.getenv("SERVER__PORT", "8000")

class OllamaConfig:
    Host = os.getenv("OLLAMA__HOST", "http://localhost:11434")
    EmbeddingModel = os.getenv("OLLAMA__EMBEDDING_MODEL", "nomic-embed-text")
    # RagModel = os.getenv("OLLAMA__RAG", "mistral")
    RagModel = os.getenv("OLLAMA__RAG", "phi")

class FaissConfig:
    IndexPath = os.getenv("FAISS__INDEX_PATH", os.path.join(DATA_DIR, "index.bin"))
    DocumentStorePath = os.getenv("FAISS__DOCUMENT_STORE_PATH", os.path.join(DATA_DIR, "docstore.npy"))
    MapIdPath = os.getenv("FAISS__MAP_ID_PATH", os.path.join(DATA_DIR, "map_id.npy"))

    @staticmethod
    def print_paths():
        print(f"[FAISS PATHS] IndexPath: {FaissConfig.IndexPath}")
        print(f"[FAISS PATHS] DocumentStorePath: {FaissConfig.DocumentStorePath}")
        print(f"[FAISS PATHS] MapIdPath: {FaissConfig.MapIdPath}")

class CloudinaryConfig:
    CloudName=os.getenv("CLOUDINARY__CLOUD_NAME")
    ApiKey=os.getenv("CLOUDINARY__API_KEY")
    ApiSecret=os.getenv("CLOUDINARY__API_SECRET")