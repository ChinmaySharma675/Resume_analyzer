# Resume Analyzer API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Routes

### Register User
**Endpoint:** `POST /api/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user_id": 1
}
```

---

### Login
**Endpoint:** `POST /api/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### Get User Profile
**Endpoint:** `GET /api/profile`  
**Protected:** Yes

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "resume_count": 3
}
```

---

### Update User Profile
**Endpoint:** `PUT /api/profile`  
**Protected:** Yes

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

---

### Change Password
**Endpoint:** `POST /api/change-password`  
**Protected:** Yes

**Request Body:**
```json
{
  "old_password": "currentpassword",
  "new_password": "newpassword"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

---

## Resume Routes

### Upload Resume
**Endpoint:** `POST /api/upload`  
**Protected:** Yes

**Two Options:**

**Option 1: File Upload**
- Content-Type: `multipart/form-data`
- Form Data:
  - `resume`: (file) PDF, DOCX, or Image
  - `target_job`: (optional) Target job title

**Option 2: Text Upload**
- Content-Type: `application/json`
```json
{
  "text": "Resume text content here...",
  "target_job": "Software Engineer"
}
```

**Response:** `200 OK`
```json
{
  "message": "Resume uploaded and parsed successfully",
  "resume_id": 5
}
```

---

### Get All User Resumes
**Endpoint:** `GET /api/resumes`  
**Protected:** Yes

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "filename": "resume.pdf",
    "skills": "Python, JavaScript, Flask, React",
    "score": 78.5
  },
  {
    "id": 2,
    "filename": "resume2.pdf",
    "skills": "Java, Spring Boot, SQL",
    "score": 72.3
  }
]
```

---

### Analyze Resume
**Endpoint:** `GET /api/resume/<id>/analyze`  
**Protected:** Yes

**Response:** `200 OK`
```json
{
  "score": 78.5,
  "suggestions": [
    {
      "text": "Include your email address for contact information.",
      "category": "Formatting",
      "priority": "High Priority"
    }
  ],
  "skills_found": ["Python", "JavaScript", "Flask"]
}
```

---

### Delete Resume
**Endpoint:** `DELETE /api/resume/<id>`  
**Protected:** Yes

**Response:** `200 OK`
```json
{
  "message": "Resume deleted"
}
```

---

### Search Resumes by Skill
**Endpoint:** `GET /api/search?skill=Python`  
**Protected:** Yes

**Query Parameters:**
- `skill`: Skill name to search for

**Response:** `200 OK`
```json
[
  {
    "resume_id": 1,
    "skills": "Python, JavaScript, Flask"
  }
]
```

---

### Get Paginated Resumes
**Endpoint:** `GET /api/resumes/page?page=1`  
**Protected:** Yes

**Query Parameters:**
- `page`: Page number (default: 1)

**Response:** `200 OK`
```json
{
  "resumes": [
    {"id": 1, "filename": "resume.pdf"},
    {"id": 2, "filename": "resume2.pdf"}
  ],
  "total": 10,
  "pages": 2,
  "current_page": 1
}
```

---

## Job Routes

### Get All Jobs
**Endpoint:** `GET /api/jobs`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Senior Python Developer",
    "description": "Looking for a senior Python developer with 5+ years experience..."
  }
]
```

---

### Create Job Description
**Endpoint:** `POST /api/job`  
**Protected:** Yes

**Request Body:**
```json
{
  "title": "Frontend Engineer",
  "description": "We are looking for a skilled frontend engineer..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Job created",
  "job_id": 5
}
```

---

### Delete Job
**Endpoint:** `DELETE /api/job/<id>`  
**Protected:** Yes

**Response:** `200 OK`
```json
{
  "message": "Job deleted successfully"
}
```

---

## Match Routes

### Calculate Resume-Job Match
**Endpoint:** `POST /api/match`  
**Protected:** Yes

**Request Body:**
```json
{
  "resume_id": 1,
  "job_id": 3
}
```

**Response:** `200 OK`
```json
{
  "match_score": 85.5,
  "match_id": 10
}
```

---

### Rank Resumes for a Job
**Endpoint:** `GET /api/rank/<job_id>`  
**Protected:** Yes

**Response:** `200 OK`
```json
[
  {
    "resume_id": 1,
    "score": 87.5
  },
  {
    "resume_id": 3,
    "score": 82.3
  }
]
```

---

## Admin Routes

### Get System Statistics
**Endpoint:** `GET /api/admin/stats`  
**Protected:** Yes

**Response:** `200 OK`
```json
{
  "total_users": 25,
  "total_resumes": 45,
  "total_jobs": 12,
  "total_matches": 156,
  "average_match_score": 75.23
}
```

---

### Get All Users
**Endpoint:** `GET /api/admin/users`  
**Protected:** Yes

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "resume_count": 3
  }
]
```

---

### Get User Details
**Endpoint:** `GET /api/admin/user/<id>`  
**Protected:** Yes

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "resume_count": 3,
  "resumes": [
    {"id": 1, "filename": "resume.pdf"}
  ]
}
```

---

### Delete User
**Endpoint:** `DELETE /api/admin/user/<id>`  
**Protected:** Yes

**Response:** `200 OK`
```json
{
  "message": "User and associated data deleted successfully"
}
```

---

### Get All Resumes (Admin)
**Endpoint:** `GET /api/admin/resumes?page=1&per_page=10`  
**Protected:** Yes

**Query Parameters:**
- `page`: Page number
- `per_page`: Items per page

**Response:** `200 OK`
```json
{
  "resumes": [
    {
      "id": 1,
      "filename": "resume.pdf",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "skills": "Python, JavaScript"
    }
  ],
  "total": 45,
  "pages": 5,
  "current_page": 1
}
```

---

### Get All Jobs (Admin)
**Endpoint:** `GET /api/admin/jobs?page=1&per_page=10`  
**Protected:** Yes

**Response:** `200 OK`
```json
{
  "jobs": [
    {
      "id": 1,
      "title": "Senior Python Developer",
      "description": "Looking for a senior Python developer...",
      "match_count": 12
    }
  ],
  "total": 25,
  "pages": 3,
  "current_page": 1
}
```

---

### Get Matches for a Job (Admin)
**Endpoint:** `GET /api/admin/job/<job_id>/matches`  
**Protected:** Yes

**Response:** `200 OK`
```json
{
  "job_id": 1,
  "job_title": "Senior Python Developer",
  "matches": [
    {
      "match_id": 1,
      "resume_id": 5,
      "filename": "resume.pdf",
      "user_name": "John Doe",
      "score": 87.5
    }
  ]
}
```

---

### Delete Match Result (Admin)
**Endpoint:** `DELETE /api/admin/match/<match_id>`  
**Protected:** Yes

**Response:** `200 OK`
```json
{
  "message": "Match deleted successfully"
}
```

---

## Utility Routes

### Health Check
**Endpoint:** `GET /api/health`

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2024-04-30T10:30:45.123456",
  "service": "Resume Analyzer API"
}
```

---

### API Information
**Endpoint:** `GET /api/api-info`

**Response:** `200 OK`
```json
{
  "api_version": "1.0",
  "description": "Resume Analyzer - AI-powered resume analysis and job matching",
  "endpoints": {
    "auth": {...},
    "resume": {...},
    "job": {...},
    "match": {...},
    "admin": {...}
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Notes
- All timestamps are in ISO 8601 format
- Match scores are between 0 and 100
- JWT tokens expire after a configured duration
- Admin endpoints require admin role (future enhancement)
