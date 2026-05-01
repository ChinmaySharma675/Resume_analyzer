FROM python:3.12-slim

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

# Create writable directories for SQLite DB and uploads
RUN mkdir -p /app/instance && chmod 777 /app/instance
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

EXPOSE 5000

# Production server - single worker for SQLite compatibility
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "120", "run:app"]
