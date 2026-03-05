import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

RESUME_PARSE_PROMPT = """
You are an expert resume parser. Given the resume text below, extract structured information and return it ONLY as valid JSON (no extra text, no markdown).

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
    Send resume text to Gemini API using the official SDK
    and return structured JSON output.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY not set in .env file."}

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        prompt = RESUME_PARSE_PROMPT.format(resume_text=resume_text[:8000])  # limit input size

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                max_output_tokens=2048,
            )
        )

        raw_output = response.text.strip()

        # Strip markdown code fences if present
        if raw_output.startswith("```"):
            parts = raw_output.split("```")
            raw_output = parts[1] if len(parts) > 1 else raw_output
            if raw_output.startswith("json"):
                raw_output = raw_output[4:]

        parsed = json.loads(raw_output.strip())
        return parsed

    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse JSON from Gemini response: {str(e)}"}
    except Exception as e:
        return {"error": f"Gemini API error: {str(e)}"}
