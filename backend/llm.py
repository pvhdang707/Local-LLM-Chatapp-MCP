import uuid
import asyncio
from typing import TypedDict, List, Dict, Any, Optional

from langchain.schema import Document
from langchain_ollama import ChatOllama
from langgraph.graph import END, StateGraph
from langchain_core.messages import HumanMessage, SystemMessage

import vectordb
from config import OllamaConfig
from file_utils.file_loader import load_document_from_url

# Import AI Agentic system
from agents.coordinator import MultiAgentCoordinator, CoordinationStrategy


class RagDataContext(TypedDict):
    question: str
    generation: str
    documents: List[Document]
    steps: List[str]
    file_urls: List[str]
    file_documents: List[Document]
    chat_context: str

class AgenticDataContext(TypedDict):
    """Context cho AI Agentic system"""
    question: str
    generation: str
    file_urls: List[str]
    chat_context: str
    strategy: str
    agent_results: Dict[str, Any]
    confidence_score: float
    execution_trace: Dict[str, Any]

def create_llm(model="mistral", temperature=0, format=''):
    return ChatOllama(
        model=model,
        temperature=temperature,
        format=format,
        base_url=OllamaConfig.Host,
    )

vectorstore = vectordb.init_vector_store()
llm = create_llm(model=OllamaConfig.RagModel)

# Khởi tạo AI Agentic Coordinator
agentic_coordinator = MultiAgentCoordinator(llm, vectorstore)

def load_file_document(ctx: RagDataContext) -> RagDataContext:
    urls = ctx.get('file_urls',[])
    documents = []
    if len(urls) > 0:
        for url in urls:
            try:
                documents.extend(load_document_from_url(url))
            except Exception as e:
                print(f"Error loading file from {url}: {e}")
    ctx["file_documents"] = documents
    ctx["steps"].append("load_file_documents")
    return ctx

def retrieve(ctx: RagDataContext) -> RagDataContext:
    question = ctx["question"]
    base_documents = vectordb.semantic_search(vectorstore, question)
    ctx["documents"] = base_documents
    ctx["steps"].append("retrieve_documents")
    return ctx

def generate(ctx: RagDataContext) -> RagDataContext:
    docs_content = "\n".join(doc.page_content for doc in ctx["documents"])
    file_documents = ctx.get("file_documents", [])
    file_content = "\n".join(doc.page_content for doc in file_documents) if file_documents else ""
    
    chat_context = ctx.get("chat_context", "")

    system_content = "You are an assistant for question-answering tasks."
    if chat_context:
        system_content += f"\n\nPrevious conversation context:\n{chat_context}\n\nPlease consider this context when answering the current question."

    messages = [
        SystemMessage(content=system_content),
        HumanMessage(
            content=f"""Use the following documents to answer the question concisely (max 3 sentences). 
                Question: {ctx['question']} 
                FileUserDocument: {file_content}
                RelatedDocuments: {docs_content}
            """
        )
    ]

    response = llm.invoke(messages)
    ctx["generation"] = response.content
    ctx["steps"].append("generate_answer")
    return ctx

def store_answer(ctx: RagDataContext) -> RagDataContext:
    question = ctx["question"]
    answer = ctx["generation"]
    content = f"Q: {question}\nA: {answer}"
    metadata = {"source": "chat-history", "type": "Q&A"}
    vectordb.add_document(vectorstore, content, metadata)
    ctx["steps"].append("store_answer")
    return ctx

# LangGraph setup
def add_nodes(workflow: StateGraph):
    workflow.add_node("file", load_file_document)
    workflow.add_node("retrieve", retrieve)
    workflow.add_node("generate", generate)
    workflow.add_node("store", store_answer)

def build_graph(workflow: StateGraph):
    workflow.set_entry_point("file")
    workflow.add_edge("file", "retrieve")
    workflow.add_edge("retrieve", "generate")
    workflow.add_edge("generate", "store")
    workflow.add_edge("store", END)

def create_workflow() -> StateGraph:
    workflow = StateGraph(RagDataContext)
    add_nodes(workflow=workflow)
    build_graph(workflow=workflow)
    return workflow.compile()

workflow = create_workflow()
if __name__ == "__main__":
    import asyncio
    
    async def test_systems():
        """Test cả hai hệ thống"""
        print("=== Testing Traditional RAG ===")
        config = {"configurable": {"thread_id": str(uuid.uuid4())}}
        initial_state = {
            "question": "Capital of Vietnam?",
            "steps": []
        }
        state_dict = workflow.invoke(initial_state, config)
        print("RAG Answer:", state_dict["generation"])
        
        print("\n=== Testing Enhanced RAG ===")
        result = await smart_answer_question(
            "What is the capital of Vietnam?",
            use_agentic=False
        )
        print("Enhanced RAG Answer:", result["answer"])
        print("Method:", result["method"])
        
        print("\n=== Testing Pure Agentic System ===")
        result = await smart_answer_question(
            "Analyze and compare the economic development strategies of Vietnam",
            use_agentic=True,
            strategy="adaptive"
        )
        print("Agentic Answer:", result["answer"])
        print("Method:", result["method"])
        print("Confidence:", result["confidence"])
        
        print("\n=== System Info ===")
        info = get_system_info()
        print("Available Systems:", info["available_systems"])
        print("Agent Status:", info["agents"])
    
    # Chạy test
    asyncio.run(test_systems())

