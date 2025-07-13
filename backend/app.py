import os
from flask import Flask
from flask_cors import CORS
from flasgger import Swagger, swag_from

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

# Cấu hình Swagger chi tiết
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec_1',
            "route": '/apispec_1.json',
            "rule_filter": lambda rule: True,  # all in
            "model_filter": lambda tag: True,  # all in
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs/"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Local LLM Chat App API",
        "description": "API documentation cho ứng dụng chat với LLM và quản lý file",
        "version": "1.0.0",
        "contact": {
            "name": "API Support",
            "email": "support@example.com"
        }
    },
    "host": "localhost:5000",
    "basePath": "/api",
    "schemes": [
        "http",
        "https"
    ],
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
        }
    },
    "security": [
        {
            "Bearer": []
        }
    ],
    "tags": [
        {
            "name": "Auth",
            "description": "Authentication endpoints"
        },
        {
            "name": "Chat", 
            "description": "Chat session management"
        },
        {
            "name": "Admin",
            "description": "Admin management endpoints"
        },
        {
            "name": "File",
            "description": "File management and upload"
        },
        {
            "name": "Search",
            "description": "File search functionality"
        },
        {
            "name": "System",
            "description": "System status and health"
        },
        {
            "name": "Enhanced Chat",
            "description": "Enhanced chat with file integration"
        },
        {
            "name": "Agentic AI",
            "description": "Agentic AI features"        },
        {
            "name": "Feedback",
            "description": "Feedback system for file classification"
        },
        {
            "name": "File Comparison",
            "description": "File comparison and analysis features"
        }
    ]
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

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
    print("- /api/agentic_ai/* - Agentic AI endpoints")
    print("- /api/feedback/* - Feedback endpoints")
    print("- /api/comparison/* - File comparison endpoints")
    print("\nSwagger UI available at: http://localhost:5000/apidocs/")
    
    app.run(host='0.0.0.0', port=port, debug=True) 