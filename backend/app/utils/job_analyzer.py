"""
Job-Description-Aware Resume Analyzer.
Advanced personalized suggestions based on deep resume analysis.
All free — no paid APIs used.
"""
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.utils.skill_extractor import extract_skills


def analyze_resume_against_job(resume_text, job_description):
    if not resume_text:
        resume_text = ""
    if not job_description:
        job_description = ""

    resume_lower = resume_text.lower()
    job_lower = job_description.lower()

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)
    job_keywords = _extract_job_keywords(job_description)

    # ==============================
    # 1. SKILL MATCH (40 points)
    # ==============================
    resume_skills_lower = set(s.lower() for s in resume_skills)

    matched_keywords = []
    missing_keywords = []

    for skill in job_skills:
        if skill.lower() in resume_skills_lower:
            matched_keywords.append(skill)
        else:
            missing_keywords.append(skill)

    already_counted = set(s.lower() for s in matched_keywords + missing_keywords)
    for kw in job_keywords:
        if kw.lower() not in already_counted:
            if kw.lower() in resume_lower:
                matched_keywords.append(kw)
            else:
                missing_keywords.append(kw)

    total_job_kw = len(matched_keywords) + len(missing_keywords)
    dict_score = len(matched_keywords) / total_job_kw if total_job_kw > 0 else 0.5

    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        vectors = vectorizer.fit_transform([resume_text, job_description])
        tfidf_score = cosine_similarity(vectors)[0][1]
    except Exception:
        tfidf_score = 0.0

    skill_match = round(min((dict_score * 0.7 + tfidf_score * 0.3) * 40, 40), 1)

    # ==============================
    # 2. PROJECT RELEVANCE (25 points)
    # ==============================
    project_section = _extract_section(resume_lower, ['project', 'projects', 'portfolio', 'work'])

    if not project_section:
        project_score = 5.0
    else:
        relevant_count = 0
        check_list = job_skills if job_skills else job_keywords
        total_check = max(len(check_list), 1)
        for skill in check_list:
            if skill.lower() in project_section:
                relevant_count += 1
        project_ratio = relevant_count / total_check
        project_score = round(min(project_ratio * 20 + 5, 25), 1)

    # ==============================
    # 3. EDUCATION (20 points)
    # ==============================
    degree_keywords = [
        'b.tech', 'btech', 'b.e.', 'b.e ', 'mca', 'bca', 'b.sc', 'bsc',
        'm.tech', 'mtech', 'm.e.', 'mba', 'bachelor', 'master', 'phd',
        'computer science', 'information technology', 'engineering',
        'university', 'college', 'degree', 'diploma'
    ]
    has_degree = any(kw in resume_lower for kw in degree_keywords)
    has_edu_section = any(w in resume_lower for w in ['education', 'academic', 'qualification'])

    if has_degree and has_edu_section:
        education_score = 20.0
    elif has_degree:
        education_score = 15.0
    elif has_edu_section:
        education_score = 10.0
    else:
        education_score = 5.0

    # ==============================
    # 4. CERTIFICATIONS (15 points)
    # ==============================
    cert_keywords = [
        'certification', 'certified', 'certificate', 'credential',
        'aws certified', 'google certified', 'microsoft certified',
        'coursera', 'udemy', 'edx', 'nptel', 'achievement', 'award',
        'honor', 'hackathon', 'competition'
    ]
    cert_count = sum(1 for kw in cert_keywords if kw in resume_lower)

    if cert_count >= 3:
        cert_score = 15.0
    elif cert_count >= 2:
        cert_score = 12.0
    elif cert_count >= 1:
        cert_score = 8.0
    else:
        cert_score = 3.0

    # ==============================
    # OVERALL SCORE
    # ==============================
    overall_score = round(skill_match + project_score + education_score + cert_score)
    overall_score = max(5, min(overall_score, 100))

    # ==============================
    # DEEP PERSONALIZED SUGGESTIONS
    # ==============================
    resume_profile = _build_resume_profile(resume_text, resume_lower, resume_skills)
    job_profile = _build_job_profile(job_description, job_lower, job_skills, job_keywords)

    suggestions = _generate_advanced_suggestions(
        resume_profile=resume_profile,
        job_profile=job_profile,
        matched_keywords=matched_keywords,
        missing_keywords=missing_keywords,
        skill_match=skill_match,
        project_score=project_score,
        education_score=education_score,
        cert_count=cert_count,
        project_section=project_section,
        tfidf_score=tfidf_score
    )

    return {
        "overall_score": overall_score,
        "skill_match": round(skill_match, 1),
        "skill_match_max": 40,
        "project_relevance": round(project_score, 1),
        "project_relevance_max": 25,
        "education": round(education_score, 1),
        "education_max": 20,
        "certifications": round(cert_score, 1),
        "certifications_max": 15,
        "matched_keywords": list(set(matched_keywords)),
        "missing_keywords": list(set(missing_keywords)),
        "resume_skills": resume_skills,
        "suggestions": suggestions
    }


