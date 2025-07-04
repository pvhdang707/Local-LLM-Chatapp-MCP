# Controllers package 

# Import all blueprint controllers
from .auth_controller import auth_bp
from .chat_controller import chat_bp
# from .admin_controller import admin_bp
from .file_controller import file_bp
from .search_controller import search_bp
from .system_controller import system_bp
from .enhanced_chat_controller import enhanced_chat_bp

# List of all blueprints for easy registration
all_blueprints = [
    auth_bp,
    chat_bp,
    # admin_bp,
    file_bp,
    search_bp,
    system_bp,
    enhanced_chat_bp
] 