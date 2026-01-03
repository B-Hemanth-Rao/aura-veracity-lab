#!/bin/bash

# Security Fix Script: Remove .env from Git and Prevent Future Commits
# This script safely removes .env from git tracking and prevents future commits
# while keeping your local .env file intact

set -e

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  SECURITY FIX: Removing .env from Git Tracking"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if .env exists
echo -e "${BLUE}[Step 1]${NC} Checking if .env exists in repository..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file found${NC}"
    ENV_EXISTS=true
else
    echo -e "${YELLOW}⚠ .env file not found (may have already been removed)${NC}"
    ENV_EXISTS=false
fi

echo ""

# Step 2: Remove .env from git index (keeps local copy safe)
echo -e "${BLUE}[Step 2]${NC} Removing .env from git index (local file will be preserved)..."
if [ "$ENV_EXISTS" = true ]; then
    git rm --cached .env 2>/dev/null || echo -e "${YELLOW}⚠ .env was not tracked by git${NC}"
    echo -e "${GREEN}✓ .env removed from git index${NC}"
else
    echo -e "${YELLOW}⚠ Skipping removal (file doesn't exist locally)${NC}"
fi

echo ""

# Step 3: Append .env to .gitignore
echo -e "${BLUE}[Step 3]${NC} Adding .env to .gitignore..."
if [ -f ".gitignore" ]; then
    if grep -q "^\.env$" .gitignore; then
        echo -e "${YELLOW}⚠ .env already in .gitignore${NC}"
    else
        echo ".env" >> .gitignore
        echo -e "${GREEN}✓ Added .env to .gitignore${NC}"
    fi
else
    echo ".env" > .gitignore
    echo -e "${GREEN}✓ Created .gitignore and added .env${NC}"
fi

echo ""

# Step 4: Print security warning
echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
echo -e "${RED}⚠  CRITICAL SECURITY WARNING${NC}"
echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${RED}Your .env file was previously committed to the repository!${NC}"
echo ""
echo -e "${YELLOW}ACTION REQUIRED - You must immediately:${NC}"
echo ""
echo "1. ROTATE ALL API KEYS and secrets from your old .env file:"
echo "   - Supabase Project URL"
echo "   - Supabase Anon Key"
echo "   - Supabase Service Role Key"
echo "   - Any other API keys or tokens"
echo ""
echo "2. Generate new credentials in Supabase dashboard:"
echo "   - Navigate to Settings → API"
echo "   - Regenerate the Service Role Key"
echo "   - Regenerate the Anon Key if needed"
echo ""
echo "3. Update all .env files with new credentials:"
echo "   - backend/.env"
echo "   - Any other places using the old keys"
echo ""
echo "4. Push this fix to your repository ASAP"
echo ""
echo -e "${RED}Failure to rotate keys could allow unauthorized access!${NC}"
echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Step 5: Search for leaked secrets in recent commits
echo -e "${BLUE}[Step 5]${NC} Scanning last 30 commits for potential secret leaks..."
echo ""

# Patterns to search for
PATTERNS=("KEY=" "SECRET=" "TOKEN=" "PASSWORD=" "SUPABASE_" "supabase_" "api_key" "apikey" "pwd=" "pass=")

FOUND_MATCHES=false

for pattern in "${PATTERNS[@]}"; do
    echo -e "${YELLOW}Searching for: $pattern${NC}"
    
    # Search in commit diffs
    if git log -p --all -S "$pattern" -n 30 --oneline 2>/dev/null | grep -i "$pattern" > /dev/null 2>&1; then
        echo -e "${RED}⚠ Potential match found for: $pattern${NC}"
        echo "Commits containing this pattern:"
        git log --all -S "$pattern" -n 30 --oneline 2>/dev/null | head -5
        echo ""
        FOUND_MATCHES=true
    fi
done

if [ "$FOUND_MATCHES" = false ]; then
    echo -e "${GREEN}✓ No obvious secret patterns found in recent commits${NC}"
    echo "  (This is not a guarantee - review commits manually if concerned)"
else
    echo -e "${RED}⚠ Review the commits above for leaked secrets${NC}"
fi

echo ""

# Step 6: Print exact git commands to commit the fix
echo -e "${BLUE}[Step 6]${NC} Git commands to commit this fix:"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Copy and run these commands:${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}git add .gitignore${NC}"
echo -e "${BLUE}git commit -m \"Security: Remove .env from git tracking and prevent future commits\"${NC}"
echo -e "${BLUE}git push origin main${NC}"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Additional helpful info
echo -e "${GREEN}Additional Information:${NC}"
echo ""
echo "To verify the fix worked:"
echo -e "${BLUE}git status${NC}  # Should show .gitignore as modified"
echo ""
echo "To see what was removed from tracking:"
echo -e "${BLUE}git diff --cached${NC}"
echo ""
echo "To view full history of removed file:"
echo -e "${BLUE}git log --full-history -- .env${NC}"
echo ""
echo "To completely remove from git history (advanced):"
echo -e "${BLUE}git filter-branch --tree-filter 'rm -f .env' HEAD${NC}"
echo -e "${YELLOW}⚠ Warning: Only use filter-branch if the repo hasn't been cloned by others${NC}"
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Script completed${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