def _build_resume_profile(text, text_lower, skills):
    """Deep analysis of what the resume actually contains."""
    words = text.split()
    word_count = len(words)

    # Contact info
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text))
    has_phone = bool(re.search(r'[\+\(]?[\d\s\-\(\)]{9,15}', text))
    has_linkedin = 'linkedin.com' in text_lower
    has_github = 'github.com' in text_lower

    # Sections
    has_summary = any(w in text_lower for w in ['summary', 'objective', 'profile', 'about me'])
    has_experience = any(w in text_lower for w in ['experience', 'employment', 'work history', 'internship', 'intern'])
    has_projects = bool(re.search(r'\bproject', text_lower))
    has_education = any(w in text_lower for w in ['education', 'university', 'college', 'bachelor', 'master', 'degree', 'btech', 'b.tech'])
    has_certifications = any(w in text_lower for w in ['certification', 'certified', 'certificate', 'coursera', 'udemy', 'nptel'])
    has_achievements = any(w in text_lower for w in ['achievement', 'award', 'honor', 'hackathon', 'winner', 'rank'])

    # Quality checks
    action_verbs = ['developed', 'implemented', 'designed', 'built', 'created', 'optimized',
                    'led', 'managed', 'architected', 'deployed', 'automated', 'improved',
                    'reduced', 'increased', 'launched', 'delivered', 'collaborated',
                    'engineered', 'integrated', 'migrated', 'refactored', 'tested']
    found_verbs = [v for v in action_verbs if v in text_lower]
    verb_count = len(found_verbs)

    # Quantification
    metrics_found = re.findall(r'\d+\s*(%|percent|users|clients|projects|hours|days|weeks|months|\$|dollars|lakh|crore|k\b)', text_lower)
    has_metrics = len(metrics_found) > 0
    metrics_count = len(metrics_found)

    # Internship/Experience level detection
    has_internship = 'intern' in text_lower
    experience_years = re.findall(r'(\d+)\+?\s*year', text_lower)

    # CGPA/GPA
    has_cgpa = bool(re.search(r'(cgpa|gpa)[\s:]*\d+\.?\d*', text_lower))
    cgpa_match = re.search(r'(cgpa|gpa)[\s:]*(\d+\.?\d*)', text_lower)
    cgpa_value = float(cgpa_match.group(2)) if cgpa_match else None

    # Project count
    project_count = len(re.findall(r'\bproject\s*\d+|\d+\s*project|\bproject[:—\-]', text_lower))

    # Weak language patterns
    weak_phrases = ['responsible for', 'helped with', 'worked on', 'assisted', 'familiar with', 'knowledge of']
    found_weak = [p for p in weak_phrases if p in text_lower]

    # Tech stack detected
    tech_count = len(skills)

    return {
        'word_count': word_count,
        'has_email': has_email,
        'has_phone': has_phone,
        'has_linkedin': has_linkedin,
        'has_github': has_github,
        'has_summary': has_summary,
        'has_experience': has_experience,
        'has_projects': has_projects,
        'has_education': has_education,
        'has_certifications': has_certifications,
        'has_achievements': has_achievements,
        'found_verbs': found_verbs,
        'verb_count': verb_count,
        'has_metrics': has_metrics,
        'metrics_count': metrics_count,
        'has_internship': has_internship,
        'experience_years': experience_years,
        'has_cgpa': has_cgpa,
        'cgpa_value': cgpa_value,
        'project_count': project_count,
        'found_weak': found_weak,
        'tech_count': tech_count,
        'skills': skills
    }


