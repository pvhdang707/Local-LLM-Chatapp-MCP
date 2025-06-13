import requests
import logging
import json

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/generate"
    
    async def get_mistral_response(self, message: str) -> str:
        try:
            logger.info(f"Processing message: {message}")
            
            # Prepare request to Ollama
            ollama_request = {
                "model": "mistral",
                "prompt": message,
                "stream": False
            }
            logger.info(f"Sending request to Ollama: {json.dumps(ollama_request, ensure_ascii=False)}")
            
            # Send request to Ollama
            response = requests.post(
                self.ollama_url,
                json=ollama_request
            )
            
            if response.status_code != 200:
                error_msg = f"Error from local Mistral model. Status code: {response.status_code}, Response: {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)
            
            # Process response
            response_data = response.json()
            logger.info(f"Received response from Ollama: {json.dumps(response_data, ensure_ascii=False)}")
            
            response_content = response_data.get("response", "")
            if not response_content:
                logger.warning("Empty response received from Ollama")
                raise Exception("Empty response from Mistral model")
                
            return response_content
            
        except requests.exceptions.ConnectionError as e:
            error_msg = f"Could not connect to Ollama server. Make sure Ollama is running. Error: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg) 