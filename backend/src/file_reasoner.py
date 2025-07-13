from langchain_ollama import OllamaLLM

llm = OllamaLLM(model="mistral")  # hoặc llama3 nếu bạn setup sẵn

def generate_chain_of_thought(files_found: list, original_prompt: str) -> str:
    if not files_found:
        return "Tôi đã tìm nhưng không phát hiện file nào liên quan đến yêu cầu."
    
    file_list_text = "\n".join([f"- {f['name']} ({f['type']})" for f in files_found])
    reasoning_prompt = f"""
Tôi vừa nhận được yêu cầu: '{original_prompt}'.
Dưới đây là các file đã được tìm thấy:
{file_list_text}

Hãy suy nghĩ từng bước và giải thích quá trình AI thực hiện để tìm và phân loại những file này.
    """

    response = llm(reasoning_prompt)
    return response.strip()
