import re

SKILLS_DB = {
    "python": "Python",
    "java": "Java",
    "c++": "C++",
    "flask": "Flask",
    "django": "Django",
    "machine learning": "Machine Learning",
    "data analysis": "Data Analysis",
    "sql": "SQL",
    "javascript": "JavaScript",
    "react": "React.js",
    "react.js": "React.js",
    "node": "Node.js",
    "node.js": "Node.js",
    "typescript": "TypeScript",
    "go": "Go (Golang)",
    "golang": "Go (Golang)",
    "rust": "Rust",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "dart": "Dart",
    "matlab": "MATLAB",
    "bash": "Bash / Shell scripting",
    "shell scripting": "Bash / Shell scripting",
    "tailwind css": "Tailwind CSS",
    "tailwind": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "next.js": "Next.js",
    "next": "Next.js",
    "angular": "Angular",
    "vue.js": "Vue.js",
    "vue": "Vue.js",
    "sass": "SASS / SCSS",
    "scss": "SASS / SCSS",
    "express.js": "Express.js",
    "express": "Express.js",
    "spring boot": "Spring Boot",
    "laravel": "Laravel",
    "asp.net": "ASP.NET",
    "fastapi": "FastAPI",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mongodb": "MongoDB",
    "sqlite": "SQLite",
    "oracle db": "Oracle DB",
    "oracle": "Oracle DB",
    "redis": "Redis",
    "firebase": "Firebase",
    "cassandra": "Cassandra",
    "dynamodb": "DynamoDB",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "aws": "AWS",
    "microsoft azure": "Microsoft Azure",
    "azure": "Microsoft Azure",
    "google cloud platform": "Google Cloud Platform",
    "gcp": "Google Cloud Platform",
    "deep learning": "Deep Learning",
    "natural language processing": "Natural Language Processing (NLP)",
    "nlp": "Natural Language Processing (NLP)",
    "computer vision": "Computer Vision",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "matplotlib": "Matplotlib",
    "seaborn": "Seaborn",
    "network security": "Network Security",
    "ethical hacking": "Ethical Hacking"
}

def extract_skills(text):
    text = text.lower()
    found_skills = set()

    for skill_key, original_name in SKILLS_DB.items():
        # Match using word boundaries. Lookbehind/ahead ensures it doesn't match inside a word.
        # e.g., prevents "go" matching inside "good".
        pattern = r'(?<![a-z0-9])' + re.escape(skill_key) + r'(?![a-z0-9])'
        
        # We need a re.search to find if it exists
        if re.search(pattern, text):
            found_skills.add(original_name)

    return sorted(list(found_skills))