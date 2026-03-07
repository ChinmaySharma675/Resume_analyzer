import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Resume
from app.utils.parser import extract_text
from app.utils.skill_extractor import extract_skills
from app.utils.analyzer import analyze_resume

resume_bp = Blueprint("resume", __name__)

@resume_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()
    
    # CASE 1: Raw Text Upload
    if request.is_json and request.json.get("text"):
        raw_text = request.json.get("text")
        target_job = request.json.get("target_job", "")
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

@resume_bp.route("/resumes", methods=["GET"])
@jwt_required()
def get_resumes():
    user_id = get_jwt_identity()
    resumes = Resume.query.filter_by(user_id=user_id).all()

    data = []
    for r in resumes:
        data.append({
            "id": r.id,
            "filename": r.filename,
            "skills": r.skills
        })

    return jsonify(data)

@resume_bp.route("/resume/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_resume(id):
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=id, user_id=user_id).first()

    if not resume:
        return jsonify({"error": "Resume not found or unauthorized"}), 404

    db.session.delete(resume)
    db.session.commit()

    return jsonify({"message": "Resume deleted"})

@resume_bp.route("/resume/<int:id>/analyze", methods=["GET"])
@jwt_required()
def analyze_resume_endpoint(id):
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=id, user_id=user_id).first()

    if not resume:
        return jsonify({"error": "Resume not found or unauthorized"}), 404

    analysis = analyze_resume(resume.content)
    analysis["skills_found"] = [s.strip() for s in resume.skills.split(',')] if resume.skills else []
    
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
    page = request.args.get("page", 1, type=int)
    resumes = Resume.query.paginate(page=page, per_page=5, error_out=False)

    data = []
    for r in resumes.items:
        data.append({
            "id": r.id,
            "filename": r.filename
        })

    return jsonify({"resumes": data, "total": resumes.total, "pages": resumes.pages, "current_page": page})