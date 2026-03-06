from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import JobDescription
from flask_jwt_extended import jwt_required

job_bp = Blueprint("job", __name__)

@job_bp.route("/jobs", methods=["GET"])
def get_jobs():
    jobs = JobDescription.query.all()
    data = [{"id": j.id, "title": j.title, "description": j.description} for j in jobs]
    return jsonify(data)

@job_bp.route("/job", methods=["POST"])
@jwt_required()
def create_job():
    data = request.json
    if not data or "title" not in data or "description" not in data:
        return jsonify({"message": "Job title and description are required"}), 400

    job = JobDescription(
        title=data["title"],
        description=data["description"]
    )

    db.session.add(job)
    db.session.commit()

    return jsonify({"message": "Job created", "job_id": job.id})