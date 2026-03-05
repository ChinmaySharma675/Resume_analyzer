import os
import io
import PyPDF2
from docx import Document

def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
    """
    Extract text from a PDF file stream.
    """
    try:
        reader = PyPDF2.PdfReader(file_stream)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def extract_text_from_docx(file_stream: io.BytesIO) -> str:
    """
    Extract text from a DOCX file stream.
    """
    try:
        doc = Document(file_stream)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from DOCX: {e}")
        return ""

def extract_text(file_stream: io.BytesIO, filename: str) -> str:
    """
    Extract text from a file stream based on file extension.
    """
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_stream)
    elif ext in [".docx", ".doc"]:
        # python-docx primarily handles .docx.
        return extract_text_from_docx(file_stream)
    elif ext == ".txt":
        return file_stream.read().decode("utf-8")
    else:
        raise ValueError(f"Unsupported file format: {ext}")