# ============ AI AGENTIC SYSTEM FUNCTIONS ============

async def agentic_solve_problem(
    question: str,
    file_urls: List[str] = None,
    chat_context: str = "",
    strategy: str = "adaptive"
) -> Dict[str, Any]:
    """
    Sử dụng AI Agentic system để giải quyết vấn đề phức tạp
    
    Args:
        question: Câu hỏi cần giải quyết
        file_urls: Danh sách URL file để phân tích
        chat_context: Ngữ cảnh cuộc trò chuyện
        strategy: Chiến lược điều phối (sequential, parallel, adaptive)
    
    Returns:
        Dict chứa câu trả lời và metadata
    """
    try:
        # Chuyển đổi strategy string sang enum
        strategy_map = {
            "sequential": CoordinationStrategy.SEQUENTIAL,
            "parallel": CoordinationStrategy.PARALLEL,
            "adaptive": CoordinationStrategy.ADAPTIVE
        }
        coordination_strategy = strategy_map.get(strategy, CoordinationStrategy.ADAPTIVE)
        
        # Sử dụng coordinator để giải quyết vấn đề
        result = await agentic_coordinator.solve_problem(
            question=question,
            file_urls=file_urls or [],
            chat_context=chat_context,
            strategy=coordination_strategy
        )
        
        return result
    except Exception as e:
        return {
            "error": f"Agentic system error: {str(e)}",
            "answer": "Xin lỗi, hệ thống AI Agentic gặp lỗi. Sẽ chuyển sang chế độ RAG thông thường.",
            "confidence": 0.0
        }

def agentic_process_context(ctx: AgenticDataContext) -> AgenticDataContext:
    """
    Xử lý context cho AI Agentic system
    """
    question = ctx["question"]
    file_urls = ctx.get("file_urls", [])
    chat_context = ctx.get("chat_context", "")
    strategy = ctx.get("strategy", "adaptive")
    
    try:
        # Chạy agentic system bất đồng bộ
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        result = loop.run_until_complete(
            agentic_solve_problem(question, file_urls, chat_context, strategy)
        )
        
        loop.close()
        
        # Cập nhật context
        ctx["generation"] = result.get("answer", "")
        ctx["agent_results"] = result
        ctx["confidence_score"] = result.get("confidence", 0.0)
        ctx["execution_trace"] = result.get("execution_trace", {})
        
        return ctx
    except Exception as e:
        # Fallback về RAG system nếu agentic system lỗi
        ctx["generation"] = f"Agentic system error: {str(e)}. Falling back to RAG."
        ctx["agent_results"] = {"error": str(e)}
        ctx["confidence_score"] = 0.0
        return ctx

def get_agent_status() -> Dict[str, Any]:
    """Lấy trạng thái của các AI Agents"""
    return agentic_coordinator.get_agent_status()

def clear_agent_memories():
    """Xóa memory của tất cả agents"""
    agentic_coordinator.clear_agent_memories()

def should_use_agentic_system(question: str, file_urls: List[str] = None) -> bool:
    """
    Quyết định có nên sử dụng AI Agentic system hay không
    
    Sử dụng agentic system khi:
    - Câu hỏi phức tạp (có từ khóa như "phân tích", "so sánh", "kế hoạch")
    - Có nhiều file cần phân tích
    - Câu hỏi yêu cầu reasoning phức tạp
    """
    complex_keywords = [
        "phân tích", "so sánh", "đánh giá", "kế hoạch", "chiến lược",
        "analyze", "compare", "evaluate", "plan", "strategy", 
        "tại sao", "như thế nào", "why", "how", "explain"
    ]
    
    # Kiểm tra từ khóa phức tạp
    question_lower = question.lower()
    has_complex_keywords = any(keyword in question_lower for keyword in complex_keywords)
    
    # Kiểm tra số lượng file
    has_multiple_files = file_urls and len(file_urls) > 1
    
    # Kiểm tra độ dài câu hỏi (câu hỏi dài thường phức tạp hơn)
    is_long_question = len(question.split()) > 10
    
    return has_complex_keywords or has_multiple_files or is_long_question

# ============ ENHANCED WORKFLOW FUNCTIONS ============

