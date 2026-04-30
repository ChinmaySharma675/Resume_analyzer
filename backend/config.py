import os
import tempfile
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey-123-456")
    
    # This works perfectly on BOTH Windows and Linux
    # On Render (Linux): /tmp/resume.db
    # On Windows: C:\Users\...\AppData\Local\Temp\resume.db
    db_path = os.path.join(tempfile.gettempdir(), "resume.db")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", f"sqlite:///{db_path}")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-789")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Put uploads in the current project directory
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
    TESTING = os.environ.get("TESTING", "False").lower() == "true"