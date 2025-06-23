import os
from dotenv import load_dotenv

load_dotenv()

class ServerConfig:
    Host = os.getenv("SERVER__HOST")
    Port = os.getenv("SERVER__PORT")

class OllamaConfig:
    Host = os.getenv("OLLAMA__HOST")
    EmbeddingModel = os.getenv("OLLAMA__EMBEDDING_MODEL")
    RagModel =os.getenv("OLLAMA__RAG")

class FaissConfig:
    IndexPath = os.getenv("FAISS__INDEX_PATH")
    DocumentStorePath = os.getenv("FAISS__DOCUMENT_STORE_PATH")
    MapIdPath = os.getenv("FAISS__MAP_ID_PATH")

class CloudinaryConfig:
    CloudName=os.getenv("CLOUDINARY__CLOUD_NAME")
    ApiKey=os.getenv("CLOUDINARY__API_KEY")
    ApiSecret=os.getenv("CLOUDINARY__API_SECRET")