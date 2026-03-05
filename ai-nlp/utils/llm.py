import os
import json
from dotenv import load_dotenv
import requests

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)

RESUME_PARSE_PROMPT = """
You are an expert resume parser. Given the resume text below, extract structured information and return it ONLY as valid JSON (no extra text).

The JSON should follow this exact structure:
{{
  "name": "Full name of the candidate",
  "email": "email address or null",
  "phone": "phone number or null",
  "location": "city/country or null",
  "summary": "2-3 sentence professional summary",
  "skills": ["list", "of", "skills"],
  "experience": [
    {{
      "role": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "highlights": ["key achievement or responsibility"]
    }}
  ],
  "education": [
    {{
      "degree": "Degree name",
      "institution": "University/College name",
      "year": "graduation year or null"
    }}
  ]
}}

Resume Text:
{resume_text}
"""


def analyze_with_gemini(resume_text: str) -> dict:
    """
    Send resume text to Gemini API and get structured JSON output.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY not set in .env file."}

    prompt = RESUME_PARSE_PROMPT.format(resume_text=resume_text)

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,   # Low temp for consistent structured output
            "maxOutputTokens": 2048
        }
    }

    try:
        response = requests.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()

        # Extract the text content from the response
        raw_output = data["candidates"][0]["content"]["parts"][0]["text"]

        # Strip markdown code blocks if Gemini wraps JSON in ```json ... ```
        raw_output = raw_output.strip()
        if raw_output.startswith("```"):
            raw_output = raw_output.split("```")[1]
            if raw_output.startswith("json"):
                raw_output = raw_output[4:]
        
        parsed = json.loads(raw_output.strip())
        return parsed

    except requests.exceptions.RequestException as e:
        return {"error": f"API request failed: {str(e)}"}
    except (KeyError, IndexError) as e:
        return {"error": f"Unexpected API response format: {str(e)}"}
    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse JSON from Gemini response: {str(e)}"}
