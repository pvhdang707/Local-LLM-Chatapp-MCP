from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain.schema import Document
from src.config import OllamaConfig, FaissConfig
import numpy as np
import faiss
import os

def init_vector_store() -> FAISS:
    model = OllamaEmbeddings(model = OllamaConfig.EmbeddingModel)
    FaissConfig.print_paths()  # Log the resolved paths for debugging
    if os.path.exists(FaissConfig.IndexPath):
        return FAISS(
            embedding_function=model,
            index=faiss.read_index(FaissConfig.IndexPath),
            docstore=InMemoryDocstore(np.load(FaissConfig.DocumentStorePath, allow_pickle=True).item()),
            index_to_docstore_id=np.load(FaissConfig.MapIdPath, allow_pickle=True).item()
        )
    return FAISS.from_texts([""], model)

def add_document(vectorstore, content: str, metadata: dict):
    FaissConfig.print_paths()  # Log the resolved paths for debugging
    doc = Document(page_content=content, metadata=metadata)
    vectorstore.add_documents([doc])
    faiss.write_index(vectorstore.index, FaissConfig.IndexPath)
    np.save(FaissConfig.DocumentStorePath, vectorstore.docstore._dict)
    np.save(FaissConfig.MapIdPath, vectorstore.index_to_docstore_id)

def semantic_search(vectorstore: FAISS, query: str):
    retriever = vectorstore.as_retriever(k=3, search_type="mmr")
    return retriever.invoke(query)