from flask import Blueprint, jsonify, request
from app.models import User, Resume, JobDescription, MatchResult
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

admin_bp = Blueprint("admin", __name__, url_prefix="/api")


@admin_bp.route("/admin/stats", methods=["GET"])
@jwt_required()
def stats():
    """Get overall system statistics"""
    total_users = User.query.count()
    total_resumes = Resume.query.count()
    total_jobs = JobDescription.query.count()
    total_matches = MatchResult.query.count()
    
    # Calculate average match score
    avg_match = db.session.query(func.avg(MatchResult.score)).scalar() or 0
    
    return jsonify({
        "total_users": total_users,
        "total_resumes": total_resumes,
        "total_jobs": total_jobs,
        "total_matches": total_matches,
        "average_match_score": round(avg_match, 2)
    }), 200


@admin_bp.route("/admin/users", methods=["GET"])
@jwt_required()
def get_all_users():
    """Get all users with their resume counts"""
    users = User.query.all()
    
    data = []
    for user in users:
        data.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "resume_count": len(user.resumes)
        })
    
    return jsonify(data), 200


@admin_bp.route("/admin/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_details(user_id):
    """Get detailed information about a specific user"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "resume_count": len(user.resumes),
        "resumes": [{"id": r.id, "filename": r.filename} for r in user.resumes]
    }), 200


@admin_bp.route("/admin/resumes", methods=["GET"])
@jwt_required()
def get_all_resumes():
    """Get all resumes in the system with pagination"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    resumes = Resume.query.paginate(page=page, per_page=per_page, error_out=False)
    
    data = []
    for resume in resumes.items:
        user = User.query.get(resume.user_id)
        data.append({
            "id": resume.id,
            "filename": resume.filename,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "skills": resume.skills
        })
    
    return jsonify({
        "resumes": data,
        "total": resumes.total,
        "pages": resumes.pages,
        "current_page": page
    }), 200


@admin_bp.route("/admin/jobs", methods=["GET"])
@jwt_required()
def get_all_jobs():
    """Get all job descriptions with match counts"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    jobs = JobDescription.query.paginate(page=page, per_page=per_page, error_out=False)
    
    data = []
    for job in jobs.items:
        match_count = MatchResult.query.filter_by(job_id=job.id).count()
        data.append({
            "id": job.id,
            "title": job.title,
            "description": job.description[:200] + "..." if len(job.description) > 200 else job.description,
            "match_count": match_count
        })
    
    return jsonify({
        "jobs": data,
        "total": jobs.total,
        "pages": jobs.pages,
        "current_page": page
    }), 200


@admin_bp.route("/admin/job/<int:job_id>/matches", methods=["GET"])
@jwt_required()
def get_job_matches(job_id):
    """Get all match results for a specific job"""
    job = JobDescription.query.get(job_id)
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    matches = MatchResult.query.filter_by(job_id=job_id)\
        .order_by(MatchResult.score.desc()).all()
    
    data = []
    for match in matches:
        resume = Resume.query.get(match.resume_id)
        user = User.query.get(resume.user_id)
        data.append({
            "match_id": match.id,
            "resume_id": match.resume_id,
            "filename": resume.filename,
            "user_name": user.name if user else "Unknown",
            "score": match.score
        })
    
    return jsonify({
        "job_id": job_id,
        "job_title": job.title,
        "matches": data
    }), 200


@admin_bp.route("/admin/match/<int:match_id>", methods=["DELETE"])
@jwt_required()
def delete_match(match_id):
    """Delete a specific match result"""
    match = MatchResult.query.get(match_id)
    
    if not match:
        return jsonify({"error": "Match not found"}), 404
    
    db.session.delete(match)
    db.session.commit()
    
    return jsonify({"message": "Match deleted successfully"}), 200


@admin_bp.route("/admin/user/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    """Delete a user and all their associated data"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Delete all resumes associated with this user
    resumes = Resume.query.filter_by(user_id=user_id).all()
    for resume in resumes:
        MatchResult.query.filter_by(resume_id=resume.id).delete()
        db.session.delete(resume)
    
    # Delete the user
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"message": "User and associated data deleted successfully"}), 200