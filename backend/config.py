import os
import tempfile
from datetime import timedelta

class Config:
    # --- SECURITY ---
    SECRET_KEY = os.environ.get("SECRET_KEY", "prod-secret-999-000")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-prod-777-888")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # --- DATABASE (The 500 Error Fix) ---
    # We FORCE SQLite for the presentation to avoid complex Render DB issues.
    db_path = os.path.join(tempfile.gettempdir(), "resume_prod.db")
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # --- UPLOADS ---
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
    TESTING = False