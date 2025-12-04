# 🔧 Database Migration Guide - Fix Backend Issues

## Current Situation

The backend cannot start because Prisma Client doesn't have the new schema fields yet. We need to:
1. Ensure database is running
2. Run migrations to add new fields
3. Generate Prisma Client
4. Uncomment the temporarily disabled code

## ⚠️ Temporary Changes Made

To allow the backend to start, I've temporarily commented out new fields in:
- `backend/src/services/auth.service.ts` (lines 121-126, 139-144)
- `backend/src/controllers/admin.controller.ts` (lines 532, 542, 574, 584)

**These MUST be uncommented after migration!**

## 🚀 Step-by-Step Fix

### Step 1: Ensure Docker is Running

```bash
# Check if Docker Desktop is running
docker ps

# If not running, start Docker Desktop manually
# Then run:
docker-compose up -d
```

### Step 2: Stop All Running Processes

```bash
# Stop the backend if it's running (Ctrl+C in the terminal)
# Make sure no other process is using the database
```

### Step 3: Reset Failed Migration

```bash
cd backend

# Mark the failed migration as rolled back
npx prisma migrate resolve --rolled-back 20251202185548_enhance_notifications
```

### Step 4: Create New Migration

```bash
# This will create a migration with all the new fields
npx prisma migrate dev --name add_all_profile_fields
```

**What this does:**
- Creates migration files
- Applies changes to database
- Generates Prisma Client automatically

### Step 5: If Step 4 Fails, Use db push

If the migration command fails, try this alternative:

```bash
# Push schema changes directly to database
npx prisma db push --skip-generate

# Then generate Prisma Client
npx prisma generate
```

### Step 6: Uncomment the Code

After successful migration, uncomment these lines:

#### In `backend/src/services/auth.service.ts`:

**Lines 121-126** - Uncomment:
```typescript
if (updates.gender !== undefined) updateData.gender = updates.gender;
if (updates.address !== undefined) updateData.address = updates.address;
if (updates.emergencyContact !== undefined) updateData.emergencyContact = updates.emergencyContact;
if (updates.aadharNumber !== undefined) updateData.aadharNumber = updates.aadharNumber;
if (updates.designation !== undefined) updateData.designation = updates.designation;
if (updates.profilePicture !== undefined) updateData.profilePicture = updates.profilePicture;
```

**Lines 139-144** - Uncomment:
```typescript
gender: true,
address: true,
emergencyContact: true,
aadharNumber: true,
designation: true,
profilePicture: true,
```

#### In `backend/src/controllers/admin.controller.ts`:

**Line 532** - Uncomment:
```typescript
designation,
```

**Line 542** - Uncomment:
```typescript
designation: true,
```

**Line 574** - Uncomment:
```typescript
designation,
```

**Line 584** - Uncomment:
```typescript
designation: true,
```

### Step 7: Restart Backend

```bash
# In the backend directory
npm run dev
```

The backend should now start without errors!

## 🔍 Troubleshooting

### Problem: "Can't reach database server"

**Solution:**
```bash
# Start Docker Desktop
# Then run:
docker-compose up -d

# Wait 10 seconds for database to initialize
# Then try migration again
```

### Problem: "EPERM: operation not permitted"

**Solution:**
```bash
# Close VS Code and any terminals
# Stop the backend (Ctrl+C)
# Delete node_modules/.prisma folder
rm -rf node_modules/.prisma

# Then run:
npx prisma generate
```

### Problem: "Migration failed to apply"

**Solution:**
```bash
# Use db push instead of migrate
npx prisma db push --accept-data-loss

# Then generate
npx prisma generate
```

### Problem: Backend still won't start

**Solution:**
```bash
# Clear everything and start fresh
rm -rf node_modules/.prisma
npm install
npx prisma generate
npm run dev
```

## ✅ Verification

After completing all steps, verify:

1. **Backend starts without errors**
   ```bash
   npm run dev
   # Should see: "Server running on port 3000"
   ```

2. **Database has new fields**
   ```bash
   npx prisma studio
   # Check User model for new fields
   ```

3. **Profile page works**
   - Open frontend
   - Go to Profile page
   - Try editing new fields
   - Should save successfully

## 📋 Quick Reference

### New Database Fields Added:

**User Table:**
- `gender` (String, nullable)
- `address` (Text, nullable)
- `profilePicture` (String, nullable)
- `emergencyContact` (String, nullable)
- `aadharNumber` (String, nullable)
- `designation` (String, nullable)

**Notification Table:**
- `title` (String, nullable)
- `actionUrl` (String, nullable)
- `metadata` (JSON, nullable)

### Commands Summary:

```bash
# 1. Start database
docker-compose up -d

# 2. Resolve failed migration
npx prisma migrate resolve --rolled-back 20251202185548_enhance_notifications

# 3. Create new migration
npx prisma migrate dev --name add_all_profile_fields

# OR use db push if migrate fails
npx prisma db push
npx prisma generate

# 4. Restart backend
npm run dev
```

## 🎯 Expected Result

After following this guide:
- ✅ Database has all new fields
- ✅ Prisma Client is updated
- ✅ Backend starts without errors
- ✅ Profile page can save all fields
- ✅ Officer creation works with designation
- ✅ All features are fully functional

## 📞 Still Having Issues?

If you're still facing problems:

1. **Check Docker Desktop** - Make sure it's running
2. **Check Database Connection** - Verify DATABASE_URL in .env
3. **Check File Permissions** - Run terminal as Administrator
4. **Check Port 5433** - Make sure nothing else is using it
5. **Restart Everything** - Docker, VS Code, terminals

## 💡 Pro Tips

- Always stop the backend before running migrations
- Use `npx prisma studio` to visually inspect database
- Keep Docker Desktop running while developing
- If stuck, try `npx prisma db push` instead of `migrate`
- Clear `.prisma` folder if you get weird errors

---

**Last Updated**: December 3, 2025
**Status**: Waiting for migration to complete
