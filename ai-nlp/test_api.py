import os, sys, json
sys.path.insert(0, r"e:\Resume_analyzer\ai-nlp")
from dotenv import load_dotenv
load_dotenv(r"e:\Resume_analyzer\ai-nlp\.env")

from utils.llm import analyze_with_gemini

sample = """John Doe
Email: john@test.com
Phone: +1-555-0123

Skills: Python, React, Node.js, Docker

Experience:
Software Engineer at Google (2020-2023)
- Built microservices
- Led team of 3

Education:
B.Tech Computer Science, MIT, 2020"""

print("Testing Gemini API...")
result = analyze_with_gemini(sample)
print("Result:")
print(json.dumps(result, indent=2))
