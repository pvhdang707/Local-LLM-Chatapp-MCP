import os
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from src.config import Config
import pymysql

# Register PyMySQL as MySQL driver
pymysql.install_as_MySQLdb()

# Database configuration
DATABASE_URL = Config.MYSQL_DATABASE

# Create engine
engine = create_engine(DATABASE_URL, echo=False)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

# File model
class File(Base):
    __tablename__ = "files"
    
    id = Column(String(36), primary_key=True, index=True)
    original_name = Column(String(255), nullable=False)
    stored_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(100), nullable=False)
    uploaded_by = Column(String(50), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

# File Permission model
class FilePermission(Base):
    __tablename__ = "file_permissions"
    
    id = Column(String(36), primary_key=True, index=True)
    file_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    can_read = Column(Boolean, default=True, nullable=False)
    can_write = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# Chat Session model
class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), nullable=True)  # Null for public chat
    username = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

# Chat Message model
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, index=True)
    session_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=True)  # Null for public chat
    username = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    file_id = Column(String(36), nullable=True)  # Reference to file if used in chat
    message_type = Column(String(20), default="user", nullable=False)  # user, assistant

# Chat history model (legacy - for backward compatibility)
class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), nullable=True)  # Null for public chat
    username = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    file_id = Column(String(36), nullable=True)  # Reference to file if used in chat

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Initialize database
if __name__ == "__main__":
    create_tables()
    print("Database tables created successfully!") 