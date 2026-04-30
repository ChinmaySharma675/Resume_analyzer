import re
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    if not data or not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Missing required fields"}), 400

    # Validate email format
    email = data["email"].strip()
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return jsonify({"message": "Invalid email format"}), 400

    # Validate password length
    password = data["password"]
    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    # Validate name
    name = data["name"].strip()
    if len(name) < 2:
        return jsonify({"message": "Name must be at least 2 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    user = User(name=name, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Missing email or password"}), 400

    user = User.query.filter_by(email=data["email"].strip()).first()

    if user and user.check_password(data["password"]):
        token = create_access_token(identity=str(user.id))
        return jsonify({"access_token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}})

    return jsonify({"message": "Invalid credentials"}), 401