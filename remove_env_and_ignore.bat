@echo off
REM Security Fix Script: Remove .env from Git and Prevent Future Commits (Windows Batch)
REM This script safely removes .env from git tracking and prevents future commits
REM while keeping your local .env file intact

setlocal enabledelayedexpansion

echo.
echo ================================================================
echo   SECURITY FIX: Removing .env from Git Tracking
echo ================================================================
echo.

REM Step 1: Check if .env exists
echo [Step 1] Checking if .env exists in repository...
if exist .env (
    echo ✓ .env file found
    set ENV_EXISTS=true
) else (
    echo ⚠ .env file not found (may have already been removed)
    set ENV_EXISTS=false
)

echo.

REM Step 2: Remove .env from git index
echo [Step 2] Removing .env from git index (local file will be preserved)...
if "!ENV_EXISTS!"=="true" (
    git rm --cached .env 2>nul
    if !errorlevel! equ 0 (
        echo ✓ .env removed from git index
    ) else (
        echo ⚠ .env was not tracked by git
    )
) else (
    echo ⚠ Skipping removal (file doesn't exist locally)
)

echo.

REM Step 3: Append .env to .gitignore
echo [Step 3] Adding .env to .gitignore...
if exist .gitignore (
    findstr /M "^\.env$" .gitignore >nul 2>&1
    if !errorlevel! equ 0 (
        echo ⚠ .env already in .gitignore
    ) else (
        echo .env >> .gitignore
        echo ✓ Added .env to .gitignore
    )
) else (
    echo .env > .gitignore
    echo ✓ Created .gitignore and added .env
)

echo.

REM Step 4: Print security warning
echo ================================================================
echo ⚠  CRITICAL SECURITY WARNING
echo ================================================================
echo.
echo Your .env file was previously committed to the repository!
echo.
echo ACTION REQUIRED - You must immediately:
echo.
echo 1. ROTATE ALL API KEYS and secrets from your old .env file:
echo    - Supabase Project URL
echo    - Supabase Anon Key
echo    - Supabase Service Role Key
echo    - Any other API keys or tokens
echo.
echo 2. Generate new credentials in Supabase dashboard:
echo    - Navigate to Settings ^> API
echo    - Regenerate the Service Role Key
echo    - Regenerate the Anon Key if needed
echo.
echo 3. Update all .env files with new credentials:
echo    - backend/.env
echo    - Any other places using the old keys
echo.
echo 4. Push this fix to your repository ASAP
echo.
echo Failure to rotate keys could allow unauthorized access!
echo ================================================================
echo.

REM Step 5: Search for leaked secrets
echo [Step 5] Scanning last 30 commits for potential secret leaks...
echo.

setlocal
set found_matches=false

for %%P in (KEY SUPABASE SECRET TOKEN PASSWORD supabase_ api_key) do (
    echo Searching for: %%P
    git log --all -S "%%P" -n 30 --oneline 2>nul | findstr "." >nul 2>&1
    if !errorlevel! equ 0 (
        echo ⚠ Potential match found for: %%P
        echo Commits containing this pattern:
        git log --all -S "%%P" -n 30 --oneline 2>nul | findstr /M "." | head -5
        echo.
        set found_matches=true
    )
)

if "!found_matches!"=="false" (
    echo ✓ No obvious secret patterns found in recent commits
    echo   (This is not a guarantee - review commits manually if concerned)
) else (
    echo ⚠ Review the commits above for leaked secrets
)

echo.

REM Step 6: Print exact git commands
echo [Step 6] Git commands to commit this fix:
echo.
echo ================================================================
echo Copy and run these commands:
echo ================================================================
echo.
echo git add .gitignore
echo git commit -m "Security: Remove .env from git tracking and prevent future commits"
echo git push origin main
echo.
echo ================================================================
echo.

REM Additional helpful info
echo Additional Information:
echo.
echo To verify the fix worked:
echo   git status        [Should show .gitignore as modified]
echo.
echo To see what was removed from tracking:
echo   git diff --cached
echo.
echo To view full history of removed file:
echo   git log --full-history -- .env
echo.
echo To completely remove from git history (advanced):
echo   git filter-branch --tree-filter "rm -f .env" HEAD
echo   ⚠ Warning: Only use filter-branch if the repo hasn't been cloned by others
echo.

echo ================================================================
echo ✓ Script completed
echo ================================================================
echo.

endlocal
