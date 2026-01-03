# FRONTEND REORGANIZATION - QUICK START

## What This Does

Moves all React/Vite frontend code from the root directory into a new `frontend/` directory, creating a cleaner monorepo structure:

```
BEFORE:                  AFTER:
project/                 project/
├── src/                 ├── frontend/
├── public/              │   ├── src/
├── package.json         │   ├── public/
├── vite.config.ts       │   └── package.json
├── backend/             ├── backend/
└── ...                  └── ...
```

---

## Run the Script

### Windows (PowerShell or CMD)
```powershell
cd e:\project\aura-veracity-lab
.\move_frontend.bat
```

### Linux/Mac/WSL (Bash)
```bash
cd e:/project/aura-veracity-lab
chmod +x move_frontend.sh
./move_frontend.sh
```

---

## What Gets Moved

✅ Files moved to `frontend/`:
- `src/` - React components
- `public/` - Static assets
- `package.json` - Frontend dependencies
- `vite.config.ts` - Vite config
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind config
- `index.html` - HTML entry
- And other frontend files

❌ Files NOT moved (stay at root):
- `backend/` - Stays in place
- `supabase/` - Stays in place
- Root config files (README, .gitignore, etc.)

---

## Git Commands (After Running Script)

```bash
# 1. Review changes
git status

# 2. Remove old files from tracking
git rm --cached src/ public/ package.json index.html vite.config.ts

# 3. Stage new structure
git add frontend/ .gitignore

# 4. Commit
git commit -m "Refactor: Move frontend into frontend/ directory"

# 5. Push
git push origin main
```

---

## New Development Commands

| Task | Old Command | New Command |
|------|-----------|------------|
| Start dev | `npm run dev` | `cd frontend && npm run dev` |
| Build | `npm run build` | `cd frontend && npm run build` |
| Install pkg | `npm install <pkg>` | `cd frontend && npm install <pkg>` |
| Run tests | `npm run test` | `cd frontend && npm run test` |

Backend commands stay the same:
```bash
cd backend
uvicorn main:app --reload
```

---

## Rollback (If Needed)

```bash
rm -rf frontend
mv frontend.backup frontend
git reset --hard HEAD~1
```

---

## Status

✅ Scripts created and ready to use
📋 Documentation provided
⏳ Ready for execution

---

## Next Step

Run the script appropriate for your OS, then follow the git commands it outputs.

