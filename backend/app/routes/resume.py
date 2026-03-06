import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Resume
from app.utils.parser import extract_text
from app.utils.skill_extractor import extract_skills

resume_bp = Blueprint("resume", __name__)

@resume_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()
    
    if "resume" not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    upload_dir = current_app.config["UPLOAD_FOLDER"]
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    filepath = os.path.join(upload_dir, file.filename)
    file.save(filepath)

    text = extract_text(filepath)

    resume = Resume(filename=file.filename, content=text, user_id=user_id)
    resume.skills = ", ".join(extract_skills(text))
    
    db.session.add(resume)
    db.session.commit()

    return jsonify({"message": "Resume uploaded successfully", "resume_id": resume.id})

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