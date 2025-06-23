import uuid
from typing import TypedDict, List

from langchain.schema import Document
from langchain_ollama import ChatOllama
from langgraph.graph import END, StateGraph
from langchain_core.messages import HumanMessage, SystemMessage

import vectordb
from config import OllamaConfig
from file_loader import load_document_from_url


class RagDataContext(TypedDict):
    question: str
    generation: str
    documents: List[Document]
    steps: List[str]
    file_urls: List[str]
    file_documents: List[Document]

def create_llm(model="mistral", temperature=0, format=''):
    return ChatOllama(
        model=model,
        temperature=temperature,
        format=format,
        base_url=OllamaConfig.Host,
    )

vectorstore = vectordb.init_vector_store()
llm = create_llm(model=OllamaConfig.RagModel)

def load_file_document(ctx: RagDataContext) -> RagDataContext:
    urls = ctx.get('file_urls',[])
    if len(urls) == 0:
        return ctx
    documents = []
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
    file_content = "\n".join(doc.page_content for doc in ctx["file_documents"])

    messages = [
        SystemMessage(content="You are an assistant for question-answering tasks."),
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
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}
    initial_state = {
        "question": "Capital of Vietnam?",
        "steps": []
    }
    state_dict = workflow.invoke(initial_state, config)
    print(state_dict["generation"])