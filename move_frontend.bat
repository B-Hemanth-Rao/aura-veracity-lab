@echo off
REM Frontend Reorganization Script (Windows Batch)
REM Moves all React/Vite frontend files into a frontend\ directory

setlocal enabledelayedexpansion

echo.
echo ================================================================
echo   Frontend Reorganization: Moving to frontend\ directory
echo ================================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found in current directory
    echo Please run this script from the repository root
    pause
    exit /b 1
)

echo [Step 1] Verifying current structure...
echo.
echo Frontend files found:

REM List files to move
if exist "src" echo   [Found] src\
if exist "public" echo   [Found] public\
if exist "package.json" echo   [Found] package.json
if exist "package-lock.json" echo   [Found] package-lock.json
if exist "yarn.lock" echo   [Found] yarn.lock
if exist "vite.config.ts" echo   [Found] vite.config.ts
if exist "vite.config.js" echo   [Found] vite.config.js
if exist "tailwind.config.ts" echo   [Found] tailwind.config.ts
if exist "tailwind.config.js" echo   [Found] tailwind.config.js
if exist "tsconfig.json" echo   [Found] tsconfig.json
if exist "tsconfig.app.json" echo   [Found] tsconfig.app.json
if exist "tsconfig.node.json" echo   [Found] tsconfig.node.json
if exist "index.html" echo   [Found] index.html
if exist "postcss.config.js" echo   [Found] postcss.config.js
if exist "components.json" echo   [Found] components.json
if exist "eslint.config.js" echo   [Found] eslint.config.js

echo.
echo [Step 2] Creating frontend\ directory...

if exist "frontend" (
    echo Warning: frontend\ directory already exists
    echo Backing up to frontend.backup...
    if exist "frontend.backup" rmdir /s /q "frontend.backup"
    ren "frontend" "frontend.backup"
    echo [OK] Backup created at frontend.backup\
)

if not exist "frontend" mkdir "frontend"
echo [OK] Created frontend\ directory

echo.
echo [Step 3] Moving frontend files...

REM Move directories
if exist "src" (
    echo   Moving: src\
    move "src" "frontend\src" >nul 2>&1
    if not errorlevel 1 echo     [OK]
)

if exist "public" (
    echo   Moving: public\
    move "public" "frontend\public" >nul 2>&1
    if not errorlevel 1 echo     [OK]
)

REM Move files
for %%F in (package.json package-lock.json yarn.lock vite.config.ts vite.config.js tailwind.config.ts tailwind.config.js postcss.config.js tsconfig.json tsconfig.app.json tsconfig.node.json index.html components.json eslint.config.js) do (
    if exist "%%F" (
        echo   Moving: %%F
        move "%%F" "frontend\%%F" >nul 2>&1
        if not errorlevel 1 echo     [OK]
    )
)

echo.
echo [Step 4] Verifying frontend\ structure...

if exist "frontend\package.json" (
    if exist "frontend\src" (
        echo [OK] Frontend structure looks good
        echo.
        echo Directory contents:
        dir "frontend" /b /ad
        dir "frontend\*.json" /b /a:-d 2>nul
        echo.
    ) else (
        echo Error: Missing src\ directory
        pause
        exit /b 1
    )
) else (
    echo Error: Missing package.json
    pause
    exit /b 1
)

echo [Step 5] Installing dependencies in frontend\...

cd "frontend"

if exist "package.json" (
    echo Detected npm...
    
    if exist "yarn.lock" (
        echo Using yarn...
        call yarn install
        if errorlevel 1 (
            echo Warning: yarn install failed
            echo Please run manually: cd frontend && yarn install
        ) else (
            echo [OK] Yarn dependencies installed
        )
    ) else (
        echo Using npm...
        call npm install
        if errorlevel 1 (
            echo Warning: npm install failed
            echo Please run manually: cd frontend && npm install
        ) else (
            echo [OK] NPM dependencies installed
        )
    )
) else (
    echo Error: package.json not found in frontend\
)

cd ".."

echo.
echo [Step 6] Updating .gitignore...

REM Add to gitignore if not present
findstr /m "^frontend/node_modules" .gitignore >nul 2>&1
if errorlevel 1 (
    echo frontend/node_modules>> .gitignore
    echo [OK] Added frontend/node_modules to .gitignore
)

findstr /m "^frontend/dist" .gitignore >nul 2>&1
if errorlevel 1 (
    echo frontend/dist>> .gitignore
    echo [OK] Added frontend/dist to .gitignore
)

echo.
echo ================================================================
echo REORGANIZATION COMPLETE!
echo ================================================================
echo.

echo New Directory Structure:
echo.
echo project-root\
echo  +-- frontend\
echo  ^|    +-- src\
echo  ^|    +-- public\
echo  ^|    +-- package.json
echo  ^|    +-- vite.config.ts
echo  ^|    +-- tsconfig.json
echo  ^|    +-- tailwind.config.ts
echo  ^|    +-- index.html
echo  ^|    +-- node_modules\
echo  ^|    +-- dist\
echo  +-- backend\
echo  ^|    +-- app\
echo  ^|    +-- main.py
echo  ^|    +-- requirements.txt
echo  ^|    +-- .env
echo  +-- supabase\
echo  ^|    +-- functions\
echo  ^|    +-- migrations\
echo  +-- [root config files]
echo.

echo ================================================================
echo NEXT STEPS - Git Commands:
echo ================================================================
echo.

echo 1. Review the changes:
echo    git status
echo.

echo 2. Remove old files from git tracking:
echo    git rm --cached src public package.json index.html ^^
echo      vite.config.ts tailwind.config.ts tsconfig.json ^^
echo      postcss.config.js components.json eslint.config.js 2^^^>nul
echo.

echo 3. Stage the new structure:
echo    git add frontend\ .gitignore
echo.

echo 4. Commit the reorganization:
echo    git commit -m "Refactor: Move frontend into frontend\ directory"
echo.

echo 5. Push to remote:
echo    git push origin main
echo.

echo ================================================================
echo Updated Commands for Development:
echo ================================================================
echo.

echo Start frontend dev server:
echo    cd frontend
echo    npm run dev
echo.

echo Start backend (in another terminal):
echo    cd backend
echo    uvicorn main:app --reload
echo.

echo Build frontend for production:
echo    cd frontend
echo    npm run build
echo.

echo Update frontend dependencies:
echo    cd frontend
echo    npm install
echo.

echo ================================================================
echo [OK] Frontend reorganization complete!
echo ================================================================
echo.

pause
