import os
import json
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Resume, AnalysisResult
from app.utils.parser import extract_text
from app.utils.skill_extractor import extract_skills
from app.utils.analyzer import analyze_resume
from app.utils.job_analyzer import analyze_resume_against_job

resume_bp = Blueprint("resume", __name__)

# ============================================================
# UPLOAD
# ============================================================
@resume_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()

    # CASE 1: Raw Text Upload
    data = request.get_json(silent=True)
    if data and data.get("text"):
        raw_text = data.get("text")
        target_job = data.get("target_job", "")
        filename = f"Pasted Text Resume - {target_job}" if target_job else "Pasted Text Resume"

        resume = Resume(filename=filename, content=raw_text, user_id=user_id)
        resume.skills = ", ".join(extract_skills(raw_text))

        db.session.add(resume)
        db.session.commit()
        return jsonify({"message": "Text resume processed successfully", "resume_id": resume.id})

    # CASE 2: File Upload
    if "resume" not in request.files:
        return jsonify({"message": "No file part or text payload provided"}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    # Validate file type — only allow PDF, DOCX, images
    allowed_extensions = {'.pdf', '.docx', '.png', '.jpg', '.jpeg'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        return jsonify({"message": f"File type '{ext}' not allowed. Please upload PDF, DOCX, or image files."}), 400

    upload_dir = current_app.config["UPLOAD_FOLDER"]
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    filepath = os.path.join(upload_dir, file.filename)
    file.save(filepath)

    text = extract_text(filepath)
    if not text:
        return jsonify({"message": "No valid text could be extracted from the file. If it's an image, ensure it is clear."}), 400

    target_job = request.form.get("target_job", "")
    filename = f"{file.filename} - {target_job}" if target_job else file.filename

    resume = Resume(filename=filename, content=text, user_id=user_id)
    resume.skills = ", ".join(extract_skills(text))

    db.session.add(resume)
    db.session.commit()

    return jsonify({"message": "Resume uploaded and parsed successfully", "resume_id": resume.id})


# ============================================================
# JOB-DESCRIPTION-AWARE ANALYSIS (the main new feature)
# ============================================================
@resume_bp.route("/resume/analyze", methods=["POST"])
@jwt_required()
def analyze_with_job():
    """Analyze a resume against a specific job description.
    Returns the 4-category score breakdown with matched/missing keywords."""
    data = request.json
    if not data or "resume_id" not in data:
        return jsonify({"message": "resume_id is required"}), 400

    resume_id = data["resume_id"]
    job_description = data.get("job_description", "")

    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()

    if not resume:
        return jsonify({"error": "Resume not found or unauthorized"}), 404

    if not job_description.strip():
        return jsonify({"message": "job_description text is required for analysis"}), 400

    # Run the job-aware analysis
    result = analyze_resume_against_job(resume.content, job_description)

    # Save to database
    analysis = AnalysisResult(
        resume_id=resume_id,
        job_description=job_description,
        overall_score=result["overall_score"],
        result_json=json.dumps(result)
    )
    db.session.add(analysis)
    db.session.commit()

    result["analysis_id"] = analysis.id
    result["resume_filename"] = resume.filename
    return jsonify(result)


# ============================================================
# GET ANALYSIS RESULT BY ID
# ============================================================
@resume_bp.route("/resume/result/<int:analysis_id>", methods=["GET"])
@jwt_required()
def get_analysis_result(analysis_id):
    """Get a stored analysis result. Verifies the resume belongs to the logged-in user."""
    user_id = get_jwt_identity()
    analysis = AnalysisResult.query.get(analysis_id)

    if not analysis:
        return jsonify({"error": "Analysis result not found"}), 404

    # Authorization: check the resume belongs to this user
    resume = Resume.query.filter_by(id=analysis.resume_id, user_id=user_id).first()
    if not resume:
        return jsonify({"error": "Unauthorized — this result does not belong to you"}), 403

    result = json.loads(analysis.result_json)
    result["analysis_id"] = analysis.id
    result["resume_filename"] = resume.filename
    result["job_description"] = analysis.job_description
    result["created_at"] = analysis.created_at.isoformat() if analysis.created_at else None
    return jsonify(result)


# ============================================================
# RESUME HISTORY (all analyses for this user)
# ============================================================
@resume_bp.route("/resume/history", methods=["GET"])
@jwt_required()
def resume_history():
    """Returns all analysis results for the logged-in user."""
    user_id = get_jwt_identity()
    resumes = Resume.query.filter_by(user_id=user_id).all()
    resume_ids = [r.id for r in resumes]

    analyses = AnalysisResult.query.filter(
        AnalysisResult.resume_id.in_(resume_ids)
    ).order_by(AnalysisResult.created_at.desc()).all()

    # Build a quick lookup for resume filenames
    resume_map = {r.id: r.filename for r in resumes}

    data = []
    for a in analyses:
        data.append({
            "analysis_id": a.id,
            "resume_id": a.resume_id,
            "resume_filename": resume_map.get(a.resume_id, "Unknown"),
            "overall_score": a.overall_score,
            "created_at": a.created_at.isoformat() if a.created_at else None
        })

    return jsonify(data)


# ============================================================
# EXISTING ENDPOINTS (kept as-is with minor fixes)
# ============================================================
@resume_bp.route("/resumes", methods=["GET"])
@jwt_required()
def get_resumes():
    user_id = get_jwt_identity()
    resumes = Resume.query.filter_by(user_id=user_id).all()

    data = []
    for r in resumes:
        # Calculate score on the fly for the dashboard
        analysis = analyze_resume(r.content)
        data.append({
            "id": r.id,
            "filename": r.filename,
            "skills": r.skills,
            "score": analysis["score"],
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    return jsonify(data)

@resume_bp.route("/resume/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_resume(id):
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=id, user_id=user_id).first()

    if not resume:
        return jsonify({"error": "Resume not found or unauthorized"}), 404

    # Also delete associated analysis results
    AnalysisResult.query.filter_by(resume_id=id).delete()

    db.session.delete(resume)
    db.session.commit()

    return jsonify({"message": "Resume deleted"})

@resume_bp.route("/resume/<int:id>/analyze", methods=["GET"])
@jwt_required()
def analyze_resume_endpoint(id):
    """Generic resume quality analysis (not job-specific)."""
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=id, user_id=user_id).first()

    if not resume:
        return jsonify({"error": "Resume not found or unauthorized"}), 404

    analysis = analyze_resume(resume.content)
    analysis["skills_found"] = [s.strip() for s in resume.skills.split(',')] if resume.skills else []

    # Also include the latest job-aware analysis if one exists
    latest = AnalysisResult.query.filter_by(resume_id=id).order_by(
        AnalysisResult.created_at.desc()
    ).first()
    if latest:
        analysis["job_analysis"] = json.loads(latest.result_json)
        analysis["job_analysis"]["analysis_id"] = latest.id
        analysis["job_analysis"]["job_description"] = latest.job_description

    return jsonify(analysis)

@resume_bp.route("/search", methods=["GET"])
@jwt_required()
def search_by_skill():
    skill = request.args.get("skill")
    if not skill:
        return jsonify({"message": "Skill parameter required"}), 400

    resumes = Resume.query.filter(
        Resume.skills.like(f"%{skill}%")
    ).all()

    data = []
    for r in resumes:
        data.append({
            "resume_id": r.id,
            "skills": r.skills
        })

    return jsonify(data)

@resume_bp.route("/resumes/page")
@jwt_required()
def paginated_resumes():
    # Fixed: filter by logged-in user
    user_id = get_jwt_identity()
    page = request.args.get("page", 1, type=int)
    resumes = Resume.query.filter_by(user_id=user_id).paginate(page=page, per_page=5, error_out=False)

    data = []
    for r in resumes.items:
        data.append({
            "id": r.id,
            "filename": r.filename
        })

    return jsonify({"resumes": data, "total": resumes.total, "pages": resumes.pages, "current_page": page})