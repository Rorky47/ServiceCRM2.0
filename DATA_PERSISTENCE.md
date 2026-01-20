# Data Persistence Guide

## ⚠️ Important: Will Your Changes Be Lost?

**Short Answer**: It depends on your setup!

## Two Storage Methods

### 1. PostgreSQL Database (Recommended for Railway)

**✅ Your changes WILL persist** if:
- You have `DATABASE_URL` set in Railway
- Your data is already in the database

**How it works:**
- Data is stored in PostgreSQL (persistent)
- Deployments don't affect database data
- Your changes are safe ✅

**To verify:**
- Check Railway → Your PostgreSQL service → Data is there
- Your app uses database when `DATABASE_URL` is set

### 2. JSON Files (Fallback)

**⚠️ Your changes MIGHT be lost** if:
- `DATABASE_URL` is NOT set
- `data/` folder is NOT committed to git
- Railway rebuilds from scratch

**How to protect your data:**
1. **Commit data folder to git** (recommended backup)
2. **Or migrate to database** (better long-term)

## 🔍 Check Your Current Setup

### Are you using Database or JSON files?

**Check locally:**
```bash
# If DATABASE_URL is set, you're using database
echo $DATABASE_URL

# Check if data folder exists
ls -la data/
```

**On Railway:**
- Go to your service → Variables
- Look for `DATABASE_URL`
- If it exists → Using database ✅
- If not → Using JSON files ⚠️

## 🛡️ How to Protect Your Data

### Option 1: Use PostgreSQL (Best)

1. **Set up PostgreSQL on Railway:**
   - Add PostgreSQL service
   - Copy `DATABASE_URL`
   - Add to your Next.js service variables

2. **Migrate your local data:**
   ```bash
   # Set DATABASE_URL locally (from Railway)
   export DATABASE_URL="postgresql://..."
   
   # Migrate JSON files to database
   npm run db:migrate
   ```

3. **Deploy:**
   - Your data is now in database
   - Safe from deployments ✅

### Option 2: Commit Data Folder to Git (Backup)

**If you're still using JSON files:**

1. **Check if data folder is ignored:**
   ```bash
   git check-ignore data/
   ```
   - If it returns nothing → Already tracked ✅
   - If it returns "data/" → Need to commit it

2. **Commit data folder:**
   ```bash
   git add data/
   git commit -m "Add data folder with site content"
   git push
   ```

3. **Verify it's tracked:**
   ```bash
   git ls-files data/
   ```

### Option 3: Both (Safest)

1. **Commit data folder to git** (backup)
2. **Set up PostgreSQL** (production)
3. **Migrate data to database**
4. **Keep data folder in git** (version control)

## 📋 Pre-Deployment Checklist

Before pushing to Railway:

- [ ] **If using Database:**
  - [ ] `DATABASE_URL` is set in Railway
  - [ ] Data is migrated to database
  - [ ] Tested locally with `DATABASE_URL`

- [ ] **If using JSON files:**
  - [ ] `data/` folder is committed to git
  - [ ] Verified with `git ls-files data/`
  - [ ] All your changes are in `data/` folder

- [ ] **Backup (recommended):**
  - [ ] Committed `data/` folder to git
  - [ ] Have a local backup

## 🚨 What Happens on Deploy

### Scenario 1: Using PostgreSQL + DATABASE_URL set
```
Deploy → Build → Setup DB → Start App
         ↓
    Your data is in database ✅
    Changes persist ✅
```

### Scenario 2: Using JSON files + data/ in git
```
Deploy → Build → Start App
         ↓
    Reads data/ from git ✅
    Changes persist ✅
```

### Scenario 3: Using JSON files + data/ NOT in git
```
Deploy → Build → Start App
         ↓
    No data/ folder ❌
    Uses init script or empty ❌
    Changes LOST ❌
```

## 🔧 Quick Fix: Commit Data Folder

If you're worried, commit your data folder now:

```bash
# Check current status
git status

# Add data folder
git add data/

# Commit
git commit -m "Add data folder with all site content"

# Push
git push
```

## ✅ Recommended Setup for Railway

**Best Practice:**
1. ✅ Set up PostgreSQL on Railway
2. ✅ Set `DATABASE_URL` environment variable
3. ✅ Migrate local data to database
4. ✅ Commit `data/` folder to git (as backup)
5. ✅ Deploy with confidence

**Result:**
- Data in database (persistent) ✅
- Data in git (backup) ✅
- Safe from deployments ✅

## 🧪 Test Before Deploying

**Test locally with Railway database:**

```bash
# Get DATABASE_URL from Railway
export DATABASE_URL="postgresql://..."

# Migrate your data
npm run db:migrate

# Test the app
npm run dev

# Verify data is there
# Visit localhost:3000/site/plumber
```

If it works locally, it will work on Railway!

## 📝 Summary

**Your changes will be safe if:**
- ✅ Using PostgreSQL + `DATABASE_URL` is set
- ✅ OR `data/` folder is committed to git

**Your changes might be lost if:**
- ❌ Using JSON files + `data/` not in git
- ❌ No database setup

**Action items:**
1. Check if `DATABASE_URL` is set on Railway
2. If not, commit `data/` folder to git
3. Or set up PostgreSQL (recommended)

