# AI-NLP Module

This module handles all AI and NLP processing for the Resume Analyzer project.

## Features
- **Text Extraction**: Supports PDF, DOCX, and TXT resume files
- **Named Entity Recognition**: Extracts persons, organizations, locations using spaCy
- **Skill Detection**: Matches against a curated list of common tech skills
- **Education Extraction**: Heuristically finds degree information

## Setup

```bash
# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux/Mac

# 2. Install dependencies
pip install -r requirements.txt

# 3. Download spaCy language model
python -m spacy download en_core_web_sm

# 4. Run the API server
python main.py
```

## API Endpoints

### `GET /`
Health check — returns a welcome message.

### `POST /analyze`
Upload a resume file and receive NLP analysis.

**Request:** `multipart/form-data` with a `file` field (`.pdf`, `.docx`, `.txt`)

**Response:**
```json
{
  "filename": "resume.pdf",
  "raw_text_preview": "First 500 characters...",
  "analysis": {
    "entities": {
      "PERSON": ["John Doe"],
      "ORG": ["Google", "MIT"],
      "GPE": ["New York"],
      "DATE": ["2020", "June 2023"],
      "SKILLS": ["python", "docker", "machine learning"]
    },
    "education": ["Bachelor of Technology in Computer Science"]
  }
}
```

## Project Structure
```
ai-nlp/
├── main.py            # FastAPI app & routes
├── requirements.txt   # Python dependencies
├── .gitignore
├── utils/
│   ├── extractor.py   # PDF/DOCX/TXT text extraction
│   └── nlp.py         # NER, skill & education extraction
└── README.md
```
