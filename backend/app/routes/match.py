from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Resume
from app.utils.matcher import calculate_match

match_bp = Blueprint("match", __name__)

@match_bp.route("/match", methods=["POST"])
@jwt_required()
def match_resume():

    resume_id = request.json["resume_id"]
    job_id = request.json["job_id"]

    resume = Resume.query.get(resume_id)
    job = JobDescription.query.get(job_id)

    score = calculate_match(resume.content, job.description)

    result = MatchResult(
        resume_id=resume_id,
        job_id=job_id,
        score=score
    )

    db.session.add(result)
    db.session.commit()

    return jsonify({"match_score": score})