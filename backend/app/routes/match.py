from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Resume, JobDescription, MatchResult
from app.utils.matcher import calculate_match

match_bp = Blueprint("match", __name__)

@match_bp.route("/match", methods=["POST"])
@jwt_required()
def match_resume():
    data = request.json
    if not data or "resume_id" not in data or "job_id" not in data:
        return jsonify({"message": "resume_id and job_id are required"}), 400

    resume_id = data["resume_id"]
    job_id = data["job_id"]

    resume = Resume.query.get(resume_id)
    job = JobDescription.query.get(job_id)

    if not resume or not job:
        return jsonify({"message": "Resume or Job not found"}), 404

    score = calculate_match(resume.content, job.description)

    result = MatchResult(
        resume_id=resume_id,
        job_id=job_id,
        score=score
    )

    db.session.add(result)
    db.session.commit()

    return jsonify({"match_score": score, "match_id": result.id})

@match_bp.route("/rank/<int:job_id>", methods=["GET"])
@jwt_required()
def rank_resumes(job_id):
    results = MatchResult.query.filter_by(job_id=job_id)\
        .order_by(MatchResult.score.desc()).all()

    data = []
    for r in results:
        data.append({
            "resume_id": r.resume_id,
            "score": r.score
        })

    return jsonify(data)