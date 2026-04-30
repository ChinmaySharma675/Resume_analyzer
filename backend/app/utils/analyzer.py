import re
from app.utils.skill_extractor import extract_skills


def analyze_resume(text):
    if not text:
        text = ""

    text_lower = text.lower()
    words = text.split()
    word_count = len(words)

    # ── CONTACT INFO ──
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text))
    has_phone = bool(re.search(r'[\+\(]?[\d\s\-\(\)]{9,15}', text))
    has_linkedin = "linkedin.com" in text_lower
    has_github = "github.com" in text_lower

    # ── SECTIONS ──
    has_education = any(w in text_lower for w in ['education', 'university', 'college', 'bachelor', 'master', 'degree', 'btech', 'b.tech'])
    has_experience = any(w in text_lower for w in ['experience', 'employment', 'work history', 'internship', 'intern'])
    has_projects = bool(re.search(r'\bproject', text_lower))
    has_skills = any(w in text_lower for w in ['skills', 'technologies', 'tools', 'languages', 'tech stack'])
    has_summary = any(w in text_lower for w in ['summary', 'objective', 'profile', 'about me', 'about'])
    has_cert = any(w in text_lower for w in ['certification', 'achievement', 'award', 'certificate', 'honor', 'coursera', 'nptel', 'udemy'])

    # ── QUALITY ANALYSIS ──
    action_verbs = ['developed', 'implemented', 'designed', 'optimized', 'led', 'managed',
                    'created', 'built', 'resolved', 'improved', 'architected', 'deployed',
                    'automated', 'launched', 'delivered', 'engineered', 'integrated', 'migrated']
    found_verbs = [v for v in action_verbs if v in text_lower]
    verb_count = len(found_verbs)

    has_metrics = bool(re.search(r'\d+\s*(%|percent|users|clients|projects|hours|k\b|\$)', text_lower))
    metrics_count = len(re.findall(r'\d+\s*(%|percent|users|clients|projects|hours|k\b|\$)', text_lower))

    # Weak phrases
    weak_phrases = ['responsible for', 'helped with', 'worked on', 'assisted', 'familiar with', 'knowledge of']
    found_weak = [p for p in weak_phrases if p in text_lower]

    # CGPA
    cgpa_match = re.search(r'(cgpa|gpa)[\s:]*(\d+\.?\d*)', text_lower)
    cgpa_value = float(cgpa_match.group(2)) if cgpa_match else None

    extracted_skills = extract_skills(text)
    skill_count = len(extracted_skills)

    has_soft_skills = any(w in text_lower for w in ['leadership', 'communication', 'teamwork', 'problem-solving', 'agile', 'collaboration'])

    # ── SCORING ──
    suggestions = []
    score = 0

    # 1. Formatting & Contact (10 pts)
    format_score = 10
    if not has_email:
        format_score -= 3
        suggestions.append({"text": "Your resume is missing an email address — this is the first thing recruiters look for. Add it to the header.", "category": "Formatting", "priority": "High Priority"})
    if not has_phone:
        format_score -= 2
        suggestions.append({"text": "Add your phone number. Many recruiters call directly instead of emailing.", "category": "Formatting", "priority": "High Priority"})
    if not has_linkedin:
        format_score -= 2
        suggestions.append({"text": "Add your LinkedIn URL. Recruiters cross-check resumes on LinkedIn — a missing link is a red flag.", "category": "Formatting", "priority": "Medium Priority"})
    if not has_github:
        format_score -= 2
        suggestions.append({"text": "Add your GitHub profile link. For tech roles, code visibility is as important as the resume itself.", "category": "Formatting", "priority": "Medium Priority"})
    if not has_summary:
        suggestions.append({"text": "Add a 2-3 line Professional Summary at the top. It's your elevator pitch — tell the recruiter who you are and what you're targeting.", "category": "Formatting", "priority": "Medium Priority"})
    score += max(0, format_score)

    # 2. Education (15 pts)
    edu_score = 15
    if not has_education:
        edu_score = 0
        suggestions.append({"text": "Add an Education section with your degree, university name, and graduation year.", "category": "Education", "priority": "High Priority"})
    else:
        if not cgpa_value:
            suggestions.append({"text": "Include your CGPA/GPA in the Education section. Many companies have minimum CGPA filters (7.0–7.5) and will auto-reject without it.", "category": "Education", "priority": "Low Priority"})
            edu_score -= 3
        elif cgpa_value < 7.0:
            suggestions.append({"text": f"Your CGPA ({cgpa_value}) is below 7.0. Many companies filter at 7.5+. Compensate with strong projects, certifications, and quantified achievements.", "category": "Education", "priority": "Medium Priority"})
            edu_score -= 5
        elif cgpa_value >= 8.5:
            edu_score = 15  # Full marks for high CGPA
    score += max(0, edu_score)

    # 3. Skills (25 pts)
    skills_score = 25
    if not has_skills:
        skills_score = 0
        suggestions.append({"text": "Add a dedicated Skills section. List programming languages, frameworks, databases, and tools clearly.", "category": "Skills", "priority": "High Priority"})
    else:
        if skill_count < 5:
            skills_score -= 10
            suggestions.append({"text": f"Only {skill_count} recognizable tech skills detected. Expand your Skills section with more tools, languages, and frameworks you know.", "category": "Skills", "priority": "High Priority"})
        elif skill_count < 10:
            skills_score -= 5
            suggestions.append({"text": f"You have {skill_count} tech skills listed. Consider adding tools like Git, VS Code, Postman, or Linux if you use them.", "category": "Skills", "priority": "Medium Priority"})
        if not has_soft_skills:
            skills_score -= 5
            suggestions.append({"text": "Add soft skills (teamwork, leadership, agile, communication). Many job descriptions require these and ATS systems scan for them.", "category": "Skills", "priority": "Low Priority"})
    score += max(0, skills_score)

    # 4. Projects / Experience (25 pts)
    # STRICT CHECK: Don't just look for keywords — verify actual section content
    exp_score = 0

    # Extract actual section text to verify depth
    project_section_text = _extract_section_text(text_lower, ['project', 'projects', 'portfolio'])
    experience_section_text = _extract_section_text(text_lower, ['experience', 'employment', 'work history', 'internship'])

    # Count real content indicators
    project_bullets = len(re.findall(r'[\n\r]\s*[\-•\*▪►]', project_section_text)) if project_section_text else 0
    project_lines = len([l for l in project_section_text.split('\n') if l.strip()]) if project_section_text else 0
    project_words = len(project_section_text.split()) if project_section_text else 0

    experience_bullets = len(re.findall(r'[\n\r]\s*[\-•\*▪►]', experience_section_text)) if experience_section_text else 0
    experience_lines = len([l for l in experience_section_text.split('\n') if l.strip()]) if experience_section_text else 0
    experience_words = len(experience_section_text.split()) if experience_section_text else 0

    has_real_projects = has_projects and project_words > 30
    has_real_experience = has_experience and experience_words > 30

    if not has_experience and not has_projects:
        exp_score = 0
        suggestions.append({"text": "Your resume has no Projects or Experience section — this is a critical gap. Add at least 2 personal or academic projects with tech stack and outcomes.", "category": "Experience", "priority": "High Priority"})
    elif not has_real_projects and not has_real_experience:
        # Keywords exist but no real content
        exp_score = 3
        if has_experience and not has_real_experience:
            suggestions.append({"text": f"Your Experience section is too brief ({experience_words} words). Add detailed bullet points: what you did, what tech you used, and what the outcome was.", "category": "Experience", "priority": "High Priority"})
        if has_projects and not has_real_projects:
            suggestions.append({"text": f"Your Projects section is too brief ({project_words} words). Each project needs: name, tech stack, your role, and 2-3 bullet points of what you built.", "category": "Experience", "priority": "High Priority"})
        if not has_projects:
            suggestions.append({"text": "No Projects section found. For freshers, projects are your experience — list 2-3 with the tech stack and what you built.", "category": "Experience", "priority": "High Priority"})
    else:
        # Has at least one real section — score based on quality
        if has_real_experience:
            if experience_bullets >= 4:
                exp_score += 12
            elif experience_lines >= 3:
                exp_score += 9
            else:
                exp_score += 6
                suggestions.append({"text": f"Experience section has only {experience_lines} lines. Expand with bullet points describing your responsibilities and achievements.", "category": "Experience", "priority": "Medium Priority"})
        elif has_experience:
            exp_score += 3
            suggestions.append({"text": "Experience mentioned but lacks detail. Add job title, company, duration, and 3-4 bullet points per role.", "category": "Experience", "priority": "High Priority"})
        else:
            suggestions.append({"text": "No Work Experience or Internship found. Even a 1-month internship or freelance project significantly improves interview call rates.", "category": "Experience", "priority": "Medium Priority"})

        if has_real_projects:
            if project_bullets >= 4:
                exp_score += 13
            elif project_lines >= 3:
                exp_score += 10
            else:
                exp_score += 7
                suggestions.append({"text": f"Projects section has only {project_lines} lines. Add more detail: tech used, features built, and measurable outcomes.", "category": "Experience", "priority": "Medium Priority"})
        elif has_projects:
            exp_score += 3
            suggestions.append({"text": "Projects mentioned but lack detail. Each project needs: project name, tech stack, what you built, and impact (e.g., 'served 200+ users').", "category": "Experience", "priority": "High Priority"})
        else:
            suggestions.append({"text": "No Projects section found. For freshers, projects are your experience — list 2-3 with the tech stack and what you built.", "category": "Experience", "priority": "Medium Priority"})

        # Bonus checks
        if (has_real_projects or has_real_experience) and not has_metrics:
            exp_score -= 3
            suggestions.append({"text": "Your projects/experience lack measurable outcomes. Add numbers: users, performance improvements, records processed. Example: 'Built REST API serving 500+ requests/day.'", "category": "Experience", "priority": "Medium Priority"})

    exp_score = max(0, min(exp_score, 25))
    score += exp_score

    # 5. Impact Language (15 pts)
    impact_score = 15
    if found_weak:
        replacements = {
            'responsible for': "'Led' or 'Owned'",
            'helped with': "'Contributed to'",
            'worked on': "'Developed' or 'Built'",
            'assisted': "'Supported' or 'Accelerated'",
            'familiar with': "'Proficient in'",
            'knowledge of': "'Skilled in'"
        }
        w = found_weak[0]
        impact_score -= 5
        suggestions.append({"text": f"Replace '{w}' with a stronger phrase like {replacements.get(w, 'an action verb')}. Passive language weakens your resume significantly.", "category": "Impact", "priority": "High Priority"})
    if verb_count < 3:
        impact_score -= 8
        suggestions.append({"text": "Too few action verbs. Start every bullet point with: Developed, Built, Engineered, Optimized, Automated, Deployed, Designed, or Integrated.", "category": "Impact", "priority": "Medium Priority"})
    elif verb_count < 6:
        impact_score -= 3
        suggestions.append({"text": f"You use {verb_count} action verbs — aim for 8-10. Vary them: try 'architected', 'streamlined', 'automated', 'refactored'.", "category": "Impact", "priority": "Low Priority"})
    if not has_metrics:
        impact_score -= 5
        suggestions.append({"text": "No quantified achievements found. Add at least 3 numbers to your resume — users, performance %, lines of code, team size, or project scale.", "category": "Impact", "priority": "Medium Priority"})
    score += max(0, impact_score)

    # 6. Certifications (10 pts)
    cert_score = 10
    if not has_cert:
        cert_score -= 5
        suggestions.append({"text": "Add at least one certification. Free options: NPTEL, Google (free digital certs), Kaggle Learn, freeCodeCamp, or Coursera (audit for free).", "category": "General", "priority": "Low Priority"})
    score += max(0, cert_score)

    # Short resume penalty
    if word_count < 100:
        score = max(score - 20, 2)
        suggestions.insert(0, {"text": f"Your resume is too short ({word_count} words). A good technical resume needs 400-600 words. Expand your projects and skills sections.", "category": "Formatting", "priority": "High Priority"})

    sections_detected = sum([has_education, has_experience, has_projects, has_skills, has_cert])

    # ══════════════════════════════════════════════
    # POSITIVE FEEDBACK for strong resumes
    # ══════════════════════════════════════════════
    improvement_count = len(suggestions)
    praise = []

    if skill_count >= 10:
        praise.append({"text": f"✅ Impressive skill coverage — {skill_count} technologies detected including {', '.join(extracted_skills[:3])}. This gives strong ATS keyword matching.", "category": "Strength", "priority": "Positive"})
    elif skill_count >= 5:
        praise.append({"text": f"✅ Good skill foundation — {skill_count} skills found ({', '.join(extracted_skills[:3])}). Consider expanding with related tools.", "category": "Strength", "priority": "Positive"})

    if verb_count >= 6:
        praise.append({"text": f"✅ Excellent action language — {verb_count} strong verbs found ({', '.join(found_verbs[:3])}). Your descriptions convey ownership and impact.", "category": "Strength", "priority": "Positive"})

    if has_metrics and metrics_count >= 3:
        praise.append({"text": f"✅ Well-quantified resume — {metrics_count} measurable outcomes detected. Numbers make your achievements concrete and memorable.", "category": "Strength", "priority": "Positive"})

    if has_email and has_phone and has_linkedin and has_github:
        praise.append({"text": "✅ Complete contact information — Email, phone, LinkedIn, and GitHub all present. Recruiters can reach you through multiple channels.", "category": "Strength", "priority": "Positive"})

    if cgpa_value and cgpa_value >= 8.0:
        praise.append({"text": f"✅ Strong academic record — CGPA {cgpa_value} exceeds typical cutoffs (7.0-7.5). This is a major advantage for campus placements.", "category": "Strength", "priority": "Positive"})

    if has_education and has_experience and has_projects and has_skills:
        praise.append({"text": "✅ Well-structured resume — All critical sections (Education, Experience, Projects, Skills) are present. This is the standard recruiters expect.", "category": "Strength", "priority": "Positive"})

    if has_summary:
        praise.append({"text": "✅ Professional summary present — This gives recruiters an immediate overview of your profile in the first 6 seconds of screening.", "category": "Strength", "priority": "Positive"})

    # Next-level tips for high-scoring resumes
    next_level = []
    if improvement_count <= 2:
        if extracted_skills:
            next_level.append({"text": f"🚀 Next level: Build a portfolio website (yourname.dev) showcasing your best {extracted_skills[0]} projects. Personal sites increase callbacks by 30%+.", "category": "Career Growth", "priority": "Tip"})
        if has_github:
            next_level.append({"text": "🚀 Next level: Contribute to open-source projects. Even small pull requests demonstrate collaboration and code quality — highly valued by top companies.", "category": "Career Growth", "priority": "Tip"})
        if has_cert:
            next_level.append({"text": "🚀 Next level: Get cloud-certified (AWS/Azure/GCP). Cloud certifications are the fastest way to increase salary offers by 15-20%.", "category": "Career Growth", "priority": "Tip"})
        next_level.append({"text": "🚀 Next level: Tailor your resume for each application. Mirror the job description's exact keywords and reorder your skills to match their priorities.", "category": "Career Growth", "priority": "Tip"})

    # Combine: praise first, then improvements, then tips
    final_praise = praise[:3]
    final_next = next_level[:2] if improvement_count <= 2 else []
    suggestions = final_praise + suggestions + final_next

    return {
        "score": score,
        "word_count": word_count,
        "sections_detected": sections_detected,
        "section_breakdown": [
            {
                "name": "Skills & Technologies",
                "score": skills_score,
                "max": 25,
                "message": f"Strong: {skill_count} skills detected including {', '.join(extracted_skills[:3])}." if skills_score >= 20 else f"Only {skill_count} skills found. Expand your Skills section."
            },
            {
                "name": "Projects & Portfolio",
                "score": exp_score,
                "max": 25,
                "message": (
                    f"Projects: {project_words} words, {project_bullets} bullets. Experience: {experience_words} words." if (has_real_projects or has_real_experience)
                    else "No substantial projects or experience section found. Add detailed project descriptions."
                )
            },
            {
                "name": "Education",
                "score": edu_score,
                "max": 15,
                "message": f"Education found{f' — CGPA: {cgpa_value}' if cgpa_value else ' — consider adding CGPA'}." if has_education else "Education section missing."
            },
            {
                "name": "Impact & Action Language",
                "score": impact_score,
                "max": 15,
                "message": f"Good: {verb_count} action verbs found, {metrics_count} metrics." if impact_score >= 12 else f"Weak: only {verb_count} action verbs, {metrics_count} metrics. Add more."
            },
            {
                "name": "Formatting & Structure",
                "score": format_score,
                "max": 10,
                "message": "Good structure with all key contact details." if format_score >= 8 else "Missing contact info (email, phone, LinkedIn, GitHub)."
            },
            {
                "name": "Certifications & Achievements",
                "score": cert_score,
                "max": 10,
                "message": "Certifications/achievements found — great for standing out." if cert_score >= 8 else "No certifications detected. Add free certs from NPTEL or Google."
            }
        ],
        "suggestions": sorted(suggestions, key=lambda x: 0 if x['priority'] == 'Positive' else 1 if x['priority'] == 'High Priority' else 2 if x['priority'] == 'Medium Priority' else 3 if x['priority'] == 'Low Priority' else 4)
    }


def _extract_section_text(text, headers):
    """Extract actual text content under a section header.
    Returns the section content (not just True/False) so we can measure depth."""
    for header in headers:
        # Look for the header as a line or section title
        pattern = rf'(?:^|\n)\s*{re.escape(header)}s?\s*[:\-—\n]'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            start = match.end()
            # Find the next section header (all-caps word or title-case followed by colon)
            next_section = re.search(
                r'\n\s*[A-Z][A-Za-z\s&]{2,30}\s*[:\-—\n]',
                text[start:]
            )
            if next_section:
                return text[start:start + next_section.start()].strip()
            return text[start:].strip()
    return ""
