from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import JobDescription
from flask_jwt_extended import jwt_required

job_bp = Blueprint("job", __name__)


@job_bp.route("/job", methods=["POST"])
@jwt_required()
def create_job():

    data = request.json

    job = JobDescription(
        title=data["title"],
        description=data["description"]
    )

    db.session.add(job)
    db.session.commit()

    return jsonify({"message": "Job created"})