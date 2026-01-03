# Frontend Reorganization Guide

## Overview

This guide walks you through reorganizing your repository to move all React/Vite frontend code into a dedicated `frontend/` directory, creating a cleaner monorepo structure alongside the `backend/` directory.

---

## Why Reorganize?

✅ **Better Project Organization**
- Clear separation between frontend and backend
- Easier for teams to navigate and understand structure

✅ **Simplified CI/CD**
- Separate build configurations for frontend and backend
- Deploy frontend and backend independently

✅ **Cleaner Root Directory**
- Root contains only config files and documentation
- Less clutter, easier to understand at a glance

✅ **Scalability**
- Easy to add more modules (docs/, tools/, etc.)
- Standard monorepo pattern

---

## New Directory Structure

```
project-root/
├── frontend/                    ← All React/Vite code here
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json             ← Frontend dependencies
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── index.html
│   ├── node_modules/            ← Frontend packages
│   └── dist/                    ← Build output
│
├── backend/                     ← FastAPI backend
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── main.py
│   ├── main.py
│   ├── requirements.txt         ← Backend dependencies
│   └── .env                     ← Backend config
│
├── supabase/                    ← Database & Edge Functions
│   ├── functions/
│   └── migrations/
│
├── README.md
├── .gitignore
├── .env.example
└── [other root config files]
```

---

## How to Run the Script

### Option 1: Bash (Linux/Mac/WSL)

```bash
# Navigate to project root
cd e:/project/aura-veracity-lab

# Make script executable
chmod +x move_frontend.sh

# Run the script
./move_frontend.sh
```

### Option 2: Windows Batch

```cmd
# Navigate to project root
cd e:\project\aura-veracity-lab

# Run the script
move_frontend.bat
```

### Option 3: PowerShell

```powershell
# Navigate to project root
cd e:\project\aura-veracity-lab

# Run bash script via WSL/Git Bash
bash move_frontend.sh

# Or run batch script
.\move_frontend.bat
```

---

## What the Script Does

### 1. **Verifies Current Structure**
- Checks for presence of frontend files
- Lists all files it will move
- Validates package.json exists

### 2. **Creates frontend/ Directory**
- Creates new `frontend/` folder
- Backs up existing `frontend/` if it exists (to `frontend.backup/`)

### 3. **Moves Frontend Files**
```
Files moved:
- src/                          ← React components and pages
- public/                       ← Static assets
- package.json                  ← NPM dependencies
- package-lock.json             ← Lock file
- yarn.lock                     ← Or yarn lock file
- vite.config.ts/js             ← Vite configuration
- tsconfig.json                 ← TypeScript config
- tsconfig.app.json             ← App TypeScript config
- tsconfig.node.json            ← Node TypeScript config
- tailwind.config.ts/js         ← Tailwind CSS config
- postcss.config.js             ← PostCSS config
- index.html                    ← HTML entry point
- components.json               ← UI components config
- eslint.config.js              ← ESLint config
```

### 4. **Installs Dependencies**
- Runs `npm install` or `yarn install` in the new `frontend/` directory
- Verifies everything is working

### 5. **Updates .gitignore**
- Adds `frontend/node_modules` to prevent committing packages
- Adds `frontend/dist` to prevent committing build output

### 6. **Prints Next Steps**
- Shows git commands to commit the changes
- Lists updated development commands
- Provides rollback instructions

---

## After Running the Script

### Step 1: Review Changes

```bash
git status
```

Expected output:
```
Changes not staged for commit:
  deleted:    src
  deleted:    public
  deleted:    package.json
  ...

Untracked files:
  frontend/
  ...
```

### Step 2: Remove Old Files from Git Tracking

```bash
git rm --cached src/ public/ package.json index.html \
  vite.config.ts tailwind.config.ts tsconfig.json \
  postcss.config.js components.json eslint.config.js 2>/dev/null
```

This tells git to stop tracking these files in their old locations.

### Step 3: Stage the New Structure

```bash
git add frontend/ .gitignore
```

### Step 4: Commit the Reorganization

```bash
git commit -m "Refactor: Move frontend into frontend/ directory

- Reorganized React/Vite frontend into frontend/ subdirectory
- Maintains separation of concerns: frontend/ and backend/
- Simplifies monorepo structure and CI/CD configuration
- Backend remains at root level, frontend at frontend/
- Updated .gitignore for new paths"
```

### Step 5: Push to Remote

```bash
git push origin main
```

---

## Updated Development Workflow

