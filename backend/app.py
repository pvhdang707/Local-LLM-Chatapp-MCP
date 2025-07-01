import os
from flask import Flask
from flask_cors import CORS
from flasgger import Swagger

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import all blueprints from controllers
from src.controllers import all_blueprints

# Add FAISS path logging for debugging
from src.config import FaissConfig
print("=== APP STARTUP - FAISS PATHS ===")
FaissConfig.print_paths()
print("=== END FAISS PATHS ===")

app = Flask(__name__)
CORS(app)  # Cho phép CORS
swagger = Swagger(app)

# Register all blueprints with /api prefix
for blueprint in all_blueprints:
    app.register_blueprint(blueprint, url_prefix='/api')

# Main application entry point
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Starting Local LLM Chat App on port {port}")
    print("Available endpoints:")
    print("- /api/auth/* - Authentication endpoints")
    print("- /api/chat/* - Chat session endpoints")
    print("- /api/admin/* - Admin management endpoints")
    print("- /api/file/* - File management endpoints")
    print("- /api/search/* - File search endpoints")
    print("- /api/system/* - System status endpoints")
    print("- /api/enhanced_chat/* - Enhanced chat endpoints")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 