from flask import Blueprint, jsonify
from app.models import User, Resume, JobDescription
from flask_jwt_extended import jwt_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/admin/stats")
@jwt_required()
def stats():

    users = User.query.count()
    resumes = Resume.query.count()
    jobs = JobDescription.query.count()

    return jsonify({
        "total_users": users,
        "total_resumes": resumes,
        "total_jobs": jobs
    })