📄 Context Aware Resume Analyzer

An AI-powered web application that analyzes resumes, extracts key information, and evaluates candidate-job compatibility using Natural Language Processing (NLP).


🚀 Project Overview

The Context Aware Resume Analyzer is a Flask-based web application that:

📂 Allows users to upload resumes (PDF/DOCX)

🧠 Extracts skills, experience, education using NLP

🎯 Matches resumes against job descriptions

📊 Calculates match score

👤 Provides role-based access (Admin & User)

🔐 Implements secure authentication (JWT / Session)

📈 Displays analytics dashboard


🏗 System Architecture

Client (Browser)
        ↓
Frontend (HTML/CSS/JS)
        ↓
Flask Backend (REST API)
        ↓
NLP Engine (spaCy / NLTK / Scikit-learn)
        ↓
Database (MySQL / PostgreSQL)



🛠 Tech Stack

Backend-

 -Python 3.x

 -Flask

 -Flask-SQLAlchemy

 -Flask-Login / Flask-JWT-Extended

 -REST API

Frontend-

 -HTML5

 -CSS3

 -Bootstrap

 -JavaScript

Database-

 -MySQL / PostgreSQL

NLP & AI-

 -spaCy

 -NLTK

 -Scikit-learn

 -TF-IDF / Cosine Similarity

Deployment-

 -Render / Railway / PythonAnywhere


📂 Project Structure

resume-analyzer/
│
├── app/
│   ├── __init__.py
│   ├── models.py
│   ├── utils/
│   │   ├── resume_parser.py
│   │   ├── matcher.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── resume.py
│   │   ├── admin.py
│   ├── templates/
│   ├── static/
│
├── config.py
├── run.py
├── requirements.txt
├── README.md


📊 Future Enhancements-

 -AI-based resume scoring

 -Recommendation system

 -Interview question generator

 -Resume improvement suggestions

 -Multi-language support

 -Admin analytics dashboard


👥 Team Members

| Name      | Role                 |
| --------- | -------------------- |
| Anmol S   | Backend Developer    |
| Chinmay s | Frontend Developer   |
| Anurag Y  | Testing & Deployment |


📜 License

This project is for academic and educational purposes.


⭐ Why This Project Stands Out

 -AI-based processing

 -Context-aware analysis

 -Secure authentication

 -Clean architecture

 -Industry-standard structure

 -Deployable and scalable