import uuid
from typing import TypedDict, List
from datetime import datetime

from langchain.schema import Document
from langchain_ollama import ChatOllama
from langgraph.graph import END, StateGraph
from langchain_core.messages import HumanMessage, SystemMessage

import src.vectordb as vectordb
from src.config import OllamaConfig
from src.file_utils.file_loader import load_document_from_url


class RagDataContext(TypedDict):
    question: str
    generation: str
    documents: List[Document]
    steps: List[str]
    file_urls: List[str]
    file_documents: List[Document]
    chat_context: str

class LLMManager:
    """Manager class for LLM operations"""
    
    def __init__(self):
        self.llm = create_llm(model=OllamaConfig.RagModel)
    
    def generate_response(self, prompt: str) -> str:
        """Generate a response using the LLM"""
        try:
            messages = [HumanMessage(content=prompt)]
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"Lỗi tạo phản hồi: {str(e)}"

def create_llm(model="mistral", temperature=0, format=''):
    return ChatOllama(
        model=model,
        temperature=temperature,
        format=format,
        base_url=OllamaConfig.Host,
    )

vectorstore = vectordb.init_vector_store()
llm = create_llm(model=OllamaConfig.RagModel)
llm_manager = LLMManager()

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

    system_content = "You are an assistant for question-answering tasks. When asked about finding files or documents, be specific about what files contain the requested information."
    if chat_context:
        system_content += f"\n\nPrevious conversation context:\n{chat_context}\n\nPlease consider this context when answering the current question."

    # Tạo danh sách file sources để LLM biết file nào chứa thông tin
    file_sources = []
    for doc in ctx["documents"] + file_documents:
        if hasattr(doc, 'metadata') and doc.metadata:
            file_name = doc.metadata.get('file_name', '')
            source = doc.metadata.get('source', '')
            if file_name:
                file_sources.append(file_name)
            elif source and source != "chat-history":
                file_sources.append(source)
    
    file_info = ""
    if file_sources:
        file_info = f"\nFiles containing relevant information: {', '.join(set(file_sources))}"

    messages = [
        SystemMessage(content=system_content),
        HumanMessage(
            content=f"""Use the following documents to answer the question concisely (max 3 sentences). 
                Question: {ctx['question']} 
                FileUserDocument: {file_content}
                RelatedDocuments: {docs_content}{file_info}
                
                If the question asks about finding files and you find relevant information, mention the specific files that contain that information.
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

def get_current_timestamp():
    """Lấy timestamp hiện tại"""
    return datetime.utcnow().isoformat()

def process_message(message: str) -> str:
    """Xử lý message với LLM"""
    try:
        config = {"configurable": {"thread_id": str(uuid.uuid4())}}
        initial_state = {
            "question": message,
            "generation": "",
            "documents": [],
            "steps": [],
            "file_urls": [],
            "file_documents": [],
            "chat_context": ""
        }
        result = workflow.invoke(initial_state, config)
        return result.get("generation", "Xin lỗi, tôi không thể trả lời câu hỏi này.")
    except Exception as e:
        return f"Lỗi xử lý message: {str(e)}"

if __name__ == "__main__":
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}
    initial_state = {
        "question": "Capital of Vietnam?",
        "steps": []
    }
    state_dict = workflow.invoke(initial_state, config)
    print(state_dict["generation"])