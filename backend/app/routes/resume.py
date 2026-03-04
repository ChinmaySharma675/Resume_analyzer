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
    file = request.files["resume"]

    filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)

    text = extract_text(filepath)

    resume = Resume(filename=file.filename, content=text, user_id=user_id)
    resume.skills = ", ".join(extract_skills(text))
    
    db.session.add(resume)
    db.session.commit()

    return jsonify({"message": "Resume uploaded successfully"})