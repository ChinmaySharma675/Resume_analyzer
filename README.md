# 🧠 Context-Aware Resume Analyzer

> AI-powered resume analysis tool that scores resumes against job descriptions using NLP and Machine Learning. Built for freshers and students to optimize their resumes for ATS (Applicant Tracking Systems).

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-green?logo=flask)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-orange?logo=scikit-learn)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [How the AI Scoring Works](#-how-the-ai-scoring-works)
- [Setup & Installation](#-setup--installation)
- [API Documentation](#-api-documentation)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Docker Deployment](#-docker-deployment)
- [Security](#-security)
- [Team Members](#-team-members)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **User Authentication** | JWT-based login/register with password hashing (PBKDF2-SHA256) |
| **Resume Upload** | Supports PDF, DOCX, and image files (OCR via Tesseract) |
| **AI Scoring Engine** | 4-category scoring: Skills (40pts), Projects (25pts), Education (20pts), Certifications (15pts) |
| **TF-IDF Analysis** | Semantic similarity matching using scikit-learn's TfidfVectorizer + Cosine Similarity |
| **200+ Skill Detection** | Regex-based skill extraction across 14 tech categories |
| **Accept/Reject Verdict** | ATS-standard verdict banners based on score thresholds |
| **Job Eligibility Checker** | Match your skills against 35 job roles with alias/synonym support |
| **Personalized Suggestions** | Context-aware improvement tips based on actual resume content |
| **Analysis History** | Track and compare scores across multiple job descriptions |
| **Responsive UI** | Modern React 19 frontend with Framer Motion animations |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Flask** | REST API framework |
| **SQLAlchemy** | ORM for database operations |
| **SQLite** | Local database |
| **scikit-learn** | TF-IDF Vectorizer + Cosine Similarity (ML) |
| **PyPDF2** | PDF text extraction |
| **python-docx** | DOCX parsing |
| **pytesseract** | OCR for image-based resumes |
| **Flask-JWT-Extended** | JWT authentication |
| **werkzeug** | PBKDF2-SHA256 password hashing |
| **Flask-CORS** | Cross-origin request handling |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client |
| **Framer Motion** | Animations |
| **Lucide React** | Icon library |
| **Tailwind CSS** | Utility-first styling |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)             │
│                  http://localhost:5173                │
│                                                      │
│  Login ──► Dashboard ──► Upload ──► Analysis         │
│                          │                           │
│  Job Matching ◄──────────┘       Job Eligibility     │
└──────────────────────┬──────────────────────────────┘
                       │ Axios (JWT in headers)
                       ▼
┌─────────────────────────────────────────────────────┐
│                  BACKEND (Flask REST API)             │
│                  http://127.0.0.1:5000                │
│                                                      │
│  Routes:                                             │
│  ├── /register, /login          (auth.py)            │
│  ├── /upload, /resume/analyze   (resume.py)          │
│  ├── /jobs, /job                (job.py)             │
│  └── /match                     (match.py)           │
│                                                      │
│  NLP Pipeline:                                       │
│  ├── skill_extractor.py    (200+ regex patterns)     │
│  ├── job_analyzer.py       (TF-IDF + 4-category)    │
│  ├── analyzer.py           (Generic quality check)   │
│  └── matcher.py            (Cosine similarity)       │
└──────────────────────┬──────────────────────────────┘
                       │ SQLAlchemy ORM
                       ▼
┌─────────────────────────────────────────────────────┐
│                  DATABASE (SQLite)                    │
│                                                      │
│  Tables: user, resume, job_description,              │
│          match_result, analysis_result               │
└─────────────────────────────────────────────────────┘
```

---

## 🤖 How the AI Scoring Works

### Two-Layer NLP Approach

**Layer 1 — Dictionary-Based Keyword Matching (70% weight)**
- 200+ tech skills detected using regex word-boundary patterns (`\bPython\b`)
- Skills categorized across 14 domains: Programming, Frontend, Backend, ML/AI, DevOps, etc.
- Compares extracted skills from resume vs. job description

**Layer 2 — TF-IDF Cosine Similarity (30% weight)**
```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

vectorizer = TfidfVectorizer(stop_words='english')
vectors = vectorizer.fit_transform([resume_text, job_description])
similarity = cosine_similarity(vectors)[0][1]
```

### Scoring Categories

| Category | Max Points | Method |
|----------|:---:|--------|
| Skill Match | 40 | Dictionary (70%) + TF-IDF (30%) |
| Project Relevance | 25 | Section extraction + keyword matching |
| Education | 20 | Degree/university keyword detection |
| Certifications | 15 | Certificate/course keyword detection |
| **Total** | **100** | |

### Verdict Thresholds (ATS Standard)
- **≥ 80**: ✅ Strong Candidate — Likely Accepted
- **60-79**: 👍 Good Fit — May be Shortlisted
- **40-59**: ⚠️ Average Match — May be Reviewed
- **< 40**: ❌ Weak Match — Likely Rejected

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/ChinmaySharma675/Resume_analyzer.git
cd Resume_analyzer
```

### Step 2: Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
Backend runs at: `http://127.0.0.1:5000`

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

### Step 4: Open the App
Navigate to `http://localhost:5173` in your browser.

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login & get JWT token | ❌ |

### Resume Operations
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/upload` | Upload resume (PDF/DOCX/image) | ✅ |
| GET | `/resumes` | Get all user resumes | ✅ |
| GET | `/resume/<id>/analyze` | Generic quality analysis | ✅ |
| POST | `/resume/analyze` | Job-aware AI analysis | ✅ |
| GET | `/resume/result/<id>` | Get saved analysis result | ✅ |
| GET | `/resume/history` | All analysis history | ✅ |

### Job Operations
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/job` | Create job description | ✅ |
| GET | `/jobs` | List all jobs | ✅ |
| DELETE | `/job/<id>` | Delete a job | ✅ |
| POST | `/match` | Match resume vs job (TF-IDF) | ✅ |

### Example Request
```bash
# Register
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'

# Upload Resume (with JWT token)
curl -X POST http://localhost:5000/upload \
  -H "Authorization: Bearer <your_token>" \
  -F "file=@resume.pdf"
```

---

## ⚙️ CI/CD Pipeline

We use **GitHub Actions** for continuous integration:

```yaml
# .github/workflows/ci.yml
Triggers: Push to main, Pull requests
Jobs:
  1. Backend Tests (pytest)
  2. Python Linting (flake8)
  3. Frontend Build (npm run build)
```

Pipeline runs automatically on every push to `main` branch.

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose
```bash
docker-compose up --build
```

This starts:
- **Backend** at `http://localhost:5000`
- **Frontend** at `http://localhost:3000`

### Individual Containers
```bash
# Backend only
docker build -t resume-backend ./backend
docker run -p 5000:5000 resume-backend

# Frontend only
docker build -t resume-frontend ./frontend
docker run -p 3000:3000 resume-frontend
```

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| Password Hashing | PBKDF2-SHA256 via werkzeug |
| Authentication | JWT tokens (24h expiry) |
| CORS | Configured for specific origins |
| Input Validation | Frontend + Backend validation |
| SQL Injection | Prevented via SQLAlchemy ORM |
| Environment Variables | Secrets stored in `.env` file |

---

## 🧪 Testing

```bash
cd backend
pytest tests/ -v
```

Test coverage includes:
- Skill extraction accuracy
- Scoring algorithm validation
- Authentication flow
- API endpoint responses

---

## 👥 Team Members

| Name | Role | Responsibilities |
|------|------|-----------------|
| **Chinmay Sharma** | Team Lead & Backend Developer | Flask API architecture, database design, route implementation, project coordination |
| **Anurag Yadav** | Frontend Developer & ML/NLP Engineer | React UI development, ML algorithm pipeline, NLP scoring engine (TF-IDF, skill extraction) |
| **Anmol Singh** | Backend Developer & Integration | Backend routes, API integration, testing, deployment pipeline |

---

## 📄 License

This project is developed as a mini-project for **GLA University, 2nd Year CS-AIML**.

---

## 🙏 Acknowledgments

- [scikit-learn](https://scikit-learn.org/) for TF-IDF and Cosine Similarity
- [Flask](https://flask.palletsprojects.com/) for the REST API framework
- [React](https://react.dev/) for the frontend framework
- [Vite](https://vitejs.dev/) for the build tool