# 🚀 QUICK DEPLOYMENT CHECKLIST

## ✅ PRE-DEPLOYMENT SETUP

### 1. Sign up for Free Services (No Credit Card Required!)

- [ ] **Neon.tech** (PostgreSQL) - https://neon.tech
- [ ] **Upstash** (Redis) - https://upstash.com  
- [ ] **CloudAMQP** (RabbitMQ) - https://cloudamqp.com
- [ ] **Cloudinary** (File Storage) - https://cloudinary.com
- [ ] **Render** (Backend Hosting) - https://render.com
- [ ] **Vercel** (Frontend Hosting) - https://vercel.com

### 2. Collect Your Credentials

After signing up, save these values:

```
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...
RABBITMQ_URL=amqps://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
JWT_SECRET=your-super-secret-key-here
```

---

## 🔧 BACKEND DEPLOYMENT (Render)

### Step 1: Push to GitHub

```bash
cd janmat-sample
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/janmat.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: `janmat-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables (click "Advanced"):
   - Paste all your credentials from above
   - Add `NODE_ENV=production`
   - Add `PORT=3000`

6. Click "Create Web Service"

7. Wait 5-10 minutes for deployment

8. Your backend URL: `https://janmat-backend.onrender.com`

### Step 3: Run Database Setup

In Render dashboard → Shell tab:

```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## 🎨 FRONTEND DEPLOYMENT (Vercel)

### Step 1: Update API URL

The `vercel.json` file has been created for you!

Update `frontend/.env.production` with your Render backend URL.

### Step 2: Deploy on Vercel

**Option A: Using Vercel CLI**

```bash
npm install -g vercel
cd frontend
vercel login
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://janmat-backend.onrender.com/api`
5. Click "Deploy"

6. Your frontend URL: `https://janmat.vercel.app`

---

## 🔄 UPDATE BACKEND CORS

After getting your Vercel URL, update backend CORS:

In `backend/src/app.ts`, update the CORS origin array to include your Vercel URL.

Then redeploy backend on Render (it will auto-redeploy on git push).

---

## ✅ VERIFICATION

Test your deployment:

1. **Backend Health**: https://janmat-backend.onrender.com/health
2. **Frontend**: https://janmat.vercel.app
3. **Register**: Create a new account
4. **Login**: Test authentication
5. **Create Complaint**: Test full functionality

---

## ⚠️ IMPORTANT NOTES

### Render Free Tier:
- Backend sleeps after 15 min of inactivity
- First request after sleep takes 30-60 seconds
- Use UptimeRobot to keep it awake (optional)

### Database Limits:
- Neon: 0.5 GB storage (plenty for testing)
- Auto-pauses after 5 min inactivity
- Resumes automatically on request

---

## 🆘 NEED HELP?

Common issues and solutions in `DEPLOYMENT_GUIDE.md`

**Your app is now live and 100% FREE!** 🎉
