"""
AI Agentic Tools - Các công cụ cho agents sử dụng
"""

import os
import json
import requests
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from langchain.schema import Document
import vectordb
from file_utils.file_loader import load_document_from_url

class Tool(ABC):
    """Base class cho các tools"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    @abstractmethod
    def execute(self, **kwargs) -> Any:
        """Thực thi tool"""
        pass

class DocumentSearchTool(Tool):
    """Tool tìm kiếm tài liệu trong vector database"""
    
    def __init__(self, vectorstore):
        super().__init__(
            name="document_search",
            description="Tìm kiếm tài liệu liên quan dựa trên câu hỏi"
        )
        self.vectorstore = vectorstore
    
    def execute(self, query: str, k: int = 5) -> List[Document]:
        """Tìm kiếm tài liệu"""
        return vectordb.semantic_search(self.vectorstore, query)

class FileAnalysisTool(Tool):
    """Tool phân tích file được upload"""
    
    def __init__(self):
        super().__init__(
            name="file_analysis",
            description="Phân tích và trích xuất thông tin từ file"
        )
    
    def execute(self, file_urls: List[str]) -> List[Document]:
        """Phân tích file"""
        documents = []
        for url in file_urls:
            try:
                docs = load_document_from_url(url)
                documents.extend(docs)
            except Exception as e:
                print(f"Error analyzing file {url}: {e}")
        return documents

class WebSearchTool(Tool):
    """Tool tìm kiếm thông tin trên web"""
    
    def __init__(self):
        super().__init__(
            name="web_search",
            description="Tìm kiếm thông tin trên internet"
        )
    
    def execute(self, query: str, num_results: int = 5) -> List[Dict]:
        """Tìm kiếm web (mock implementation)"""
        # Trong thực tế, bạn có thể tích hợp với Google Search API, Bing API, etc.
        return [
            {
                "title": f"Search result for: {query}",
                "url": "https://example.com",
                "snippet": f"This is a mock search result for {query}"
            }
        ]

class CalculatorTool(Tool):
    """Tool tính toán đơn giản"""
    
    def __init__(self):
        super().__init__(
            name="calculator",
            description="Thực hiện các phép tính toán cơ bản"
        )
    
    def execute(self, expression: str) -> float:
        """Tính toán biểu thức"""
        try:
            # Chỉ cho phép các phép tính an toàn
            allowed_chars = set('0123456789+-*/.() ')
            if not all(c in allowed_chars for c in expression):
                raise ValueError("Invalid characters in expression")
            
            result = eval(expression)
            return float(result)
        except Exception as e:
            raise ValueError(f"Cannot calculate expression: {e}")

class DataExtractionTool(Tool):
    """Tool trích xuất dữ liệu có cấu trúc"""
    
    def __init__(self):
        super().__init__(
            name="data_extraction",
            description="Trích xuất dữ liệu có cấu trúc từ text"
        )
    
    def execute(self, text: str, data_type: str = "json") -> Dict[str, Any]:
        """Trích xuất dữ liệu"""
        # Mock implementation - trong thực tế có thể dùng regex, NLP, etc.
        extracted_data = {
            "entities": [],
            "dates": [],
            "numbers": [],
            "emails": [],
            "urls": []
        }
        
        # Đây là một implementation đơn giản
        import re
        
        # Trích xuất email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        extracted_data["emails"] = re.findall(email_pattern, text)
        
        # Trích xuất URL
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        extracted_data["urls"] = re.findall(url_pattern, text)
        
        # Trích xuất số
        number_pattern = r'\b\d+(?:\.\d+)?\b'
        extracted_data["numbers"] = [float(x) for x in re.findall(number_pattern, text)]
        
        return extracted_data

class MemoryTool(Tool):
    """Tool quản lý memory của agent"""
    
    def __init__(self, agent_memory):
        super().__init__(
            name="memory",
            description="Quản lý và truy xuất memory của agent"
        )
        self.agent_memory = agent_memory
    
    def execute(self, action: str, key: str = None, value: Any = None, memory_type: str = "working") -> Any:
        """Thao tác với memory"""
        if action == "store":
            if memory_type == "working":
                self.agent_memory.working_memory[key] = value
            elif memory_type == "long_term":
                self.agent_memory.long_term[key] = value
            elif memory_type == "short_term":
                self.agent_memory.short_term.append({key: value})
            return f"Stored {key} in {memory_type} memory"
        
        elif action == "retrieve":
            if memory_type == "working":
                return self.agent_memory.working_memory.get(key)
            elif memory_type == "long_term":
                return self.agent_memory.long_term.get(key)
            elif memory_type == "short_term":
                for item in reversed(self.agent_memory.short_term):
                    if key in item:
                        return item[key]
            return None
        
        elif action == "list":
            if memory_type == "working":
                return list(self.agent_memory.working_memory.keys())
            elif memory_type == "long_term":
                return list(self.agent_memory.long_term.keys())
            elif memory_type == "short_term":
                return [list(item.keys())[0] for item in self.agent_memory.short_term]
        
        return None

def create_default_tools(vectorstore, agent_memory) -> List[Tool]:
    """Tạo bộ tools mặc định cho agents"""
    return [
        DocumentSearchTool(vectorstore),
        FileAnalysisTool(),
        WebSearchTool(),
        CalculatorTool(),
        DataExtractionTool(),
        MemoryTool(agent_memory)
    ]
