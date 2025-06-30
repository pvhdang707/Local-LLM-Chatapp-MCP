#!/usr/bin/env python3
"""
Script để reindex tất cả files hiện có vào FAISS database
"""
import os
import sys
sys.path.append('src')

from src.database import get_db, File as DBFile
from src.file_utils.file_loader import load_document_from_file
import src.vectordb as vectordb

def reindex_all_files():
    """Reindex tất cả files trong database vào FAISS"""
    print("=== REINDEXING FILES TO FAISS ===")
    
    db = next(get_db())
    try:
        files = db.query(DBFile).filter(DBFile.is_active == True).all()
        print(f"Found {len(files)} active files to reindex")
        
        vectorstore = vectordb.init_vector_store()
        indexed_count = 0
        
        for file in files:
            if os.path.exists(file.file_path):
                try:
                    print(f"Processing file: {file.original_name}")
                    documents = load_document_from_file(file.file_path)
                    
                    if documents:
                        for doc in documents:
                            metadata = {
                                "source": "uploaded_file",
                                "file_id": file.id,
                                "file_name": file.original_name,
                                "file_type": file.file_type,
                                "uploaded_by": file.uploaded_by
                            }
                            vectordb.add_document(vectorstore, doc.page_content, metadata)
                        
                        indexed_count += 1
                        print(f"✓ Successfully indexed: {file.original_name}")
                    else:
                        print(f"⚠ No content extracted from: {file.original_name}")
                        
                except Exception as e:
                    print(f"✗ Error indexing {file.original_name}: {e}")
            else:
                print(f"⚠ File not found: {file.file_path}")
        
        print(f"\n=== REINDEX COMPLETE ===")
        print(f"Successfully indexed: {indexed_count}/{len(files)} files")
        
    except Exception as e:
        print(f"Error during reindexing: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reindex_all_files() 