def _build_job_profile(text, text_lower, skills, keywords):
    """Analyze what kind of role and seniority the job requires."""
    # Seniority detection
    is_senior = any(w in text_lower for w in ['senior', 'lead', 'principal', 'architect', 'head of', 'manager'])
    is_junior = any(w in text_lower for w in ['junior', 'entry level', 'fresher', 'graduate', 'trainee', '0-1 year', '0-2 year'])
    is_internship = any(w in text_lower for w in ['intern', 'internship', 'trainee'])

    # Domain detection
    is_ml = any(w in text_lower for w in ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'data scientist', 'nlp', 'neural'])
    is_web = any(w in text_lower for w in ['react', 'angular', 'vue', 'frontend', 'full stack', 'node.js', 'html', 'css'])
    is_backend = any(w in text_lower for w in ['backend', 'api', 'microservices', 'django', 'flask', 'spring', 'rest'])
    is_devops = any(w in text_lower for w in ['docker', 'kubernetes', 'devops', 'ci/cd', 'jenkins', 'terraform', 'aws', 'azure', 'gcp'])
    is_data = any(w in text_lower for w in ['data analyst', 'sql', 'tableau', 'power bi', 'excel', 'analytics'])
    is_mobile = any(w in text_lower for w in ['android', 'ios', 'flutter', 'react native', 'kotlin', 'swift'])

    # Requirements
    requires_experience = bool(re.search(r'\d+\+?\s*year', text_lower))
    required_years_match = re.search(r'(\d+)\+?\s*year', text_lower)
    required_years = int(required_years_match.group(1)) if required_years_match else 0

    requires_degree = any(w in text_lower for w in ['bachelor', 'b.tech', 'degree', 'graduate'])
    requires_github = 'github' in text_lower
    requires_portfolio = any(w in text_lower for w in ['portfolio', 'github', 'projects'])

    # Must-have vs nice-to-have skills
    required_section = _extract_section(text_lower, ['required', 'must have', 'requirements', 'mandatory', 'qualifications'])
    preferred_section = _extract_section(text_lower, ['preferred', 'nice to have', 'bonus', 'plus', 'desired'])

    return {
        'is_senior': is_senior,
        'is_junior': is_junior,
        'is_internship': is_internship,
        'is_ml': is_ml,
        'is_web': is_web,
        'is_backend': is_backend,
        'is_devops': is_devops,
        'is_data': is_data,
        'is_mobile': is_mobile,
        'requires_experience': requires_experience,
        'required_years': required_years,
        'requires_degree': requires_degree,
        'requires_github': requires_github,
        'requires_portfolio': requires_portfolio,
        'skills': skills,
        'keywords': keywords
    }


