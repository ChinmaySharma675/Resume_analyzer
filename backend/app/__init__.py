import os
from flask import Flask
from flask_cors import CORS
from config import Config
from .extensions import db, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # FIXED CORS: Standard configuration for JWT-based apps
    # This allows the Vercel frontend to talk to the Render backend without "Network Error"
    CORS(app, resources={r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    db.init_app(app)
    jwt.init_app(app)

    # Ensure tables exist
    with app.app_context():
        from . import models
        db.create_all()
        # Create uploads folder
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])

    from .routes.auth import auth_bp
    from .routes.resume import resume_bp
    from .routes.match import match_bp
    from .routes.job import job_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(match_bp)
    app.register_blueprint(job_bp)

    @app.route('/')
    def home():
        return {"message": "Resume Analyzer API is Online", "status": "Ready"}

    return app