### Start Frontend Dev Server

**Old way:**
```bash
npm run dev
```

**New way:**
```bash
cd frontend
npm run dev
```

### Start Backend (in another terminal)

```bash
cd backend
uvicorn main:app --reload
```

### Build Frontend for Production

**Old way:**
```bash
npm run build
```

**New way:**
```bash
cd frontend
npm run build
```

### Install Frontend Dependencies

**Old way:**
```bash
npm install
```

**New way:**
```bash
cd frontend
npm install
```

### Update Package

**Old way:**
```bash
npm install <package-name>
```

**New way:**
```bash
cd frontend
npm install <package-name>
```

---

## Update CI/CD Configuration

If you have CI/CD pipelines, update them to reflect the new structure:

### GitHub Actions

**Before:**
```yaml
- name: Build frontend
  run: npm run build
```

**After:**
```yaml
- name: Build frontend
  run: cd frontend && npm run build
```

### Netlify/Vercel

**Build Settings:**
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`

### Docker (if containerizing)

**Before:**
```dockerfile
COPY package.json .
COPY src ./src
```

**After:**
```dockerfile
COPY frontend/package.json .
COPY frontend/src ./src
```

### Environment Variables

Update paths in environment files:
- `.env` files in `frontend/` directory
- Backend `.env` remains in `backend/` directory

---

## Rollback Instructions

If something goes wrong, you can rollback:

```bash
# Remove the frontend directory
rm -rf frontend

# Restore from backup (if it exists)
mv frontend.backup frontend

# Undo the last commit
git reset --hard HEAD~1

# The repository is back to its original state
```

---

## Common Issues & Solutions

### Issue: Script says "package.json not found"
**Solution:** Run the script from the repository root:
```bash
cd e:/project/aura-veracity-lab
./move_frontend.sh
```

### Issue: npm install fails in frontend/
**Solution:** Manual fix:
```bash
cd frontend
npm install
# or
yarn install
```

### Issue: Git still tracking old files
**Solution:** Use git rm --cached to untrack:
```bash
git rm --cached <file-path>
git add .
git commit -m "Remove old paths from tracking"
```

### Issue: VS Code can't find modules
**Solution:** VS Code might cache the old structure. Restart VS Code:
```bash
# Close VS Code
# Delete .vscode/settings.json if it references old paths
# Reopen VS Code
```

### Issue: Imports broken in frontend code
**Solution:** Imports should still work due to relative paths. If they don't:
```bash
cd frontend
npm install  # Reinstall dependencies
npm run dev  # Restart dev server
```

---

## Verification Checklist

After completing the reorganization:

- [ ] `frontend/` directory exists with all files
- [ ] `git status` shows expected deletions and additions
- [ ] `npm install` completed successfully in `frontend/`
- [ ] `cd frontend && npm run dev` starts the dev server
- [ ] Frontend loads at `http://localhost:8080`
- [ ] No import errors in frontend console
- [ ] Backend still runs at `cd backend && uvicorn main:app --reload`
- [ ] Git commit created with proper message
- [ ] Changes pushed to remote
- [ ] CI/CD pipelines updated (if applicable)
- [ ] Team notified of new structure

---

## Benefits of New Structure

### For Development
- Clear separation makes it easier to focus on frontend or backend
- No confusion about which files belong where
- Easier onboarding for new team members

### For Deployment
- Can deploy frontend and backend independently
- Different deployment strategies for each (Netlify for frontend, Cloud Run for backend)
- Easier to scale independently

### For Maintenance
- Clear responsibility boundaries
- Easier to manage dependencies separately
- Cleaner root directory with only essential files

### For CI/CD
- Separate workflows for frontend and backend
- Faster builds by only building what changed
- Easier to add testing for each part separately

---

## Files Created for This Task

1. **move_frontend.sh** - Bash automation script (Linux/Mac/WSL)
2. **move_frontend.bat** - Batch automation script (Windows)
3. **FRONTEND_REORGANIZATION_GUIDE.md** - This comprehensive guide

---

## Next Steps

1. **Run the appropriate script** for your OS
2. **Follow the git commands** printed by the script
3. **Update your workflows** (npm commands now require `cd frontend`)
4. **Update CI/CD** if you have pipelines
5. **Test everything** - frontend and backend should both work

---

## Questions?

Refer to these resources:
- **move_frontend.sh** - Detailed comments in the script
- **move_frontend.bat** - Windows equivalent
- This guide - Comprehensive documentation

All scripts include rollback capability if something goes wrong.

