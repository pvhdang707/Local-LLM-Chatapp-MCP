import requests
from typing import List
from langchain.schema import Document
from langchain_community.document_loaders import PyPDFLoader
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
            documents = loader.load()
        else:
            # For text files, read manually
            with open(tmp_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                documents = [Document(page_content=content, metadata={"source": url})]
        
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
            return loader.load()
        else:
            # For text files, read manually with multiple encoding attempts
            encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'windows-1252']
            
            for encoding in encodings:
                try:
                    with open(file_path, 'r', encoding=encoding, errors='ignore') as f:
                        content = f.read()
                        if content.strip():
                            print(f"Successfully loaded {file_path} with encoding: {encoding}")
                            return [Document(page_content=content, metadata={"source": file_path})]
                except Exception as e:
                    print(f"Failed to load {file_path} with encoding {encoding}: {e}")
                    continue
            
            print(f"Could not load {file_path} with any encoding")
            return []
        
    except Exception as e:
        print(f"Error loading document from {file_path}: {e}")
        return [] 