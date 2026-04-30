from flask import Blueprint, jsonify
from datetime import datetime

utils_bp = Blueprint("utils", __name__, url_prefix="/api")


@utils_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Resume Analyzer API"
    }), 200


@utils_bp.route("/api-info", methods=["GET"])
def api_info():
    """Get information about available API endpoints"""
    endpoints = {
        "auth": {
            "POST /api/register": "Register a new user",
            "POST /api/login": "Login and get JWT token",
            "GET /api/profile": "Get current user profile",
            "PUT /api/profile": "Update user profile",
            "POST /api/change-password": "Change user password"
        },
        "resume": {
            "POST /api/upload": "Upload resume (file or text)",
            "GET /api/resumes": "Get all user resumes",
            "GET /api/resume/<id>": "Get resume details",
            "DELETE /api/resume/<id>": "Delete a resume",
            "GET /api/resume/<id>/analyze": "Analyze resume strengths and weaknesses",
            "GET /api/search": "Search resumes by skill",
            "GET /api/resumes/page": "Get paginated resumes"
        },
        "job": {
            "GET /api/jobs": "Get all job descriptions",
            "POST /api/job": "Create a new job description",
            "DELETE /api/job/<id>": "Delete a job description"
        },
        "match": {
            "POST /api/match": "Calculate match score between resume and job",
            "GET /api/rank/<job_id>": "Rank all resumes for a job"
        },
        "admin": {
            "GET /api/admin/stats": "Get system statistics",
            "GET /api/admin/users": "Get all users",
            "GET /api/admin/user/<id>": "Get user details",
            "DELETE /api/admin/user/<id>": "Delete a user and their data",
            "GET /api/admin/resumes": "Get all resumes (paginated)",
            "GET /api/admin/jobs": "Get all jobs (paginated)",
            "GET /api/admin/job/<id>/matches": "Get matches for a job",
            "DELETE /api/admin/match/<id>": "Delete a match result"
        }
    }
    
    return jsonify({
        "api_version": "1.0",
        "description": "Resume Analyzer - AI-powered resume analysis and job matching",
        "endpoints": endpoints
    }), 200
