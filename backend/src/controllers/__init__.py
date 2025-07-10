# Controllers package 

# Import all blueprint controllers
from .auth_controller import auth_bp
from .chat_controller import chat_bp
from .admin_controller import admin_bp
from .file_controller import file_bp
from .search_controller import search_bp
from .system_controller import system_bp
from .public_chat_controller import public_chat_bp
from .enhanced_chat_controller import enhanced_chat_bp
from .agentic_ai_controller import agentic_ai_bp

# Danh sách tất cả blueprints
all_blueprints = [
    auth_bp,
    chat_bp,
    admin_bp,
    file_bp,
    search_bp,
    system_bp,
    public_chat_bp,
    enhanced_chat_bp,
    agentic_ai_bp
] 