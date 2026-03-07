import PyPDF2
import pytesseract
from PIL import Image
try:
    from docx import Document
except ImportError:
    Document = None

import os

def extract_text(filepath):
    text = ""
    ext = os.path.splitext(filepath)[1].lower()

    if ext == '.pdf':
        try:
            with open(filepath, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() or ""
        except Exception as e:
            print(f"Error reading PDF: {e}")
            
    elif ext in ['.png', '.jpg', '.jpeg']:
        try:
            image = Image.open(filepath)
            text = pytesseract.image_to_string(image)
        except Exception as e:
            print(f"Error reading Image via OCR: {e}")
            
    elif ext == '.docx':
        try:
            if Document:
                doc = Document(filepath)
                text = "\n".join([para.text for para in doc.paragraphs])
            else:
                print("python-docx not installed, cannot read docx")
        except Exception as e:
            print(f"Error reading DOCX: {e}")
    
    return text.strip()