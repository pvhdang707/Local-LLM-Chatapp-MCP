import requests
from typing import List
from langchain.schema import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader
import tempfile
import os

def load_document_from_url(url: str) -> List[Document]:
    """
    Load document from URL (PDF or text files)
    """
    try:
        # Download file
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.tmp') as tmp_file:
            tmp_file.write(response.content)
            tmp_file_path = tmp_file.name
        
        # Determine file type and load
        if url.lower().endswith('.pdf'):
            loader = PyPDFLoader(tmp_file_path)
        else:
            loader = TextLoader(tmp_file_path)
        
        documents = loader.load()
        
        # Clean up temporary file
        os.unlink(tmp_file_path)
        
        return documents
        
    except Exception as e:
        print(f"Error loading document from {url}: {e}")
        return []

def load_document_from_file(file_path: str) -> List[Document]:
    """
    Load document from local file path
    """
    try:
        if file_path.lower().endswith('.pdf'):
            loader = PyPDFLoader(file_path)
        else:
            loader = TextLoader(file_path)
        
        return loader.load()
        
    except Exception as e:
        print(f"Error loading document from {file_path}: {e}")
        return [] 