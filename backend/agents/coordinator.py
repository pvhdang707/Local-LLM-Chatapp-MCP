"""
Multi-Agent Coordinator - Điều phối các agents làm việc cùng nhau
"""

import asyncio
import uuid
from typing import List, Dict, Any, Optional
from enum import Enum

from .base_agent import BaseAgent, Task, TaskStatus, AgentRole
from .specialized_agents import PlannerAgent, ResearcherAgent, AnalystAgent, SummarizerAgent
from .tools import create_default_tools

class CoordinationStrategy(Enum):
    SEQUENTIAL = "sequential"  # Thực hiện tuần tự
    PARALLEL = "parallel"     # Thực hiện song song
    ADAPTIVE = "adaptive"     # Tự động điều chỉnh

class MultiAgentCoordinator:
    """Điều phối viên quản lý và điều phối các AI Agents"""
    
    def __init__(self, llm, vectorstore):
        self.llm = llm
        self.vectorstore = vectorstore
        self.agents = {}
        self.task_queue = []
        self.completed_tasks = {}
        self.coordination_strategy = CoordinationStrategy.ADAPTIVE
        
        # Khởi tạo các agents
        self._initialize_agents()
    
    def _initialize_agents(self):
        """Khởi tạo các specialized agents"""
        # Tạo tools cho các agents
        base_tools = create_default_tools(self.vectorstore, None)
        
        # Khởi tạo các agents
        self.agents[AgentRole.PLANNER] = PlannerAgent(self.llm, base_tools)
        self.agents[AgentRole.RESEARCHER] = ResearcherAgent(self.llm, base_tools)
        self.agents[AgentRole.ANALYST] = AnalystAgent(self.llm, base_tools)
        self.agents[AgentRole.SUMMARIZER] = SummarizerAgent(self.llm, base_tools)
        
        # Cập nhật tools với agent memory
        for agent in self.agents.values():
            for tool in agent.tools:
                if tool.name == "memory":
                    tool.agent_memory = agent.memory
    
    async def solve_problem(
        self, 
        question: str, 
        file_urls: List[str] = None, 
        chat_context: str = "",
        strategy: CoordinationStrategy = None
    ) -> Dict[str, Any]:
        """
        Giải quyết vấn đề bằng cách điều phối các agents
        """
        if strategy:
            self.coordination_strategy = strategy
        
        if file_urls is None:
            file_urls = []
        
        session_id = uuid.uuid4().hex[:8]
        
        try:
            # Bước 1: Planner Agent tạo kế hoạch
            planning_task = Task(
                id=f"plan_{session_id}",
                description=f"Lập kế hoạch để trả lời: {question}",
                agent_role=AgentRole.PLANNER,
                priority=5,
                context={
                    "question": question,
                    "file_urls": file_urls,
                    "chat_context": chat_context
                }
            )
            
            planner = self.agents[AgentRole.PLANNER]
            plan_result = await planner.execute_task(planning_task)
            
            if planning_task.status == TaskStatus.FAILED:
                return {"error": "Planning failed", "details": plan_result}
            
            # Bước 2: Thực hiện kế hoạch
            execution_results = await self._execute_plan(
                plan_result.get("plan", []),
                question,
                file_urls,
                chat_context,
                session_id
            )
            
            # Bước 3: Tổng hợp kết quả cuối cùng
            final_result = await self._synthesize_results(
                execution_results,
                question,
                chat_context,
                session_id
            )
            
            return {
                "answer": final_result.get("final_answer", ""),
                "confidence": final_result.get("confidence", 0.0),
                "sources": final_result.get("sources_used", {}),
                "execution_trace": execution_results,
                "session_id": session_id
            }
            
        except Exception as e:
            return {
                "error": "Coordination failed",
                "details": str(e),
                "session_id": session_id
            }
    
    async def _execute_plan(
        self, 
        plan: List[Dict], 
        question: str, 
        file_urls: List[str], 
        chat_context: str,
        session_id: str
    ) -> Dict[str, Any]:
        """Thực hiện kế hoạch đã được lập"""
        
        execution_results = {
            "research": {},
            "analysis": {},
            "tasks_completed": 0,
            "total_tasks": len(plan)
        }
        
        # Thực hiện các tasks theo strategy
        if self.coordination_strategy == CoordinationStrategy.SEQUENTIAL:
            execution_results = await self._execute_sequential(
                plan, question, file_urls, chat_context, session_id, execution_results
            )
        elif self.coordination_strategy == CoordinationStrategy.PARALLEL:
            execution_results = await self._execute_parallel(
                plan, question, file_urls, chat_context, session_id, execution_results
            )
        else:  # ADAPTIVE
            execution_results = await self._execute_adaptive(
                plan, question, file_urls, chat_context, session_id, execution_results
            )
        
        return execution_results
    
    async def _execute_sequential(
        self, plan, question, file_urls, chat_context, session_id, results
    ):
        """Thực hiện tuần tự"""
        for task_plan in plan:
            agent_role = AgentRole(task_plan["agent_role"])
            agent = self.agents[agent_role]
            
            task = Task(
                id=f"{agent_role.value}_{session_id}",
                description=task_plan["description"],
                agent_role=agent_role,
                priority=task_plan.get("priority", 1),
                context={
                    "query": question,
                    "file_urls": file_urls,
                    "chat_context": chat_context,
                    "previous_results": results
                }
            )
            
            task_result = await agent.execute_task(task)
            
            if agent_role == AgentRole.RESEARCHER:
                results["research"] = task_result
            elif agent_role == AgentRole.ANALYST:
                results["analysis"] = task_result
            
            results["tasks_completed"] += 1
        
        return results
    
    async def _execute_parallel(
        self, plan, question, file_urls, chat_context, session_id, results
    ):
        """Thực hiện song song"""
        tasks = []
        
        for task_plan in plan:
            agent_role = AgentRole(task_plan["agent_role"])
            agent = self.agents[agent_role]
            
            task = Task(
                id=f"{agent_role.value}_{session_id}",
                description=task_plan["description"],
                agent_role=agent_role,
                priority=task_plan.get("priority", 1),
                context={
                    "query": question,
                    "file_urls": file_urls,
                    "chat_context": chat_context
                }
            )
            
            # Chỉ thực hiện parallel cho research và analysis
            if agent_role in [AgentRole.RESEARCHER, AgentRole.ANALYST]:
                tasks.append(agent.execute_task(task))
        
        if tasks:
            task_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Xử lý kết quả
            for i, result in enumerate(task_results):
                if not isinstance(result, Exception):
                    task_plan = plan[i]
                    agent_role = AgentRole(task_plan["agent_role"])
                    
                    if agent_role == AgentRole.RESEARCHER:
                        results["research"] = result
                    elif agent_role == AgentRole.ANALYST:
                        results["analysis"] = result
                    
                    results["tasks_completed"] += 1
        
        return results
    
    async def _execute_adaptive(
        self, plan, question, file_urls, chat_context, session_id, results
    ):
        """Thực hiện adaptive - tự động điều chỉnh"""
        # Với adaptive, ta ưu tiên research trước, sau đó analysis dựa trên kết quả research
        
        # 1. Thực hiện research tasks trước
        research_tasks = [p for p in plan if p["agent_role"] == "researcher"]
        for task_plan in research_tasks:
            agent = self.agents[AgentRole.RESEARCHER]
            task = Task(
                id=f"research_{session_id}",
                description=task_plan["description"],
                agent_role=AgentRole.RESEARCHER,
                context={
                    "query": question,
                    "file_urls": file_urls,
                    "chat_context": chat_context
                }
            )
            
            task_result = await agent.execute_task(task)
            results["research"] = task_result
            results["tasks_completed"] += 1
        
        # 2. Thực hiện analysis dựa trên research results
        analysis_tasks = [p for p in plan if p["agent_role"] == "analyst"]
        for task_plan in analysis_tasks:
            agent = self.agents[AgentRole.ANALYST]
            task = Task(
                id=f"analysis_{session_id}",
                description=task_plan["description"],
                agent_role=AgentRole.ANALYST,
                context={
                    "data": results.get("research", {}),
                    "analysis_type": "comprehensive",
                    "original_question": question
                }
            )
            
            task_result = await agent.execute_task(task)
            results["analysis"] = task_result
            results["tasks_completed"] += 1
        
        return results
    
    async def _synthesize_results(
        self, 
        execution_results: Dict, 
        question: str, 
        chat_context: str,
        session_id: str
    ) -> Dict[str, Any]:
        """Tổng hợp kết quả cuối cùng"""
        
        summarizer = self.agents[AgentRole.SUMMARIZER]
        
        synthesis_task = Task(
            id=f"synthesis_{session_id}",
            description=f"Tổng hợp kết quả để trả lời: {question}",
            agent_role=AgentRole.SUMMARIZER,
            context={
                "research_data": execution_results.get("research", {}),
                "analysis_data": execution_results.get("analysis", {}),
                "original_question": question,
                "chat_context": chat_context
            }
        )
        
        synthesis_result = await summarizer.execute_task(synthesis_task)
        
        return synthesis_result if synthesis_result else {
            "final_answer": "Không thể tổng hợp được kết quả.",
            "confidence": 0.0,
            "sources_used": {}
        }
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Lấy trạng thái của các agents"""
        status = {}
        for role, agent in self.agents.items():
            status[role.value] = {
                "name": agent.name,
                "capabilities": agent.capabilities,
                "memory_items": {
                    "working": len(agent.memory.working_memory),
                    "long_term": len(agent.memory.long_term),
                    "short_term": len(agent.memory.short_term)
                }
            }
        return status
    
    def clear_agent_memories(self):
        """Xóa memory của tất cả agents"""
        for agent in self.agents.values():
            agent.memory.working_memory.clear()
            agent.memory.short_term.clear()
            agent.memory.long_term.clear()
