FROM python:3.10-slim

WORKDIR /app

# System dependencies for pytesseract
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy source code
COPY . .

# Create upload directory
RUN mkdir -p uploads

EXPOSE 5000

# Production server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "run:app"]
