import spacy
import re
from typing import List, Dict, Any

# You may need to run `python -m spacy download en_core_web_sm`
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Warning: spacy model 'en_core_web_sm' not found. Please download it using: python -m spacy download en_core_web_sm")
    nlp = None

# A basic static list of common tech skills for keyword matching as a fallback/enhancement
COMMON_SKILLS = [
    "python", "java", "c++", "javascript", "typescript", "react", "angular", "vue",
    "node.js", "express", "django", "flask", "fastapi", "spring boot", "sql", "mysql",
    "postgresql", "mongodb", "docker", "kubernetes", "aws", "azure", "gcp", "machine learning",
    "deep learning", "nlp", "computer vision", "data analysis", "git", "linux", "html", "css"
]

def extract_entities_spacy(text: str) -> Dict[str, Any]:
    """
    Use spaCy NER to extract structured information like names, organizations (companies/universities),
    and build a fundamental entity map.
    """
    if not nlp:
        return {"error": "spaCy model not loaded."}
        
    doc = nlp(text)
    entities = {
        "PERSON": [],
        "ORG": [],
        "GPE": [], # Locations
        "DATE": [],
        "SKILLS": []
    }
    
    for ent in doc.ents:
        if ent.label_ in entities:
            if ent.text not in entities[ent.label_]:
                entities[ent.label_].append(ent.text)
                
    # Basic skill matching (case insensitive)
    text_lower = text.lower()
    for skill in COMMON_SKILLS:
        # Avoid matching partial words (e.g. matching 'c' in 'cat')
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            entities["SKILLS"].append(skill)
            
    return entities

def extract_education(text: str) -> List[str]:
    """
    Very basic heuristic-based education extraction.
    Looks for common degree indicators.
    """
    education = []
    text_lower = text.lower()
    
    degree_keywords = ["bachelor", "master", "phd", "b.s", "m.s", "b.a", "b.tech", "m.tech"]
    
    lines = text.split('\n')
    for line in lines:
        for kw in degree_keywords:
            if kw in line.lower():
                education.append(line.strip())
                break # Only add the line once
                
    return education

def process_resume_text(text: str) -> Dict[str, Any]:
    """
    Main orchestrator for processing extracted resume text using basic NLP.
    """
    entities = extract_entities_spacy(text)
    education = extract_education(text)
    
    # We could organize the ORGs into Universities vs Companies depending on keywords context
    
    return {
        "entities": entities,
        "education": education
    }
