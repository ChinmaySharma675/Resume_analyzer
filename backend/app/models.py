from datetime import datetime, timezone
from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(200))
    role = db.Column(db.String(20), default="user")

    resumes = db.relationship("Resume", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Resume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200))
    content = db.Column(db.Text)
    skills = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))


class JobDescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)


class MatchResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    resume_id = db.Column(db.Integer, db.ForeignKey("resume.id"))
    job_id = db.Column(db.Integer, db.ForeignKey("job_description.id"))

    score = db.Column(db.Float)


class AnalysisResult(db.Model):
    """Stores job-description-aware analysis results."""
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey("resume.id"))
    job_description = db.Column(db.Text)
    overall_score = db.Column(db.Float)
    result_json = db.Column(db.Text)  # Full analysis stored as JSON
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    resume = db.relationship("Resume", backref="analyses")