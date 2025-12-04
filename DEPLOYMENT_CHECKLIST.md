# 🎯 DEPLOYMENT QUICK CHECKLIST

Copy-paste this and check off as you complete each step.

---

## 📋 BEFORE YOU START

- [ ] GitHub account created
- [ ] Code pushed to GitHub (branch: janmat)
- [ ] All changes committed

---

## 🗄️ STEP 1: CREATE DATABASES (15 min)

### Neon PostgreSQL
- [ ] Visit https://neon.tech/
- [ ] Sign up with GitHub
- [ ] Create project "janmat-db"
- [ ] Copy PostgreSQL URL: `postgresql://...`
- [ ] Save in notepad

### Upstash Redis
- [ ] Visit https://upstash.com/
- [ ] Sign up with GitHub
- [ ] Create database "janmat-redis"
- [ ] Copy Redis URL: `redis://...`
- [ ] Save in notepad

### CloudAMQP RabbitMQ
- [ ] Visit https://www.cloudamqp.com/
- [ ] Sign up
- [ ] Create instance "janmat-queue" (Little Lemur plan)
- [ ] Copy AMQP URL: `amqps://...`
- [ ] Save in notepad

---

## 🔑 STEP 2: GENERATE KEYS (5 min)

- [ ] Generate JWT_SECRET using openssl/PowerShell
- [ ] Copy generated secret
- [ ] Save in notepad

---

## 🖥️ STEP 3: DEPLOY BACKEND (10 min)

- [ ] Visit https://render.com/
- [ ] Sign up with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub "janmat-sample" repo
- [ ] Set name: `janmat-backend`
- [ ] Set environment: Node
- [ ] Set build command: `npm install && npm run build && npx prisma migrate deploy`
- [ ] Set start command: `npm start`
- [ ] Add environment variables:
  - [ ] DATABASE_URL
  - [ ] REDIS_URL
  - [ ] RABBITMQ_URL
  - [ ] JWT_SECRET
  - [ ] NODE_ENV=production
  - [ ] PORT=5000
  - [ ] CORS_ORIGIN=https://janmat-frontend.vercel.app
  - [ ] FRONTEND_URL=https://janmat-frontend.vercel.app
- [ ] Click "Create Web Service"
- [ ] Wait for deployment ⏳
- [ ] Check logs for success
- [ ] Copy backend URL: `https://janmat-backend.onrender.com`
- [ ] Save in notepad

---

## 🎨 STEP 4: DEPLOY FRONTEND (10 min)

- [ ] Visit https://vercel.com/
- [ ] Sign up with GitHub
- [ ] Click "Add New" → "Project"
- [ ] Select "janmat-sample" repo
- [ ] Set root directory: `frontend/`
- [ ] Add environment variables:
  - [ ] VITE_API_URL=https://janmat-backend.onrender.com
  - [ ] VITE_WS_URL=wss://janmat-backend.onrender.com
- [ ] Click "Deploy"
- [ ] Wait for deployment ⏳
- [ ] Copy frontend URL: `https://janmat-frontend.vercel.app`
- [ ] Save in notepad

---

## ✅ STEP 5: VERIFY DEPLOYMENT (10 min)

- [ ] Test backend: curl https://janmat-backend.onrender.com/api/health
- [ ] Open frontend URL in browser
- [ ] Check console (F12) for errors
- [ ] Try creating account
- [ ] Try login
- [ ] Try filing complaint
- [ ] Verify everything works

---

## 📊 FINAL CHECKLIST

- [ ] Backend deployed: https://janmat-backend.onrender.com
- [ ] Frontend deployed: https://janmat-frontend.vercel.app
- [ ] Database connected: Neon PostgreSQL
- [ ] Cache connected: Upstash Redis
- [ ] Queue connected: CloudAMQP RabbitMQ
- [ ] No errors in logs
- [ ] All features working
- [ ] Ready for production!

---

## 💾 IMPORTANT URLS & CREDENTIALS

**Save these safely (you'll need them later):**

### Neon Database
```
URL: ___________________
Username: ___________________
Password: ___________________
```

### Upstash Redis
```
URL: ___________________
Password: ___________________
```

### CloudAMQP RabbitMQ
```
URL: ___________________
Username: ___________________
Password: ___________________
```

### Render Backend
```
Dashboard: https://render.com/dashboard
Service: janmat-backend
URL: ___________________
```

### Vercel Frontend
```
Dashboard: https://vercel.com/dashboard
Project: janmat-frontend
URL: ___________________
```

---

## 🚀 READY TO DEPLOY?

You have everything you need. Follow the steps in order and you'll be live in ~1 hour!

If you get stuck, refer to: `DEPLOYMENT_SETUP_STEPS.md`
