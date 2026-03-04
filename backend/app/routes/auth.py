from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Resume, User
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    user = User(name=data["name"], email=data["email"])
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if user and user.check_password(data["password"]):
        token = create_access_token(identity=user.id)
        return jsonify({"access_token": token})

    return jsonify({"message": "Invalid credentials"}), 401

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

    resume = Resume.query.get(id)

    if not resume:
        return jsonify({"error": "Resume not found"})

    db.session.delete(resume)
    db.session.commit()

    return jsonify({"message": "Resume deleted"})

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

@resume_bp.route("/search", methods=["GET"])
@jwt_required()
def search_by_skill():

    skill = request.args.get("skill")

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

    resumes = Resume.query.paginate(
        page=page,
        per_page=5
    )

    data = []

    for r in resumes.items:
        data.append({
            "id": r.id,
            "filename": r.filename
        })

    return jsonify(data)