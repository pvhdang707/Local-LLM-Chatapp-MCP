import traceback
import uuid
from config import ServerConfig
from flask import Flask, request, jsonify
from file import upload_file
from llm import workflow


app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        msg = data.get('msg', '').strip()
        urls = data.get('urls', [])

        config = {"configurable": {"thread_id": str(uuid.uuid4())}}
        initial_state = {
            "question": msg,
            "file_urls": urls,
            "file_documents": [],
            "steps": [],
        }

        state_dict = workflow.invoke(initial_state, config)
        return jsonify({
            "answer": state_dict.get("generation", ""),
            "steps": state_dict.get("steps", []),
        })

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        result = upload_file(file)
        return jsonify({
            'message': 'Upload successful',
            **result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host=ServerConfig.Host, port=ServerConfig.Port)