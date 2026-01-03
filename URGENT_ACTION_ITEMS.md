# IMMEDIATE ACTION ITEMS - URGENT

## Current Status
- ✅ `.env` removed from git index
- ✅ `.env` added to `.gitignore`
- ✅ Local `.env` file preserved
- ⏳ **API keys NOT yet rotated** (URGENT)

---

## IMMEDIATE ACTIONS (Do These Now)

### 1. Rotate Supabase Keys (CRITICAL - 15 minutes)

**Go to:** https://supabase.com/dashboard

1. Select your project: **aura-veracity-lab**
2. Click: **Settings** (bottom left)
3. Click: **API**
4. Under "Project Keys":
   - **Service Role Key**: Click the menu → Regenerate
   - **Anon Key**: Review and optionally regenerate
5. Copy the new keys

### 2. Update backend/.env (5 minutes)

```bash
cd e:/project/aura-veracity-lab/backend

# Open your text editor
nano .env  # or VS Code, PowerShell ISE, etc.

# Replace with new values:
SUPABASE_SERVICE_ROLE_KEY=<paste-new-service-role-key>
SUPABASE_ANON_KEY=<paste-new-anon-key>

# Save and close
```

### 3. Test Backend (5 minutes)

```bash
cd e:/project/aura-veracity-lab/backend
uvicorn main:app --reload

# Should see:
# Uvicorn running on http://127.0.0.1:8000
# ✓ [dependencies loaded]

# If errors: Something is wrong with the new keys
# Check the error message and verify keys in Supabase
```

### 4. Test Frontend (5 minutes)

```bash
# In another terminal:
cd e:/project/aura-veracity-lab
npm run dev

# Should see:
# ➜ Local: http://localhost:8080/

# Navigate to http://localhost:8080
# Try to sign in
# Should work without errors
```

### 5. Commit and Push (5 minutes)

```bash
cd e:/project/aura-veracity-lab

# Stage the gitignore change
git add .gitignore

# Commit
git commit -m "Security: Remove .env from git tracking

- Removed .env from git tracking to prevent future leaks
- Added .env to .gitignore
- Local .env preserved for development
- API keys have been rotated"

# Push to remote
git push origin main

# Verify
git log --oneline -n 3  # Should show your new commit
```

---

## Total Time: ~35 minutes

1. Rotate keys: 15 min
2. Update .env: 5 min
3. Test backend: 5 min
4. Test frontend: 5 min
5. Commit & push: 5 min

---

## Reference Documents

**Read These for Detailed Info:**

1. **SECURITY_FIX_SUMMARY.md** - Quick overview
2. **SECURITY_FIX_REPORT.md** - Complete guide with all details
3. **remove_env_and_ignore.sh** - Bash automation script
4. **remove_env_and_ignore.bat** - Windows automation script

---

## Troubleshooting

### "Backend won't start - connection error"
- ✓ Check Supabase project is still active
- ✓ Verify new Service Role Key is correct in backend/.env
- ✓ Check SUPABASE_URL hasn't changed (it shouldn't)

### "Frontend can't auth - 401 errors"
- ✓ Check Supabase Anon Key in src/integrations/supabase/client.ts
- ✓ May need to update SUPABASE_ANON_KEY in that file
- ✓ Clear browser localStorage: DevTools > Application > localStorage > Clear All
- ✓ Try signing in again

### "Git push fails - permission denied"
- ✓ Verify your git credentials are correct
- ✓ Check branch protection rules (if using GitHub)
- ✓ Ensure you have push access to the repo

### "Can't find where to rotate keys"
- ✓ Go to: https://supabase.com
- ✓ Sign in to your account
- ✓ Select project: **aura-veracity-lab**
- ✓ Left sidebar: Click **Settings**
- ✓ Look for **API** section
- ✓ Keys should be visible in "Project Keys"

---

## What Happens After

Once this is complete:

✅ Your repo is protected from future `.env` commits  
✅ Old keys are rotated and inaccessible  
✅ Backend and frontend work with new credentials  
✅ Git history shows the security fix  
✅ Team sees that security is taken seriously  

---

## Remember

⚠️ **Never commit secrets again!**

Going forward:
- Always add sensitive files to `.gitignore`
- Use `.env.example` as a template (no real secrets)
- Consider using GitHub Secrets for CI/CD
- Enable branch protection to prevent accidents
- Use tools like git-secrets to block commits

---

## Questions?

If something goes wrong:

1. **Don't panic** - Local `.env` file is still safe
2. **Check error messages** - They usually tell you what's wrong
3. **Test one thing at a time** - Backend first, then frontend
4. **Verify keys** - Double-check they're copied correctly from Supabase
5. **Read the full reports** - SECURITY_FIX_REPORT.md has lots of detail

---

**START NOW - This is time-sensitive!**

The old keys are exposed in git history until you rotate them.

Every minute you wait increases the risk of unauthorized access.

