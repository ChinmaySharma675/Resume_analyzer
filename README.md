# 📄 Context-Aware Resume Analyzer

## About

An AI-powered web application that helps freshers and students analyze their resumes against specific job descriptions. It uses NLP (Natural Language Processing) and Machine Learning to extract skills, calculate a match score out of 100, identify missing keywords, and provide actionable improvement suggestions — all for free, with no paid APIs.

## Features

- 🔐 User registration and login with JWT authentication (tokens expire after 24 hours)
- 📂 Upload resumes in PDF, DOCX, or image format (also supports pasting raw text)
- 📋 Paste a full job description and get an AI-powered score out of 100
- 🎯 4-category score breakdown:
  - **Skill Match (40 pts)** — TF-IDF cosine similarity + keyword matching
  - **Project Relevance (25 pts)** — Checks if projects mention job-relevant technologies
  - **Education (20 pts)** — Detects degree keywords (B.Tech, B.E., MCA, etc.)
  - **Certifications (15 pts)** — Detects certifications, courses, and achievements
- ✅ Matched keywords shown as green badges
- ❌ Missing keywords shown as red badges
- 💡 Smart improvement suggestions based on the job description
- 📊 Dashboard with resume cards, scores, and analysis history table
- 🔍 Generic resume quality analysis (section breakdown, suggestions)
- 🤝 Job Matching — match resumes against saved job descriptions using cosine similarity
- 🎯 Job Eligibility Checker — test your skills against common job roles

## Tech Stack

- **Backend:** Python 3.x, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, REST API
- **Frontend:** React 19, Vite, React Router, Framer Motion, Lucide Icons, Tailwind CSS
- **NLP/ML:** scikit-learn (TF-IDF Vectorizer, Cosine Similarity), regex-based skill extraction
- **Auth:** JWT tokens with 24-hour expiry, werkzeug password hashing
- **Database:** SQLite (via SQLAlchemy)

## How to Run Locally

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install flask flask-cors flask-sqlalchemy flask-jwt-extended PyPDF2 python-docx scikit-learn Pillow pytesseract werkzeug

# Run the server
python run.py
```

Backend will start at: `http://127.0.0.1:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Frontend will start at: `http://localhost:5173`

### Usage

1. Open `http://localhost:5173` in your browser
2. Register a new account (email + password with 8+ characters)
3. Go to the Upload page
4. Upload your resume (PDF) and paste the job description
5. Click "Analyze Against Job" to get your score and recommendations

## API Endpoints

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/register` | POST | ❌ | Register new user (name, email, password) |
| `/login` | POST | ❌ | Login, returns JWT token |
| `/upload` | POST | ✅ | Upload resume (file or text), extract & save |
| `/resume/analyze` | POST | ✅ | Analyze resume against job description (4-category scoring) |
| `/resume/result/<id>` | GET | ✅ | Get stored analysis result |
| `/resume/history` | GET | ✅ | Get all analysis results for logged-in user |
| `/resumes` | GET | ✅ | List all resumes for logged-in user |
| `/resume/<id>` | DELETE | ✅ | Delete a resume |
| `/resume/<id>/analyze` | GET | ✅ | Generic resume quality analysis |
| `/match` | POST | ✅ | Match resume vs saved job (cosine similarity) |
| `/jobs` | GET | ❌ | List all job descriptions |
| `/job` | POST | ✅ | Create job description |
| `/job/<id>` | DELETE | ✅ | Delete job description |
| `/search?skill=X` | GET | ✅ | Search resumes by skill |

## Team

- **Chinmay Sharma** — Lead Developer (Frontend)
- **Anmol Singh** — Backend Developer
- **Anurag Yadav** — Testing & Deployment