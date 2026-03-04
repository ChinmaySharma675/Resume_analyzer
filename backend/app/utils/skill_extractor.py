SKILLS_DB = [
    "python",
    "java",
    "c++",
    "flask",
    "django",
    "machine learning",
    "data analysis",
    "sql",
    "javascript",
    "react",
    "node",
]

def extract_skills(text):

    text = text.lower()
    found_skills = []

    for skill in SKILLS_DB:
        if skill in text:
            found_skills.append(skill)

    return found_skills