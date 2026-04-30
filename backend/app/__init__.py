import os
from flask import Flask
from flask_cors import CORS
from config import Config
from .extensions import db, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Clean CORS for production
    CORS(app, resources={r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }})

    db.init_app(app)
    jwt.init_app(app)

    # Ensure tables exist
    with app.app_context():
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