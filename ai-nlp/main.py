from fastapi import FastAPI

app = FastAPI(title="Resume Analyzer AI-NLP API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Resume Analyzer AI-NLP Module"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
