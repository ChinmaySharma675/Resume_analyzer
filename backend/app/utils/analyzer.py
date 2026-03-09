import re

def analyze_resume(text):
    if not text:
        text = ""
        
    text_lower = text.lower()
    
    # Basic Checks
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+', text))
    has_phone = bool(re.search(r'\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{10}', text))
    has_linkedin = "linkedin.com" in text_lower
    has_github = "github.com" in text_lower
    
    # Section Checks
    has_education = any(word in text_lower for word in ['education', 'university', 'college', 'bachelor', 'master', 'degree'])
    has_experience = any(word in text_lower for word in ['experience', 'employment', 'work history', 'internship'])
    has_projects = bool(re.search(r'\bproject', text_lower))
    has_skills = any(word in text_lower for word in ['skills', 'technologies', 'tools', 'languages'])
    
    # Impact Language
    words = text.split()
    word_count = len(words)
    action_verbs = ['developed', 'implemented', 'designed', 'optimized', 'led', 'managed', 'created', 'built', 'resolved', 'improved']
    verb_count = sum(1 for word in words if word.lower() in action_verbs)
    has_metrics = bool(re.search(r'\d+%|\$\d+|\d+ users', text_lower))
    
    score = 0
    suggestions = []
    
    # 1. Formatting & Contact
    format_score = 10
    if not has_email:
        format_score -= 3
        suggestions.append({"text": "Include your email address for contact information.", "category": "Formatting", "priority": "High Priority"})
    if not has_phone:
        format_score -= 3
        suggestions.append({"text": "Include your phone number for contact information.", "category": "Formatting", "priority": "High Priority"})
    if not has_linkedin:
        format_score -= 2
        suggestions.append({"text": "Add a link to your LinkedIn profile.", "category": "Formatting", "priority": "Medium Priority"})
    if not has_github:
        format_score -= 2
        suggestions.append({"text": "Add a link to your GitHub profile (especially for tech roles).", "category": "Formatting", "priority": "Medium Priority"})
    score += max(0, format_score)
    
    # 2. Education
    edu_score = 15
    if not has_education:
        edu_score = 0
        suggestions.append({"text": "Add an Education section with your degree and university details.", "category": "Education", "priority": "High Priority"})
    elif word_count > 0 and len(re.findall(r'\b(gpa|cgpa)\b', text_lower)) == 0:
        edu_score -= 5
        suggestions.append({"text": "Consider adding your GPA/CGPA if it is above average.", "category": "Education", "priority": "Low Priority"})
    score += max(0, edu_score)
    
    from app.utils.skill_extractor import extract_skills
    extracted_skills = extract_skills(text)
    
    # 3. Skills
    skills_score = 25
    if len(extracted_skills) > 15:
        skills_score = 24
    elif not has_skills:
        skills_score = 0
        suggestions.append({"text": "Add a dedicated Skills section listing your top technologies.", "category": "Skills", "priority": "High Priority"})
    else:
        has_soft_skills = any(word in text_lower for word in ['leadership', 'communication', 'teamwork', 'problem-solving', 'agile'])
        if not has_soft_skills:
            skills_score -= 7
            suggestions.append({"text": "Include soft skills like leadership, communication, and problem-solving to show well-roundedness.", "category": "Skills", "priority": "Medium Priority"})
    score += max(0, skills_score)
    
    # 4. Projects / Experience
    exp_score = 25
    if not has_experience and not has_projects:
        exp_score = 0
        suggestions.append({"text": "Add Projects or Experience section to showcase your practical work.", "category": "Experience", "priority": "High Priority"})
    else:
        if not has_experience:
            exp_score -= 5
        if not has_projects:
            exp_score -= 5
            suggestions.append({"text": "Consider adding a Projects section if you lack professional experience.", "category": "Experience", "priority": "Medium Priority"})
    score += max(0, exp_score)
    
    # 5. Impact Language
    impact_score = 15
    if verb_count < 3:
        impact_score -= 8
        suggestions.append({"text": "Use strong action verbs like 'developed', 'implemented', 'optimized' to describe your accomplishments.", "category": "Impact", "priority": "Medium Priority"})
    if not has_metrics:
        impact_score -= 7
        suggestions.append({"text": "Quantify your achievements with numbers, percentages, or metrics (e.g., 'reduced load time by 40%').", "category": "Impact", "priority": "Medium Priority"})
    score += max(0, impact_score)
    
    # 6. Certifications & Achievements
    cert_score = 10
    has_cert = any(word in text_lower for word in ['certification', 'achievement', 'award', 'certificate', 'honor'])
    if not has_cert:
        cert_score -= 3
        suggestions.append({"text": "Include Certifications or Achievements to stand out.", "category": "General", "priority": "Low Priority"})
    score += max(0, cert_score)
    
    sections_detected = sum([has_education, has_experience, has_projects, has_skills, has_cert])
    
    if word_count < 20:
        score = 2
        cert_score = 0
        impact_score = 2
    
    return {
        "score": score,
        "word_count": word_count,
        "sections_detected": sections_detected,
        "section_breakdown": [
            {"name": "Skills & Technologies", "score": skills_score, "max": 25, "message": "Good skills listed." if skills_score >= 20 else "Add more relevant technologies and soft skills."},
            {"name": "Projects & Portfolio", "score": exp_score, "max": 25, "message": "Good project descriptions found." if exp_score >= 20 else "Add more details to projects."},
            {"name": "Education", "score": edu_score, "max": 15, "message": "Education well formulated." if edu_score >= 12 else "Education mentioned but could include more details like GPA."},
            {"name": "Impact & Action Language", "score": impact_score, "max": 15, "message": "Good action language." if impact_score >= 15 else "Use stronger action verbs and quantify your impact."},
            {"name": "Formatting & Structure", "score": format_score, "max": 10, "message": "Decent structure. Ensure all key sections are present." if format_score >= 7 else "Formatting needs improvement."},
            {"name": "Certifications & Achievements", "score": cert_score, "max": 10, "message": "Certifications listed." if cert_score >= 8 else "Consider adding more extra-curriculars."}
        ],
        "suggestions": sorted(suggestions, key=lambda x: 0 if x['priority'] == 'High Priority' else 1 if x['priority'] == 'Medium Priority' else 2)
    }
