from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Resume
from app.utils.matcher import calculate_match

match_bp = Blueprint("match", __name__)

@match_bp.route("/match/<int:resume_id>", methods=["POST"])
@jwt_required()
def match_resume(resume_id):
    job_description = request.json["job_description"]

    resume = Resume.query.get(resume_id)

    score = calculate_match(resume.content, job_description)

    return jsonify({"match_score": score})