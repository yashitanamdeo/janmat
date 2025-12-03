# 🚀 DEPLOYMENT SETUP - Step-by-Step Instructions

Follow these exact steps to deploy your JanMat project for FREE.

---

## ✅ Prerequisites Checklist

- [ ] GitHub account (https://github.com/signup)
- [ ] Your code pushed to GitHub (repo: janmat-sample)
- [ ] All files saved and committed

**Status:** Ready to proceed ✅

---

## 📋 STEP 1: Create Free Database Services (15 minutes)

### 1.1 PostgreSQL Database - Neon.tech

**Why:** Store all persistent data (users, complaints, feedback)

1. Go to https://neon.tech/
2. Click "Sign up"
3. Sign up with GitHub (easier)
4. Grant permissions
5. Create a new project:
   - Project name: `janmat-db`
   - Region: Closest to you
   - PostgreSQL version: 15
6. Click "Create project"
7. **Copy this URL** (you'll need it):
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxxx.neon.tech/neondb
   ```
   Keep this safe ✅

**Cost:** FREE (0.5 GB storage included)

---

### 1.2 Redis Cache - Upstash.com

**Why:** Fast in-memory cache for sessions and notifications

1. Go to https://upstash.com/
2. Click "Sign up"
3. Sign up with GitHub
4. Create new Redis database:
   - Name: `janmat-redis`
   - Region: us-east-1 (free tier)
   - Eviction: True (important for free tier)
5. Click "Create"
6. Go to "Details" tab
7. **Copy Redis URL:**
   ```
   redis://default:YOUR_PASSWORD@xxxx.upstash.io:12345
   ```
   Keep this safe ✅

**Cost:** FREE (10,000 commands/day)

---

### 1.3 RabbitMQ Queue - CloudAMQP.com

**Why:** Handle async notifications in background

1. Go to https://www.cloudamqp.com/
2. Click "Get started"
3. Sign up (email or social)
4. Create instance:
   - Instance name: `janmat-queue`
   - Plan: Little Lemur (FREE)
   - Region: us-east-1
5. Click "Select region"
6. Click "Create"
7. Wait for instance to be created (2 minutes)
8. Click on your instance
9. **Copy AMQP URL:**
   ```
   amqps://username:password@xxx.cloudamqp.com/vhost
   ```
   Keep this safe ✅

**Cost:** FREE (limited but sufficient)

---

## 🔑 STEP 2: Generate Security Keys (5 minutes)

### Generate JWT_SECRET

Run this command in your terminal:

```bash
# For Windows PowerShell:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# For Mac/Linux:
openssl rand -base64 32
```

**Output example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0==
```

Keep this safe ✅

---

## 🖥️ STEP 3: Deploy Backend on Render (10 minutes)

### 3.1 Create Render Account

1. Go to https://render.com/
2. Sign up with GitHub
3. Grant permissions

### 3.2 Create Web Service

1. Click "New +" button (top right)
2. Select "Web Service"
3. Connect your GitHub repository:
   - Select your GitHub account
   - Search for "janmat-sample"
   - Click "Connect"
4. Fill in deployment details:
   - **Name:** janmat-backend
   - **Environment:** Node
   - **Region:** Frankfurt (or closest)
   - **Branch:** janmat
   - **Build Command:** `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### 3.3 Add Environment Variables

In the "Environment" section, add these variables:

```
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxxx.neon.tech/neondb
REDIS_URL=redis://default:YOUR_PASSWORD@xxxx.upstash.io:12345
RABBITMQ_URL=amqps://username:password@xxx.cloudamqp.com/vhost
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0==
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://janmat-frontend.vercel.app
FRONTEND_URL=https://janmat-frontend.vercel.app
```

### 3.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. **Copy your backend URL:**
   ```
   https://janmat-backend.onrender.com
   ```
4. Check logs to ensure it deployed successfully ✅

---

## 🎨 STEP 4: Deploy Frontend on Vercel (10 minutes)

### 4.1 Create Vercel Account

1. Go to https://vercel.com/
2. Sign up with GitHub
3. Grant permissions

### 4.2 Import Project

1. Click "Add New" (top right)
2. Select "Project"
3. Select your GitHub repository "janmat-sample"
4. Vercel will auto-detect it's a monorepo

### 4.3 Configure Deployment

1. In "Project Settings":
   - **Root Directory:** `frontend/`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 4.4 Add Environment Variables

In the "Environment Variables" section:

```
VITE_API_URL=https://janmat-backend.onrender.com
VITE_WS_URL=wss://janmat-backend.onrender.com
```

### 4.5 Deploy

1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. **Copy your frontend URL:**
   ```
   https://janmat-frontend.vercel.app
   ```
4. Click on the URL to verify it loads ✅

---

## ✅ STEP 5: Verify Everything Works (10 minutes)

### 5.1 Test Backend API

```bash
# Test health endpoint
curl https://janmat-backend.onrender.com/api/health

# Should return success response
```

### 5.2 Test Frontend

1. Open https://janmat-frontend.vercel.app in browser
2. Should load the login page
3. Check browser console (F12 → Console tab)
4. Should have NO red errors

### 5.3 Test Database Connection

1. In Render dashboard, click on janmat-backend
2. Go to "Logs" tab
3. Should see "Prisma migration: successful"
4. Should see "Connected to PostgreSQL"

### 5.4 Test Full Flow

1. Open frontend URL
2. Create a test account
3. Login
4. Create a test complaint
5. Should save successfully

---

## 🚨 Troubleshooting

### "Connection refused" error

**Problem:** Backend not responding
**Solution:**
- Check Render logs for errors
- Ensure all environment variables are set
- Wait 5 minutes for cold start

### "CORS error" in browser console

**Problem:** Frontend can't reach backend
**Solution:**
- Check CORS_ORIGIN env variable in Render
- Should be: `https://janmat-frontend.vercel.app`
- Redeploy backend after changing env

### "Database connection error"

**Problem:** Can't connect to Neon
**Solution:**
- Verify DATABASE_URL is correct
- Test connection locally first
- Check Neon dashboard for issues

### "Deployment failed" on Render

**Problem:** Build failed
**Solution:**
- Check Render logs for exact error
- Common issues:
  - TypeScript errors: Fix locally and push
  - Missing env variables: Add them and redeploy
  - Migration failed: Check database connection

---

## 📊 Your Deployment is Complete!

After all steps:

```
✅ Frontend Live: https://janmat-frontend.vercel.app
✅ Backend API: https://janmat-backend.onrender.com
✅ Database: PostgreSQL on Neon
✅ Cache: Redis on Upstash
✅ Queue: RabbitMQ on CloudAMQP
✅ SSL/HTTPS: Automatic on all
✅ Cost: $0/month
```

---

## 📝 Environment Variables Reference

| Variable | From | Example |
|----------|------|---------|
| `DATABASE_URL` | Neon | `postgresql://...` |
| `REDIS_URL` | Upstash | `redis://...` |
| `RABBITMQ_URL` | CloudAMQP | `amqps://...` |
| `JWT_SECRET` | Generated | Random 32+ chars |
| `VITE_API_URL` | Backend URL | `https://janmat-backend.onrender.com` |

---

## 🔄 Next Steps

After deployment:

1. **Share with users:** Give them frontend URL
2. **Monitor logs:** Check Render/Vercel dashboards daily
3. **Push updates:** `git push` automatically redeploys
4. **Add custom domain:** Point janmat.com to Vercel (optional)
5. **Set up email:** Configure SMTP for real notifications (optional)

---

## 📞 Support

If you face issues:

1. Check Render logs: https://render.com/dashboard
2. Check Vercel logs: https://vercel.com/dashboard
3. Check database status:
   - Neon: https://console.neon.tech/
   - Upstash: https://console.upstash.com/
   - CloudAMQP: https://www.cloudamqp.com/console/

---

**Your project is now live on the internet!** 🎉
