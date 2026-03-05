import os
import io
import tempfile
import PyPDF2
from docx import Document

def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
    """Extract text from a PDF file stream."""
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
    """Extract text from a DOCX file stream (new XML format)."""
    try:
        doc = Document(file_stream)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from DOCX: {e}")
        return ""

def extract_text_from_doc(file_bytes: bytes) -> str:
    """
    Extract text from a legacy .doc file (old binary Word format).
    Uses docx2txt or falls back to a raw byte string extraction heuristic.
    """
    # Try docx2txt first (it sometimes handles .doc too)
    try:
        import docx2txt
        with tempfile.NamedTemporaryFile(delete=False, suffix=".doc") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        text = docx2txt.process(tmp_path)
        os.unlink(tmp_path)
        if text and text.strip():
            return text.strip()
    except Exception as e:
        print(f"docx2txt failed for .doc: {e}")

    # Last resort: extract readable ASCII strings from the binary blob
    try:
        text = file_bytes.decode("latin-1", errors="ignore")
        # Filter out non-printable chars, keep lines with real words
        lines = []
        for line in text.split("\n"):
            clean = "".join(c for c in line if c.isprintable())
            if len(clean.strip()) > 20:   # skip short/garbage lines
                lines.append(clean.strip())
        return "\n".join(lines)
    except Exception as e:
        print(f"Raw extraction failed for .doc: {e}")
        return ""

def extract_text(file_stream: io.BytesIO, filename: str) -> str:
    """Extract text from a file stream based on file extension."""
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_stream)
    elif ext == ".docx":
        return extract_text_from_docx(file_stream)
    elif ext == ".doc":
        return extract_text_from_doc(file_stream.read())
    elif ext == ".txt":
        return file_stream.read().decode("utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file format: {ext}")
