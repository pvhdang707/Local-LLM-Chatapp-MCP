"""
AI Agentic System - Base Agent Class
Cung cấp framework cơ bản cho các AI Agent
"""

import json
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

class AgentRole(Enum):
    PLANNER = "planner"
    RESEARCHER = "researcher"
    ANALYST = "analyst"
    SUMMARIZER = "summarizer"
    COORDINATOR = "coordinator"
    CRITIC = "critic"

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class Task:
    id: str
    description: str
    agent_role: AgentRole
    status: TaskStatus = TaskStatus.PENDING
    priority: int = 1
    context: Dict[str, Any] = None
    result: Any = None
    dependencies: List[str] = None
    
    def __post_init__(self):
        if self.context is None:
            self.context = {}
        if self.dependencies is None:
            self.dependencies = []

@dataclass
class AgentMemory:
    short_term: List[Dict[str, Any]]
    long_term: Dict[str, Any]
    working_memory: Dict[str, Any]
    
    def __post_init__(self):
        if not self.short_term:
            self.short_term = []
        if not self.long_term:
            self.long_term = {}
        if not self.working_memory:
            self.working_memory = {}

class BaseAgent(ABC):
    """Base class cho tất cả AI Agents"""
    
    def __init__(self, name: str, role: AgentRole, llm, tools: List = None):
        self.name = name
        self.role = role
        self.llm = llm
        self.tools = tools or []
        self.memory = AgentMemory([], {}, {})
        self.capabilities = []
        
    @abstractmethod
    async def execute_task(self, task: Task) -> Any:
        """Thực hiện một task cụ thể"""
        pass
    
    @abstractmethod
    def plan(self, objective: str) -> List[Task]:
        """Lập kế hoạch để đạt được mục tiêu"""
        pass
    
    def remember(self, key: str, value: Any, memory_type: str = "working"):
        """Lưu trữ thông tin vào memory"""
        if memory_type == "working":
            self.memory.working_memory[key] = value
        elif memory_type == "long_term":
            self.memory.long_term[key] = value
        elif memory_type == "short_term":
            self.memory.short_term.append({key: value})
    
    def recall(self, key: str, memory_type: str = "working") -> Any:
        """Truy xuất thông tin từ memory"""
        if memory_type == "working":
            return self.memory.working_memory.get(key)
        elif memory_type == "long_term":
            return self.memory.long_term.get(key)
        elif memory_type == "short_term":
            for item in reversed(self.memory.short_term):
                if key in item:
                    return item[key]
        return None
    
    def reflect(self, task: Task, result: Any) -> Dict[str, Any]:
        """Phản ánh và đánh giá kết quả task"""
        reflection = {
            "task_id": task.id,
            "success": task.status == TaskStatus.COMPLETED,
            "lessons_learned": [],
            "improvements": [],
            "confidence_score": 0.0
        }
        
        # Lưu vào long-term memory để học hỏi
        self.remember(f"reflection_{task.id}", reflection, "long_term")
        return reflection
    
    def use_tool(self, tool_name: str, **kwargs) -> Any:
        """Sử dụng tool để thực hiện task"""
        for tool in self.tools:
            if tool.name == tool_name:
                return tool.execute(**kwargs)
        raise ValueError(f"Tool {tool_name} not found")
