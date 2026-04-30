from flask import Flask
from flask_cors import CORS
from config import Config
from .extensions import db, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow requests from the React dev server with credentials (JWT tokens)
    CORS(app, resources={r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }})

    db.init_app(app)
    jwt.init_app(app)

    from .routes.auth import auth_bp
    from .routes.resume import resume_bp
    from .routes.match import match_bp
    from .routes.job import job_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(match_bp)
    app.register_blueprint(job_bp)

    return app