def _generate_advanced_suggestions(resume_profile, job_profile, matched_keywords,
                                   missing_keywords, skill_match, project_score,
                                   education_score, cert_count, project_section, tfidf_score):
    """
    Generate highly personalized suggestions based ONLY on what's actually in the resume.
    Never uses fake example text — every reference comes from the actual resume content.
    """
    suggestions = []
    r = resume_profile
    j = job_profile
    top_missing = missing_keywords[:4]

    # ── 1. CRITICAL MISSING SKILLS (from actual JD) ──
    if top_missing:
        if len(top_missing) == 1:
            suggestions.append(
                f"Critical gap: '{top_missing[0]}' is required in the job description but not found "
                f"anywhere in your resume. Add it to your Skills section if you have any experience with it."
            )
        else:
            missing_str = "', '".join(top_missing[:3])
            suggestions.append(
                f"Your resume is missing {len(missing_keywords)} skills from this job description. "
                f"Top priority: '{missing_str}'. Add these to your Skills section."
            )

    # ── 2. SENIORITY MISMATCH ──
    if j['is_senior'] and not r['has_experience']:
        suggestions.append(
            "This is a Senior-level role but your resume has no Experience section. "
            "Add internships, freelance work, or academic projects with dates and duration."
        )
    elif j['is_senior'] and r['experience_years'] and int(r['experience_years'][0]) < j['required_years']:
        suggestions.append(
            f"This role requires {j['required_years']}+ years. Your resume shows {r['experience_years'][0]} year(s). "
            f"Include all relevant work — internships, part-time, and freelance count too."
        )

    # ── 3. SKILL MATCH QUALITY ──
    match_pct = round((len(matched_keywords) / max(len(matched_keywords) + len(missing_keywords), 1)) * 100)
    if skill_match < 15 and top_missing:
        suggestions.append(
            f"Only {match_pct}% of required skills match your resume. "
            f"Focus on learning: {', '.join(top_missing[:2])} — these are core requirements for this role."
        )
    elif skill_match < 25 and matched_keywords:
        suggestions.append(
            f"You match {match_pct}% of required skills (found: {', '.join(matched_keywords[:3])}). "
            f"Add the missing ones and write a summary specifically mentioning this role type."
        )

    # ── 4. GITHUB / PORTFOLIO (only if relevant) ──
    if j['requires_github'] and not r['has_github']:
        suggestions.append(
            "This job description mentions GitHub. Add your GitHub URL and ensure "
            "repositories using the required technologies are public and documented."
        )
    elif not r['has_github'] and (j['is_web'] or j['is_backend'] or r['tech_count'] > 3):
        suggestions.append(
            "Your resume lists technical skills but has no GitHub link. "
            "Add it so recruiters can verify your coding ability."
        )

    # ── 5. PROJECT SECTION ──
    if not r['has_projects'] and not r['has_experience']:
        if r['skills']:
            suggestions.append(
                f"Your resume lists skills ({', '.join(r['skills'][:3])}) but has no Projects or Experience section. "
                f"Add 2-3 projects that demonstrate these skills in practice."
            )
    elif not r['has_projects'] and r['has_experience']:
        suggestions.append(
            "You have experience but no Projects section. Adding 1-2 side projects "
            "shows initiative and gives you more keywords for ATS matching."
        )
    elif r['has_projects'] and project_score < 10 and top_missing:
        suggestions.append(
            f"Your projects don't mention '{top_missing[0]}'. If any project uses it, "
            f"explicitly name the technology in the project description."
        )

    # ── 6. DOMAIN-SPECIFIC (only when JD matches a specific domain) ──
    if j['is_ml']:
        ml_in_resume = [s for s in r['skills'] if s.lower() in
                        ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'keras',
                         'machine learning', 'deep learning']]
        if not ml_in_resume:
            suggestions.append(
                "This is an ML/Data Science role but your resume has no ML-related skills. "
                "You need at least Python + one ML library (Scikit-learn, TensorFlow, or PyTorch)."
            )
        elif len(ml_in_resume) < 3:
            suggestions.append(
                f"Your resume has {', '.join(ml_in_resume)} for ML, but this role likely needs more. "
                f"Add libraries you've used: Pandas, NumPy, Matplotlib, or Scikit-learn."
            )

    if j['is_devops']:
        devops_in_resume = [s for s in r['skills'] if s.lower() in
                           ['docker', 'kubernetes', 'jenkins', 'git', 'linux', 'ci/cd', 'terraform', 'aws']]
        if not devops_in_resume:
            suggestions.append(
                "This is a DevOps role but your resume has no DevOps tools listed. "
                "At minimum, add Docker and Linux if you have any experience with them."
            )

    # ── 7. WEAK LANGUAGE (only phrases ACTUALLY in the resume) ──
    if r['found_weak']:
        replacements = {
            'responsible for': 'Led / Managed / Owned',
            'helped with': 'Contributed to / Collaborated on',
            'worked on': 'Developed / Built / Engineered',
            'assisted': 'Supported / Accelerated',
            'familiar with': 'Proficient in / Experienced with',
            'knowledge of': 'Skilled in'
        }
        for weak_phrase in r['found_weak'][:2]:
            stronger = replacements.get(weak_phrase, 'a stronger action verb')
            suggestions.append(
                f"Your resume contains '{weak_phrase}' — replace it with {stronger}. "
                f"Passive language reduces your chances with ATS systems."
            )

    # ── 8. ACTION VERBS (based on actual verb usage) ──
    if r['verb_count'] == 0:
        if r['skills']:
            suggestions.append(
                f"Your resume has zero action verbs. Describe what you DID with your skills. "
                f"For example, with {r['skills'][0]}: 'Developed...', 'Built...', 'Implemented...'"
            )
        else:
            suggestions.append(
                "Your resume has no action verbs. Start descriptions with: "
                "Developed, Built, Designed, Implemented, Deployed, Optimized, or Automated."
            )
    elif r['verb_count'] < 3 and r['found_verbs']:
        suggestions.append(
            f"Only {r['verb_count']} action verb(s) found ({', '.join(r['found_verbs'])}). "
            f"Aim for 8-10. Add verbs like: deployed, automated, integrated, optimized."
        )

    # ── 9. QUANTIFICATION (based on what's actually in resume) ──
    if not r['has_metrics']:
        if r['has_projects'] and r['skills']:
            suggestions.append(
                f"Your resume mentions {r['skills'][0]} but has no measurable outcomes. "
                f"Add numbers to your descriptions: team size, users served, performance improvement %, or data processed."
            )
        elif not r['has_projects']:
            suggestions.append(
                "Your resume has no quantified achievements. "
                "When you add projects, include metrics: users, response time, accuracy %, etc."
            )
    elif r['metrics_count'] < 3:
        suggestions.append(
            f"You have {r['metrics_count']} metric(s) — add more. "
            f"Every project bullet should have at least one number showing impact."
        )

    # ── 10. SUMMARY SECTION ──
    if not r['has_summary']:
        if r['skills'] and matched_keywords:
            suggestions.append(
                f"Add a 2-line summary at the top using your actual skills: "
                f"'{r['skills'][0]}' and '{matched_keywords[0]}' should be mentioned in the first line."
            )
        elif r['skills']:
            suggestions.append(
                f"Add a Professional Summary mentioning your strongest skills "
                f"({', '.join(r['skills'][:2])}) and the type of role you're targeting."
            )

    # ── 11. CGPA (only if education section exists) ──
    if r['has_education'] and not r['has_cgpa']:
        suggestions.append(
            "Your Education section doesn't show CGPA/GPA. "
            "If above 7.0/10 or 3.0/4.0, add it — many companies auto-filter without it."
        )
    elif r['cgpa_value'] and r['cgpa_value'] < 7.0:
        suggestions.append(
            f"Your CGPA ({r['cgpa_value']}) is below typical cutoffs (7.0-7.5). "
            f"Compensate by highlighting strong projects, certifications, and achievements."
        )

    # ── 12. CERTIFICATIONS (domain-specific only) ──
    if cert_count == 0:
        if j['is_ml']:
            suggestions.append(
                "For ML roles, add certifications. Free: Google ML Crash Course, "
                "Kaggle Learn certificates, or Andrew Ng's Coursera course (audit mode is free)."
            )
        elif j['is_web']:
            suggestions.append(
                "For web dev roles, add certifications. Free: freeCodeCamp, "
                "Meta Frontend Developer (Coursera audit), or The Odin Project."
            )
        elif j['is_devops']:
            suggestions.append(
                "For DevOps roles, certifications matter. Consider: "
                "AWS Cloud Practitioner (free prep available) or Google Cloud Associate."
            )
        elif r['tech_count'] > 0:
            suggestions.append(
                "No certifications found. Add one relevant to your skills "
                f"({r['skills'][0] if r['skills'] else 'your domain'}) — NPTEL, Coursera (free audit), or Google certs."
            )

    # ── 13. LINKEDIN (only if missing) ──
    if not r['has_linkedin'] and not r['has_github']:
        suggestions.append(
            "Your resume has no LinkedIn or GitHub links. Add at least one — "
            "recruiters verify online profiles before scheduling interviews."
        )
    elif not r['has_linkedin']:
        suggestions.append(
            "Add your LinkedIn URL. Ensure it matches your resume — "
            "inconsistencies between LinkedIn and resume raise red flags."
        )

    # ── 14. TF-IDF SEMANTIC FEEDBACK ──
    if tfidf_score < 0.1 and matched_keywords:
        suggestions.append(
            f"Your resume language is very different from the job description. "
            f"Use the JD's exact terms — e.g., if the JD says '{missing_keywords[0] if missing_keywords else 'a specific term'}', "
            f"use that exact phrase in your resume instead of a synonym."
        )

    # ── 15. RESUME LENGTH ──
    if r['word_count'] < 100:
        suggestions.append(
            f"Your resume is only {r['word_count']} words — too short for any role. "
            f"A good technical resume needs 400-600 words with detailed project descriptions."
        )
    elif r['word_count'] < 200:
        suggestions.append(
            f"Your resume is short ({r['word_count']} words). "
            f"Expand each project/experience with 2-3 bullet points describing what you built and the outcome."
        )
    elif r['word_count'] > 900:
        suggestions.append(
            f"Your resume is {r['word_count']} words — too long. Keep to 1 page for freshers. "
            f"Remove older or irrelevant items and tighten descriptions."
        )

    # ══════════════════════════════════════════════
    # POSITIVE FEEDBACK & NEXT-LEVEL TIPS
    # For strong resumes — never leave suggestions empty
    # ══════════════════════════════════════════════

    # Count how many improvement suggestions we generated
    improvement_count = len(suggestions)

    # ── PRAISE what's done well (always show at least one) ──
    praise = []

    if len(matched_keywords) > 0:
        match_pct = round((len(matched_keywords) / max(len(matched_keywords) + len(missing_keywords), 1)) * 100)
        if match_pct >= 70:
            praise.append(
                f"✅ Excellent skill alignment — {match_pct}% of the job requirements match your resume "
                f"({', '.join(matched_keywords[:4])}). Your profile is well-suited for this role."
            )
        elif match_pct >= 50:
            praise.append(
                f"✅ Good skill coverage — {match_pct}% match with {len(matched_keywords)} relevant skills found "
                f"({', '.join(matched_keywords[:3])}). You're on the right track."
            )

    if r['verb_count'] >= 6:
        praise.append(
            f"✅ Strong action language — {r['verb_count']} action verbs detected "
            f"({', '.join(r['found_verbs'][:3])}). Your descriptions convey initiative and ownership."
        )

    if r['metrics_count'] >= 3:
        praise.append(
            f"✅ Well-quantified achievements — {r['metrics_count']} measurable outcomes found. "
            f"This helps recruiters quickly see your impact."
        )

    if r['tech_count'] >= 10:
        praise.append(
            f"✅ Comprehensive tech stack — {r['tech_count']} technologies listed. "
            f"This gives you strong ATS keyword coverage across multiple roles."
        )

    if r['has_github'] and r['has_linkedin']:
        praise.append(
            "✅ Professional online presence — Both GitHub and LinkedIn links detected. "
            "Recruiters can verify your profile easily."
        )

    if r['has_education'] and r['has_cgpa'] and r['cgpa_value'] and r['cgpa_value'] >= 8.0:
        praise.append(
            f"✅ Strong academic record — CGPA {r['cgpa_value']} exceeds most company cutoffs. "
            f"This is a significant advantage for campus placements."
        )

    if r['has_summary']:
        praise.append(
            "✅ Professional summary present — This gives recruiters an immediate snapshot of your profile."
        )

    if r['has_projects'] and r['has_experience']:
        praise.append(
            "✅ Both Projects and Experience sections present — "
            "This combination is exactly what recruiters look for in technical candidates."
        )

    # ── NEXT-LEVEL TIPS (for high-scoring resumes with few issues) ──
    next_level = []

    if improvement_count <= 3:
        # Resume is already strong — give advanced career tips
        if r['skills']:
            top_skill = r['skills'][0]
            next_level.append(
                f"🚀 Next level: Build a portfolio website showcasing your best projects with {top_skill}. "
                f"A personal site (yourname.dev) dramatically increases recruiter callbacks."
            )

        if r['has_github']:
            next_level.append(
                "🚀 Next level: Contribute to open-source projects on GitHub. "
                "Even small PRs (documentation fixes, bug reports) show collaboration skills and community involvement."
            )

        if matched_keywords and len(matched_keywords) >= 3:
            next_level.append(
                "🚀 Next level: Write a blog post or tutorial about one of your projects. "
                "Technical blogging demonstrates deep understanding and improves your online visibility."
            )

        if r['tech_count'] >= 8 and not r['found_weak']:
            next_level.append(
                "🚀 Next level: Tailor your resume for each application. "
                "Reorder your skills to match the job description's priority and mirror their exact terminology."
            )

        if r['has_experience'] and r['verb_count'] >= 5:
            next_level.append(
                "🚀 Next level: Add a 'Key Achievements' section at the top with your 3 most impressive "
                "accomplishments — numbers-driven, one line each. This catches a recruiter's eye in 6 seconds."
            )

    # ── Combine: praise first, then improvements, then next-level tips ──
    # Always show at least 2 praise items + any improvements + up to 2 next-level tips
    final_praise = praise[:3]  # max 3 praise items
    final_next = next_level[:2] if improvement_count <= 3 else []  # next-level only for good resumes

    # Build final list
    all_suggestions = final_praise + suggestions + final_next

    # Cap at 10, remove duplicates
    seen = set()
    final_suggestions = []
    for s in all_suggestions:
        key = s[:50].lower()
        if key not in seen:
            seen.add(key)
            final_suggestions.append(s)
        if len(final_suggestions) >= 10:
            break

    return final_suggestions


