import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from utils.extractor import extract_text
from utils.nlp import process_resume_text

app = FastAPI(title="Resume Analyzer AI-NLP API")

# Allow frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Resume Analyzer AI-NLP API is running."}

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    """
    Accepts a resume file (PDF, DOCX, TXT), extracts text,
    and returns NLP analysis (entities, skills, education).
    """
    allowed_extensions = [".pdf", ".docx", ".doc", ".txt"]
    filename = file.filename
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {allowed_extensions}"
        )

    try:
        contents = await file.read()
        file_stream = io.BytesIO(contents)
        raw_text = extract_text(file_stream, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")

    if not raw_text:
        raise HTTPException(status_code=422, detail="Could not extract any text from the file.")

    result = process_resume_text(raw_text)

    return {
        "filename": filename,
        "raw_text_preview": raw_text[:500],  # first 500 chars for preview
        "analysis": result
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
