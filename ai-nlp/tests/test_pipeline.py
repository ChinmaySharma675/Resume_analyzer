"""
Basic test script for ai-nlp module.
Run this from inside the ai-nlp/ directory:
    python tests/test_pipeline.py
"""
import sys
import os

# Add parent directory to path so we can import utils
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.nlp import extract_entities_spacy, extract_education, process_resume_text
from utils.extractor import extract_text

# ─────────────────────────────────────────────
# Sample resume text for testing (no real file needed)
# ─────────────────────────────────────────────
SAMPLE_RESUME = """
John Doe
Software Engineer | john.doe@email.com | New York, USA

EDUCATION
Bachelor of Technology in Computer Science, MIT, 2020
Master of Science in Artificial Intelligence, Stanford University, 2022

EXPERIENCE
Software Engineer, Google, Jan 2022 - Present
  - Built scalable microservices using Python, Docker, and Kubernetes
  - Worked with PostgreSQL and MongoDB for data storage

Junior Developer, Amazon, June 2020 - Dec 2021
  - Developed RESTful APIs using Flask and FastAPI
  - Experience with AWS and Azure cloud platforms

SKILLS
Python, Java, React, Node.js, Machine Learning, Deep Learning, NLP,
Docker, Kubernetes, SQL, MongoDB, Git, Linux
"""

def test_entities():
    print("=" * 50)
    print("TEST: extract_entities_spacy")
    print("=" * 50)
    result = extract_entities_spacy(SAMPLE_RESUME)
    if "error" in result:
        print(f"  [SKIP] {result['error']}")
    else:
        print(f"  Persons  : {result.get('PERSON')}")
        print(f"  Orgs     : {result.get('ORG')}")
        print(f"  Locations: {result.get('GPE')}")
        print(f"  Dates    : {result.get('DATE')}")
        print(f"  Skills   : {result.get('SKILLS')}")
    print()

def test_education():
    print("=" * 50)
    print("TEST: extract_education")
    print("=" * 50)
    result = extract_education(SAMPLE_RESUME)
    print(f"  Education entries found: {len(result)}")
    for e in result:
        print(f"    - {e}")
    print()

def test_full_pipeline():
    print("=" * 50)
    print("TEST: process_resume_text (full pipeline)")
    print("=" * 50)
    result = process_resume_text(SAMPLE_RESUME)
    print(f"  Skills found   : {result['entities'].get('SKILLS', [])}")
    print(f"  Education found: {result['education']}")
    print()

def test_txt_extraction():
    print("=" * 50)
    print("TEST: extract_text (TXT file simulation)")
    print("=" * 50)
    import io
    fake_txt = io.BytesIO(SAMPLE_RESUME.encode("utf-8"))
    text = extract_text(fake_txt, "resume.txt")
    print(f"  Extracted {len(text)} characters from .txt stream")
    print(f"  Preview: {text[:100]}...")
    print()

if __name__ == "__main__":
    print("\n🧪 Running AI-NLP Module Tests\n")
    test_txt_extraction()
    test_entities()
    test_education()
    test_full_pipeline()
    print("✅ All tests complete.")