def _extract_section(text, headers):
    """Try to extract text under a section header."""
    for header in headers:
        pattern = rf'\b{re.escape(header)}s?\b'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            start = match.start()
            next_sec = re.search(
                r'\n\s*[A-Z][A-Za-z\s&]{2,30}\s*[\n:\-—]',
                text[start + len(header):]
            )
            if next_sec:
                return text[start:start + len(header) + next_sec.start()]
            return text[start:]
    return ""


def _extract_job_keywords(job_description):
    """Extract broader keywords from job description beyond our skill dictionary."""
    additional = [
        # Development practices
        'agile', 'scrum', 'kanban', 'git', 'github', 'gitlab', 'bitbucket',
        'linux', 'api', 'rest', 'restful', 'graphql', 'grpc', 'websocket',
        'microservices', 'monolith', 'serverless', 'event driven',
        'testing', 'unit testing', 'integration testing', 'load testing',
        'ci/cd', 'continuous integration', 'continuous deployment',
        'deployment', 'database', 'cloud', 'cloud computing',
        'data structures', 'algorithms', 'oop', 'object oriented',
        'design patterns', 'system design', 'api design', 'clean code',
        'code review', 'pair programming', 'version control',
        'debugging', 'troubleshooting', 'monitoring', 'logging',
        # Soft skills
        'communication', 'teamwork', 'collaboration', 'leadership',
        'problem solving', 'critical thinking', 'time management',
        'presentation', 'stakeholder management', 'mentoring',
        'responsive design', 'cross functional', 'self motivated',
        # Cloud & infra
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
        'containerization', 'orchestration', 'load balancing', 'scaling',
        'high availability', 'disaster recovery', 'infrastructure as code',
        # Data & analytics
        'analytics', 'visualization', 'reporting', 'dashboards',
        'data modeling', 'data warehouse', 'etl', 'data pipeline',
        'big data', 'real time', 'batch processing', 'streaming',
        'machine learning', 'deep learning', 'neural network',
        'natural language processing', 'computer vision', 'ai',
        'model training', 'model deployment', 'feature engineering',
        # Security
        'security', 'authentication', 'authorization', 'encryption',
        'owasp', 'penetration testing', 'vulnerability', 'compliance',
        # Mobile
        'mobile development', 'cross platform', 'responsive',
        'push notifications', 'app store', 'play store',
        # Business
        'requirements gathering', 'documentation', 'technical writing',
        'product management', 'roadmap', 'backlog',
        'performance', 'optimization', 'scalability', 'reliability',
    ]
    found = []
    job_lower = job_description.lower()
    for kw in additional:
        if kw in job_lower:
            found.append(kw.title())
    return found

