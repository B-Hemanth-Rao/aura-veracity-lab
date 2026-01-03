# QUICK REFERENCE CARD

## What's Been Done
✅ `.env` removed from git  
✅ `.env` added to `.gitignore`  
✅ Documentation created  
✅ Scripts generated  

## What YOU Need to Do (35 min)

### 1️⃣ Rotate API Keys (15 min)
```
Go to: https://supabase.com/dashboard
Project: aura-veracity-lab
Settings > API > Project Keys
Regenerate: Service Role Key
Review: Anon Key
```

### 2️⃣ Update backend/.env (5 min)
```bash
cd backend
nano .env  # Edit with new keys
```

### 3️⃣ Test Backend (5 min)
```bash
cd backend
uvicorn main:app --reload
# Should see: Uvicorn running on http://127.0.0.1:8000
```

### 4️⃣ Test Frontend (5 min)
```bash
npm run dev
# Navigate to http://localhost:8080
# Try to sign in
```

### 5️⃣ Commit & Push (5 min)
```bash
git add .gitignore
git commit -m "Security: Remove .env from git tracking"
git push origin main
```

---

## Files Created

| File | Purpose |
|------|---------|
| `URGENT_ACTION_ITEMS.md` | **START HERE** - 35 min checklist |
| `SECURITY_FIX_SUMMARY.md` | Quick overview |
| `SECURITY_FIX_REPORT.md` | Detailed guide |
| `remove_env_and_ignore.sh` | Bash automation |
| `remove_env_and_ignore.bat` | Windows automation |

---

## Current Status

```
On branch main
Changes to be committed:
  deleted: .env
Changes not staged:
  modified: .gitignore
```

---

## If Something Goes Wrong

1. **Backend won't start?**
   - Check Supabase project is active
   - Verify keys are correct in backend/.env
   - Check SUPABASE_URL hasn't changed

2. **Frontend can't auth?**
   - May need to update SUPABASE_ANON_KEY in client.ts
   - Clear browser localStorage
   - Try signing in again

3. **Git push fails?**
   - Verify git credentials
   - Check branch protection rules
   - Ensure push access

---

## Don't Forget!

⚠️ **The old keys are exposed in git history**  
⚠️ **You MUST rotate them immediately**  
⚠️ **Do not delay - every minute counts**  

---

**Time Estimate: 35 minutes**  
**Urgency: CRITICAL**  
**Status: Ready to Start**

