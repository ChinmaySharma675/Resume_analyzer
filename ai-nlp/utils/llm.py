import os
import json
import time
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types

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

MAX_RETRIES = 5
BASE_RETRY_DELAY = 30  # seconds
MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"]  # fallback chain


def _is_rate_limit_error(error_str: str) -> bool:
    """Check if an error is a rate limit / resource exhausted error."""
    keywords = ["resource", "rate", "429", "exhausted", "retrydelay", "quota"]
    return any(kw in error_str for kw in keywords)


def _call_gemini(client, prompt: str) -> str:
    """Make a Gemini API call with retry logic and model fallback."""
    last_error = None
    for model_name in MODELS:
        for attempt in range(MAX_RETRIES):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.1,
                        max_output_tokens=2048,
                    )
                )
                return response.text.strip()
            except Exception as e:
                last_error = e
                error_str = str(e).lower()
                if _is_rate_limit_error(error_str):
                    delay_match = re.search(r"retrydelay.*?'(\d+)s'", str(e), re.IGNORECASE)
                    wait_time = int(delay_match.group(1)) + 2 if delay_match else BASE_RETRY_DELAY * (attempt + 1)
                    print(f"[Gemini] Rate limited on {model_name} (attempt {attempt + 1}/{MAX_RETRIES}). Waiting {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    raise
        print(f"[Gemini] All retries exhausted for {model_name}. Trying next model...")
    raise last_error


def _strip_code_fences(text: str) -> str:
    """Remove markdown code fences from LLM output."""
    text = text.strip()
    if text.startswith("```"):
        # Remove opening fence (with optional language tag)
        text = re.sub(r'^```\w*\n?', '', text)
        # Remove closing fence
        text = re.sub(r'\n?```$', '', text)
    return text.strip()


def analyze_with_gemini(resume_text: str) -> dict:
    """
    Send resume text to Gemini API using the official google-genai SDK
    and return structured JSON output. Automatically retries on rate limits.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY not set in .env file."}

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = RESUME_PARSE_PROMPT.format(resume_text=resume_text[:8000])

        raw_output = _call_gemini(client, prompt)
        raw_output = _strip_code_fences(raw_output)

        parsed = json.loads(raw_output)
        return parsed

    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse JSON from Gemini response: {str(e)}"}
    except Exception as e:
        return {"error": f"Gemini API error: {str(e)}"}
