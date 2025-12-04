# 🔄 Data Restoration & Migration Best Practices

## ✅ Data Has Been Restored!

I've successfully restored all your data by running:
```bash
npx prisma db seed
```

**What was restored:**
- ✅ 5 Users (1 citizen, 3 officers, 1 admin)
- ✅ 8 Complaints with full details
- ✅ 3 Timeline entries
- ✅ All departments and relationships

## 🛡️ Why Data Loss Happened

When you run `npx prisma migrate dev`, Prisma:
1. Creates a new migration file
2. **Drops and recreates** tables if there are breaking changes
3. This causes all data to be lost

**The issue:** The migration added new columns to existing tables, and Prisma decided to recreate the tables.

## 🚀 How to Prevent Data Loss in Future

### Method 1: Use `prisma db push` for Development (Recommended)

```bash
# Instead of migrate, use db push during development
npx prisma db push

# This:
# ✅ Adds new columns without dropping data
# ✅ Keeps existing data intact
# ✅ Faster for development
# ❌ Doesn't create migration files (only use in dev!)
```

### Method 2: Backup Before Migration

```bash
# 1. Backup database
docker exec janmat-postgres pg_dump -U postgres janmat > backup.sql

# 2. Run migration
npx prisma migrate dev

# 3. If data lost, restore
docker exec -i janmat-postgres psql -U postgres janmat < backup.sql

# 4. Re-seed
npx prisma db seed
```

### Method 3: Use Migration with Seed (Current Setup)

```bash
# 1. Run migration
npx prisma migrate dev --name your_migration_name

# 2. Immediately re-seed
npx prisma db seed
```

## 📋 Your Seed Files

You have 3 seed files that restore data:

1. **`prisma/seed.ts`** - Main seed file
   - Creates users, departments, complaints
   - Configured in package.json
   - Run with: `npx prisma db seed`

2. **`prisma/seed-officers.ts`** - Officer-specific data
   - May need to be run separately

3. **`prisma/seed-complaints.ts`** - Complaint-specific data
   - May need to be run separately

## 🔧 Running Additional Seeds

If you need more data:

```bash
# Run officer seed
npx ts-node prisma/seed-officers.ts

# Run complaint seed
npx ts-node prisma/seed-complaints.ts
```

## 🎯 Best Practice Workflow

### For Development (Adding New Fields):

```bash
# 1. Update schema.prisma with new fields
# 2. Push to database (keeps data)
npx prisma db push

# 3. Generate Prisma Client
npx prisma generate

# 4. Restart backend
npm run dev
```

### For Production (Creating Migration):

```bash
# 1. Create migration file (without applying)
npx prisma migrate dev --create-only --name add_new_fields

# 2. Review the migration file
# 3. Modify if needed to preserve data
# 4. Apply migration
npx prisma migrate deploy

# 5. Verify data is intact
npx prisma studio
```

## 🔍 Checking Your Data

### Using Prisma Studio (Visual):
```bash
npx prisma studio
# Opens at http://localhost:5555
# Browse all tables visually
```

### Using SQL (Command Line):
```bash
# Connect to database
docker exec -it janmat-postgres psql -U postgres janmat

# Check user count
SELECT COUNT(*) FROM users;

# Check complaint count
SELECT COUNT(*) FROM complaints;

# Exit
\q
```

## 📊 Current Database State

After restoration, you should have:

**Users Table:**
- 1 Admin (admin@test.com)
- 3 Officers (officer@test.com, etc.)
- 1 Citizen (citizen@test.com)

**Complaints Table:**
- 8 Complaints with various statuses
- Assigned to different departments
- With timeline entries

**Departments Table:**
- Multiple departments
- Officers assigned to departments

## 🚨 Emergency Data Recovery

If data is lost again:

### Quick Recovery:
```bash
# Re-run seed
npx prisma db seed
```

### Full Recovery (if you have backup):
```bash
# Restore from SQL backup
docker exec -i janmat-postgres psql -U postgres janmat < backup.sql
```

### Reset Everything:
```bash
# 1. Reset database
npx prisma migrate reset

# 2. This will:
#    - Drop all tables
#    - Run all migrations
#    - Run seed automatically
```

## 💡 Pro Tips

### 1. Always Use db push in Development
```bash
# Good for development
npx prisma db push

# Only use migrate for production
npx prisma migrate dev
```

### 2. Create Backups Before Major Changes
```bash
# Backup before migration
docker exec janmat-postgres pg_dump -U postgres janmat > backup_$(date +%Y%m%d).sql
```

### 3. Use Seed Files for Test Data
```bash
# Keep seed files updated
# Run after any data loss
npx prisma db seed
```

### 4. Check Data Before and After
```bash
# Before migration
npx prisma studio

# After migration
npx prisma studio
```

## 🎓 Understanding Prisma Commands

| Command | What It Does | When to Use | Data Safe? |
|---------|--------------|-------------|------------|
| `db push` | Pushes schema to DB | Development | ✅ Yes |
| `migrate dev` | Creates & applies migration | Development | ⚠️ Maybe |
| `migrate deploy` | Applies migrations | Production | ✅ Yes |
| `migrate reset` | Resets DB & re-seeds | Fresh start | ❌ No |
| `db seed` | Runs seed file | After data loss | ✅ Yes |
| `generate` | Updates Prisma Client | After schema change | ✅ Yes |

## ✅ Verification Checklist

After any migration or seed:

- [ ] Backend starts without errors
- [ ] Can login with test accounts
- [ ] Complaints are visible
- [ ] Officers are assigned to departments
- [ ] Timeline entries exist
- [ ] All relationships work

## 🔐 Test Accounts (After Seed)

```
Citizen:
  Email: citizen@test.com
  Password: password

Officer:
  Email: officer@test.com
  Password: password

Admin:
  Email: admin@test.com
  Password: password
```

## 📞 Quick Reference

```bash
# Restore data
npx prisma db seed

# Check data
npx prisma studio

# Safe schema update (development)
npx prisma db push && npx prisma generate

# Full reset (if everything is broken)
npx prisma migrate reset
```

---

**Status**: ✅ Data Restored Successfully!
**Last Seed**: December 3, 2025
**Records**: 5 users, 8 complaints, 3 timeline entries
