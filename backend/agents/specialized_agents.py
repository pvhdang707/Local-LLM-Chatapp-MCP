"""
Specialized Agents - Các agent chuyên biệt
"""

import uuid
import json
from typing import List, Dict, Any
from langchain_core.messages import HumanMessage, SystemMessage

from .base_agent import BaseAgent, Task, TaskStatus, AgentRole
from .tools import Tool

class PlannerAgent(BaseAgent):
    """Agent lập kế hoạch - phân tích yêu cầu và tạo kế hoạch thực hiện"""
    
    def __init__(self, llm, tools: List[Tool] = None):
        super().__init__("Planner", AgentRole.PLANNER, llm, tools)
        self.capabilities = ["task_decomposition", "planning", "strategy"]
    
    def plan(self, objective: str) -> List[Task]:
        """Lập kế hoạch chi tiết để đạt được mục tiêu"""
        planning_prompt = f"""
        Bạn là một AI Agent chuyên về lập kế hoạch. Hãy phân tích mục tiêu sau và tạo ra một kế hoạch chi tiết:
        
        Mục tiêu: {objective}
        
        Hãy chia nhỏ mục tiêu thành các task cụ thể và xác định:
        1. Loại agent nào phù hợp cho từng task (researcher, analyst, summarizer)
        2. Độ ưu tiên của từng task (1-5, với 5 là cao nhất)
        3. Thứ tự thực hiện và dependencies
        
        Trả về dưới dạng JSON với format:
        {{
            "tasks": [
                {{
                    "description": "Mô tả task",
                    "agent_role": "researcher|analyst|summarizer",
                    "priority": 1-5,
                    "dependencies": []
                }}
            ]
        }}
        """
        
        messages = [
            SystemMessage(content="Bạn là một AI Planner Agent chuyên nghiệp."),
            HumanMessage(content=planning_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        try:
            plan_data = json.loads(response.content)
            tasks = []
            
            for i, task_data in enumerate(plan_data.get("tasks", [])):
                task = Task(
                    id=f"task_{uuid.uuid4().hex[:8]}",
                    description=task_data["description"],
                    agent_role=AgentRole(task_data["agent_role"]),
                    priority=task_data.get("priority", 1),
                    dependencies=task_data.get("dependencies", [])
                )
                tasks.append(task)
            
            return tasks
        except (json.JSONDecodeError, KeyError) as e:
            # Fallback nếu LLM không trả về JSON đúng format
            return [Task(
                id=f"task_{uuid.uuid4().hex[:8]}",
                description=objective,
                agent_role=AgentRole.RESEARCHER,
                priority=3
            )]
    
    async def execute_task(self, task: Task) -> Any:
        """Thực hiện task lập kế hoạch"""
        task.status = TaskStatus.IN_PROGRESS
        
        try:
            sub_tasks = self.plan(task.description)
            task.result = {
                "plan": [
                    {
                        "id": t.id,
                        "description": t.description,
                        "agent_role": t.agent_role.value,
                        "priority": t.priority
                    } for t in sub_tasks
                ],
                "total_tasks": len(sub_tasks)
            }
            task.status = TaskStatus.COMPLETED
            return task.result
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.result = {"error": str(e)}
            return task.result

class ResearcherAgent(BaseAgent):
    """Agent nghiên cứu - tìm kiếm và thu thập thông tin"""
    
    def __init__(self, llm, tools: List[Tool] = None):
        super().__init__("Researcher", AgentRole.RESEARCHER, llm, tools)
        self.capabilities = ["information_gathering", "document_search", "web_search"]
    
    def plan(self, objective: str) -> List[Task]:
        """Lập kế hoạch nghiên cứu"""
        return [Task(
            id=f"research_{uuid.uuid4().hex[:8]}",
            description=f"Nghiên cứu thông tin về: {objective}",
            agent_role=AgentRole.RESEARCHER
        )]
    
    async def execute_task(self, task: Task) -> Any:
        """Thực hiện task nghiên cứu"""
        task.status = TaskStatus.IN_PROGRESS
        
        try:
            query = task.context.get("query", task.description)
            file_urls = task.context.get("file_urls", [])
            
            # Thu thập thông tin từ nhiều nguồn
            research_results = {
                "documents": [],
                "file_documents": [],
                "web_results": [],
                "summary": ""
            }
            
            # Tìm kiếm trong vector database
            if self.use_tool_safe("document_search"):
                documents = self.use_tool("document_search", query=query)
                research_results["documents"] = [doc.page_content for doc in documents]
            
            # Phân tích file nếu có
            if file_urls and self.use_tool_safe("file_analysis"):
                file_docs = self.use_tool("file_analysis", file_urls=file_urls)
                research_results["file_documents"] = [doc.page_content for doc in file_docs]
            
            # Tìm kiếm web nếu cần
            if self.use_tool_safe("web_search"):
                web_results = self.use_tool("web_search", query=query)
                research_results["web_results"] = web_results
            
            # Tạo tóm tắt nghiên cứu
            research_prompt = f"""
            Dựa trên thông tin đã thu thập, hãy tạo một báo cáo nghiên cứu ngắn gọn về: {query}
            
            Thông tin từ tài liệu: {research_results["documents"]}
            Thông tin từ file: {research_results["file_documents"]}
            Thông tin từ web: {research_results["web_results"]}
            
            Hãy tổng hợp và trình bày thông tin một cách logic, chính xác.
            """
            
            messages = [
                SystemMessage(content="Bạn là một AI Researcher chuyên nghiệp."),
                HumanMessage(content=research_prompt)
            ]
            
            response = self.llm.invoke(messages)
            research_results["summary"] = response.content
            
            task.result = research_results
            task.status = TaskStatus.COMPLETED
            return task.result
            
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.result = {"error": str(e)}
            return task.result
    
    def use_tool_safe(self, tool_name: str) -> bool:
        """Kiểm tra xem tool có khả dụng không"""
        return any(tool.name == tool_name for tool in self.tools)

class AnalystAgent(BaseAgent):
    """Agent phân tích - phân tích dữ liệu và rút ra insights"""
    
    def __init__(self, llm, tools: List[Tool] = None):
        super().__init__("Analyst", AgentRole.ANALYST, llm, tools)
        self.capabilities = ["data_analysis", "pattern_recognition", "insight_generation"]
    
    def plan(self, objective: str) -> List[Task]:
        """Lập kế hoạch phân tích"""
        return [Task(
            id=f"analysis_{uuid.uuid4().hex[:8]}",
            description=f"Phân tích dữ liệu về: {objective}",
            agent_role=AgentRole.ANALYST
        )]
    
    async def execute_task(self, task: Task) -> Any:
        """Thực hiện task phân tích"""
        task.status = TaskStatus.IN_PROGRESS
        
        try:
            data = task.context.get("data", "")
            analysis_type = task.context.get("analysis_type", "general")
            
            analysis_prompt = f"""
            Bạn là một AI Analyst chuyên nghiệp. Hãy phân tích dữ liệu sau:
            
            Dữ liệu: {data}
            Loại phân tích: {analysis_type}
            
            Hãy:
            1. Xác định các pattern và xu hướng quan trọng
            2. Rút ra các insights có giá trị
            3. Đưa ra các recommend actions nếu có thể
            4. Đánh giá độ tin cậy của phân tích
            
            Trình bày kết quả một cách có cấu trúc và dễ hiểu.
            """
            
            messages = [
                SystemMessage(content="Bạn là một AI Analyst với khả năng phân tích dữ liệu xuất sắc."),
                HumanMessage(content=analysis_prompt)
            ]
            
            response = self.llm.invoke(messages)
            
            # Trích xuất dữ liệu có cấu trúc nếu có tool
            structured_data = {}
            if self.use_tool_safe("data_extraction"):
                structured_data = self.use_tool("data_extraction", text=response.content)
            
            analysis_result = {
                "analysis": response.content,
                "structured_data": structured_data,
                "confidence_score": 0.8  # Mock confidence score
            }
            
            task.result = analysis_result
            task.status = TaskStatus.COMPLETED
            return task.result
            
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.result = {"error": str(e)}
            return task.result
    
    def use_tool_safe(self, tool_name: str) -> bool:
        """Kiểm tra xem tool có khả dụng không"""
        return any(tool.name == tool_name for tool in self.tools)

class SummarizerAgent(BaseAgent):
    """Agent tóm tắt - tổng hợp và tạo ra câu trả lời cuối cùng"""
    
    def __init__(self, llm, tools: List[Tool] = None):
        super().__init__("Summarizer", AgentRole.SUMMARIZER, llm, tools)
        self.capabilities = ["summarization", "synthesis", "final_answer_generation"]
    
    def plan(self, objective: str) -> List[Task]:
        """Lập kế hoạch tóm tắt"""
        return [Task(
            id=f"summary_{uuid.uuid4().hex[:8]}",
            description=f"Tóm tắt và tổng hợp thông tin về: {objective}",
            agent_role=AgentRole.SUMMARIZER
        )]
    
    async def execute_task(self, task: Task) -> Any:
        """Thực hiện task tóm tắt"""
        task.status = TaskStatus.IN_PROGRESS
        
        try:
            research_data = task.context.get("research_data", {})
            analysis_data = task.context.get("analysis_data", {})
            original_question = task.context.get("original_question", "")
            chat_context = task.context.get("chat_context", "")
            
            summary_prompt = f"""
            Bạn là một AI Summarizer chuyên nghiệp. Hãy tổng hợp tất cả thông tin để trả lời câu hỏi:
            
            Câu hỏi gốc: {original_question}
            
            Thông tin nghiên cứu: {research_data}
            Kết quả phân tích: {analysis_data}
            Ngữ cảnh cuộc trò chuyện: {chat_context}
            
            Hãy tạo ra một câu trả lời:
            1. Ngắn gọn và chính xác
            2. Dựa trên thông tin đã thu thập
            3. Phù hợp với ngữ cảnh cuộc trò chuyện
            4. Dễ hiểu và hữu ích cho người dùng
            
            Nếu không có đủ thông tin, hãy nêu rõ những hạn chế.
            """
            
            messages = [
                SystemMessage(content="Bạn là một AI Summarizer với khả năng tổng hợp thông tin xuất sắc."),
                HumanMessage(content=summary_prompt)
            ]
            
            response = self.llm.invoke(messages)
            
            summary_result = {
                "final_answer": response.content,
                "sources_used": {
                    "research": bool(research_data),
                    "analysis": bool(analysis_data),
                    "chat_context": bool(chat_context)
                },
                "confidence": 0.85  # Mock confidence score
            }
            
            task.result = summary_result
            task.status = TaskStatus.COMPLETED
            return task.result
            
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.result = {"error": str(e)}
            return task.result