def enhanced_generate(ctx: RagDataContext) -> RagDataContext:
    """
    Enhanced generation function sử dụng AI Agentic system khi cần thiết
    """
    question = ctx["question"]
    file_urls = ctx.get("file_urls", [])
    chat_context = ctx.get("chat_context", "")
    
    # Quyết định sử dụng system nào
    if should_use_agentic_system(question, file_urls):
        # Sử dụng AI Agentic system
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            result = loop.run_until_complete(
                agentic_solve_problem(question, file_urls, chat_context, "adaptive")
            )
            
            loop.close()
            
            ctx["generation"] = result.get("answer", "")
            ctx["steps"].append("agentic_generation")
            
            # Lưu thêm thông tin về agents
            if "execution_trace" in result:
                ctx["agent_trace"] = result["execution_trace"]
            if "confidence" in result:
                ctx["confidence"] = result["confidence"]
                
        except Exception as e:
            # Fallback về RAG thông thường
            print(f"Agentic system failed, using traditional RAG: {e}")
            ctx = generate(ctx)
    else:
        # Sử dụng RAG system thông thường
        ctx = generate(ctx)
    
    return ctx

def create_enhanced_workflow() -> StateGraph:
    """Tạo workflow nâng cao với AI Agentic integration"""
    workflow = StateGraph(RagDataContext)
    
    # Thêm nodes
    workflow.add_node("file", load_file_document)
    workflow.add_node("retrieve", retrieve)
    workflow.add_node("enhanced_generate", enhanced_generate)  # Sử dụng enhanced generation
    workflow.add_node("store", store_answer)
    
    # Thiết lập graph
    workflow.set_entry_point("file")
    workflow.add_edge("file", "retrieve")
    workflow.add_edge("retrieve", "enhanced_generate")
    workflow.add_edge("enhanced_generate", "store")
    workflow.add_edge("store", END)
    
    return workflow.compile()

# Tạo enhanced workflow
enhanced_workflow = create_enhanced_workflow()

# ============ PURE AGENTIC WORKFLOW ============

def agentic_solve(ctx: AgenticDataContext) -> AgenticDataContext:
    """Node để xử lý với pure agentic system"""
    return agentic_process_context(ctx)

def create_agentic_workflow() -> StateGraph:
    """Tạo workflow hoàn toàn sử dụng AI Agentic system"""
    workflow = StateGraph(AgenticDataContext)
    
    # Chỉ có một node chính
    workflow.add_node("agentic_solve", agentic_solve)
    
    # Thiết lập graph đơn giản
    workflow.set_entry_point("agentic_solve")
    workflow.add_edge("agentic_solve", END)
    
    return workflow.compile()

# Tạo pure agentic workflow
pure_agentic_workflow = create_agentic_workflow()

# ============ MAIN INTERFACE FUNCTIONS ============

async def smart_answer_question(
    question: str, 
    file_urls: List[str] = None, 
    chat_context: str = "",
    use_agentic: bool = None,
    strategy: str = "adaptive"
) -> Dict[str, Any]:
    """
    Interface chính để trả lời câu hỏi với AI system thông minh
    
    Args:
        question: Câu hỏi
        file_urls: Danh sách file URLs
        chat_context: Ngữ cảnh chat
        use_agentic: Ép buộc sử dụng agentic (None = auto-decide)
        strategy: Chiến lược cho agentic system
    
    Returns:
        Dict chứa answer và metadata
    """
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}
    
    # Tự động quyết định hoặc theo yêu cầu
    if use_agentic is None:
        use_agentic = should_use_agentic_system(question, file_urls)
    
    try:
        if use_agentic:
            # Sử dụng pure agentic workflow
            initial_state = {
                "question": question,
                "file_urls": file_urls or [],
                "chat_context": chat_context,
                "strategy": strategy,
                "agent_results": {},
                "confidence_score": 0.0,
                "execution_trace": {}
            }
            
            state_dict = pure_agentic_workflow.invoke(initial_state, config)
            
            return {
                "answer": state_dict.get("generation", ""),
                "method": "agentic",
                "confidence": state_dict.get("confidence_score", 0.0),
                "agent_results": state_dict.get("agent_results", {}),
                "execution_trace": state_dict.get("execution_trace", {}),
                "strategy_used": strategy
            }
        else:
            # Sử dụng enhanced RAG workflow
            initial_state = {
                "question": question,
                "steps": [],
                "file_urls": file_urls or [],
                "chat_context": chat_context
            }
            
            state_dict = enhanced_workflow.invoke(initial_state, config)
            
            return {
                "answer": state_dict.get("generation", ""),
                "method": "enhanced_rag",
                "confidence": state_dict.get("confidence", 0.8),
                "steps": state_dict.get("steps", []),
                "agent_trace": state_dict.get("agent_trace", {})
            }
    except Exception as e:
        # Ultimate fallback
        return {
            "answer": f"Xin lỗi, hệ thống gặp lỗi: {str(e)}",
            "method": "error",
            "confidence": 0.0,
            "error": str(e)
        }

def get_system_info() -> Dict[str, Any]:
    """Lấy thông tin về hệ thống AI"""
    return {
        "available_systems": ["traditional_rag", "enhanced_rag", "pure_agentic"],
        "default_strategy": "adaptive",
        "available_strategies": ["sequential", "parallel", "adaptive"],
        "agents": get_agent_status(),
        "models": {
            "rag_model": OllamaConfig.RagModel,
            "embedding_model": OllamaConfig.EmbeddingModel
        }
    }