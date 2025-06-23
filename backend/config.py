import os
from dotenv import load_dotenv

load_dotenv()

class ServerConfig:
    Host = os.getenv("SERVER__HOST", "0.0.0.0")
    Port = os.getenv("SERVER__PORT", "8000")

class OllamaConfig:
    Host = os.getenv("OLLAMA__HOST", "http://localhost:11434")
    EmbeddingModel = os.getenv("OLLAMA__EMBEDDING_MODEL", "nomic-embed-text")
    RagModel = os.getenv("OLLAMA__RAG", "mistral")

class FaissConfig:
    IndexPath = os.getenv("FAISS__INDEX_PATH", "./data/index.bin")
    DocumentStorePath = os.getenv("FAISS__DOCUMENT_STORE_PATH", "./data/docstore.npy")
    MapIdPath = os.getenv("FAISS__MAP_ID_PATH", "./data/map_id.npy")

class CloudinaryConfig:
    CloudName=os.getenv("CLOUDINARY__CLOUD_NAME")
    ApiKey=os.getenv("CLOUDINARY__API_KEY")
    ApiSecret=os.getenv("CLOUDINARY__API_SECRET")