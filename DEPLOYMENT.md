# 🚀 Deployment Guide: Render + Vercel

This guide walks you through deploying the Resume Analyzer to **Render** (backend) and **Vercel** (frontend).

---

## 📋 Prerequisites

- GitHub account (both services integrate with GitHub)
- Render account (free tier available): https://render.com
- Vercel account (free tier available): https://vercel.com
- Project pushed to GitHub

---

## 🔧 Backend Deployment (Render)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Resume_analyzer.git
git push -u origin main
```

### Step 2: Create PostgreSQL Database on Render
1. Go to https://render.com/dashboard
2. Click **New +** → **PostgreSQL**
3. Fill in details:
   - Name: `resume-analyzer-db`
   - Region: Choose closest to you
   - PostgreSQL Version: 15
4. Click **Create Database**
5. Copy the connection string (you'll need this in Step 4)

### Step 3: Deploy Backend on Render
1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Fill in:
   - **Name**: `resume-analyzer-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn wsgi:app`
   - **Region**: Same as database
4. Click **Advanced** and add environment variables:
   ```
   SECRET_KEY=your-secure-random-key
   JWT_SECRET_KEY=your-secure-jwt-key
   DATABASE_URL=postgresql://... (from Step 2)
   FLASK_ENV=production
   FRONTEND_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
   ```
5. Click **Create Web Service**
6. Wait for deployment (~5 mins)
7. Copy your backend URL (e.g., `https://resume-analyzer-backend-xxxx.onrender.com`)

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Connect GitHub to Vercel
1. Go to https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Import your GitHub repository

### Step 2: Configure Build Settings
1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Environment Variables:
   ```
   VITE_API_URL=https://resume-analyzer-backend-xxxx.onrender.com
   ```
   (Use the backend URL from Render)

### Step 3: Deploy
1. Click **Deploy**
2. Wait for build to complete (~2 mins)
3. Copy your frontend URL (e.g., `https://resume-analyzer.vercel.app`)

### Step 4: Update Backend CORS
Go back to Render dashboard:
1. Select `resume-analyzer-backend`
2. Go to **Environment**
3. Update `FRONTEND_URL` to your Vercel URL
4. Service auto-redeploys

---

## ✅ Verify Deployment

1. Open your Vercel frontend URL in browser
2. Try to register/login
3. Upload a resume
4. Test analyze feature

---

## 🔒 Important Security Notes

- Change all `SECRET_KEY` and `JWT_SECRET_KEY` values to secure random strings
- Never commit `.env` files
- Use strong database passwords
- Enable HTTPS (both services do this by default)
- Render free tier has limitations (spins down after 15 mins of inactivity)

---

## 📊 Cost (Free Tier)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Render** | ✅ 1 free web service + 1 free database | Spins down after 15 min inactivity |
| **Vercel** | ✅ Unlimited | Great for static sites |

---

## 🚨 Troubleshooting

### Backend won't deploy
- Check logs in Render dashboard
- Ensure `requirements.txt` has all dependencies
- Verify `wsgi.py` exists in backend folder

### Frontend can't connect to API
- Check `VITE_API_URL` is set correctly in Vercel
- Ensure backend is running (check Render logs)
- Check CORS is enabled in backend

### Database connection fails
- Verify `DATABASE_URL` in environment variables
- Ensure PostgreSQL service is running on Render
- Check connection string format

---

## 🔄 Auto-Deployment on Push

Both Render and Vercel automatically redeploy when you push to `main` branch!

Just do:
```bash
git add .
git commit -m "Your message"
git push
```

Both services will detect changes and redeploy automatically.

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Flask Deployment**: https://flask.palletsprojects.com/deployment/
