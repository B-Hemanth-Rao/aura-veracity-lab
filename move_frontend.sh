#!/bin/bash

# Frontend Reorganization Script
# Moves all React/Vite frontend files into a frontend/ directory
# Maintains safe execution with error handling and rollback capability

set -e

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Frontend Reorganization: Moving to frontend/ directory"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect OS
OS_TYPE=$(uname -s)
IS_WINDOWS=false
if [[ "$OS_TYPE" == "MINGW"* ]] || [[ "$OS_TYPE" == "MSYS"* ]]; then
    IS_WINDOWS=true
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ Error: package.json not found in current directory${NC}"
    echo -e "${YELLOW}Please run this script from the repository root${NC}"
    exit 1
fi

echo -e "${BLUE}[Step 1]${NC} Verifying current structure..."

# Detect frontend files
FRONTEND_FILES=(
    "src"
    "public"
    "package.json"
    "package-lock.json"
    "yarn.lock"
    "vite.config.ts"
    "vite.config.js"
    "tailwind.config.ts"
    "tailwind.config.js"
    "tailwind.config.mjs"
    "tsconfig.json"
    "tsconfig.app.json"
    "tsconfig.node.json"
    "index.html"
    "postcss.config.js"
    "postcss.config.ts"
    "components.json"
    "eslint.config.js"
    ".eslintrc.json"
    "vitest.config.ts"
    "vitest.config.js"
)

echo -e "${GREEN}Frontend files found:${NC}"
FILES_TO_MOVE=()
for file in "${FRONTEND_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "  ✓ $file"
        FILES_TO_MOVE+=("$file")
    fi
done

if [ ${#FILES_TO_MOVE[@]} -eq 0 ]; then
    echo -e "${RED}✗ No frontend files found!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}[Step 2]${NC} Creating frontend/ directory..."

if [ -d "frontend" ]; then
    echo -e "${YELLOW}⚠ frontend/ directory already exists${NC}"
    echo -e "${YELLOW}Backing up to frontend.backup...${NC}"
    if [ -d "frontend.backup" ]; then
        rm -rf "frontend.backup"
    fi
    mv "frontend" "frontend.backup"
    echo -e "${GREEN}✓ Backup created at frontend.backup/${NC}"
fi

mkdir -p "frontend"
echo -e "${GREEN}✓ Created frontend/ directory${NC}"

echo ""
echo -e "${BLUE}[Step 3]${NC} Moving frontend files..."

FAILED_MOVES=()
for file in "${FILES_TO_MOVE[@]}"; do
    if [ -e "$file" ]; then
        echo "  Moving: $file"
        mv "$file" "frontend/$file" 2>/dev/null || FAILED_MOVES+=("$file")
    fi
done

if [ ${#FAILED_MOVES[@]} -gt 0 ]; then
    echo -e "${RED}✗ Failed to move: ${FAILED_MOVES[@]}${NC}"
    echo -e "${YELLOW}⚠ Some files may still be in the root directory${NC}"
else
    echo -e "${GREEN}✓ All files moved successfully${NC}"
fi

echo ""
echo -e "${BLUE}[Step 4]${NC} Verifying frontend/ structure..."

if [ -f "frontend/package.json" ] && [ -d "frontend/src" ]; then
    echo -e "${GREEN}✓ Frontend structure looks good${NC}"
    echo ""
    echo "  Directory contents:"
    ls -la "frontend/" | grep -E "^d|package\.json|vite|tsconfig|index\.html" | sed 's/^/    /'
else
    echo -e "${RED}✗ Frontend structure incomplete!${NC}"
    echo "  Missing: package.json or src/"
    exit 1
fi

echo ""
echo -e "${BLUE}[Step 5]${NC} Installing dependencies in frontend/..."

cd "frontend"

if [ -f "package.json" ]; then
    echo -e "${YELLOW}Detected package manager...${NC}"
    
    if [ -f "yarn.lock" ]; then
        echo "Using yarn..."
        if command -v yarn &> /dev/null; then
            yarn install
            echo -e "${GREEN}✓ Yarn dependencies installed${NC}"
        else
            echo -e "${YELLOW}⚠ yarn not found, trying npm...${NC}"
            npm install
            echo -e "${GREEN}✓ NPM dependencies installed${NC}"
        fi
    else
        echo "Using npm..."
        if command -v npm &> /dev/null; then
            npm install
            echo -e "${GREEN}✓ NPM dependencies installed${NC}"
        else
            echo -e "${RED}✗ npm not found${NC}"
            echo "  Please run: cd frontend && npm install"
        fi
    fi
else
    echo -e "${YELLOW}⚠ package.json not found in frontend/{{NC}"
fi

cd ".."

echo ""
echo -e "${BLUE}[Step 6]${NC} Updating .gitignore..."

# Add frontend-specific ignores if not present
if [ -f ".gitignore" ]; then
    # Check if frontend node_modules is already ignored
    if ! grep -q "^frontend/node_modules" ".gitignore"; then
        echo "frontend/node_modules" >> ".gitignore"
        echo -e "${GREEN}✓ Added frontend/node_modules to .gitignore${NC}"
    fi
    
    if ! grep -q "^frontend/dist" ".gitignore"; then
        echo "frontend/dist" >> ".gitignore"
        echo -e "${GREEN}✓ Added frontend/dist to .gitignore${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}REORGANIZATION COMPLETE!${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}New Directory Structure:${NC}"
echo ""
echo "project-root/"
echo "├── frontend/"
echo "│   ├── src/"
echo "│   ├── public/"
echo "│   ├── package.json"
echo "│   ├── vite.config.ts"
echo "│   ├── tsconfig.json"
echo "│   ├── tailwind.config.ts"
echo "│   ├── index.html"
echo "│   ├── node_modules/"
echo "│   └── dist/"
echo "├── backend/"
echo "│   ├── app/"
echo "│   ├── main.py"
echo "│   ├── requirements.txt"
echo "│   └── .env"
echo "├── supabase/"
echo "│   ├── functions/"
echo "│   └── migrations/"
echo "└── [root config files]"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}NEXT STEPS - Git Commands:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}1. Review the changes:${NC}"
echo -e "${YELLOW}   git status${NC}"
echo ""

echo -e "${YELLOW}2. Remove old files from git tracking:${NC}"
echo -e "${YELLOW}   git rm --cached src/ public/ package.json index.html \\${NC}"
echo -e "${YELLOW}     vite.config.ts tailwind.config.ts tsconfig.json \\${NC}"
echo -e "${YELLOW}     postcss.config.js components.json eslint.config.js 2>/dev/null${NC}"
echo ""

echo -e "${YELLOW}3. Stage the new structure:${NC}"
echo -e "${YELLOW}   git add frontend/ .gitignore${NC}"
echo ""

echo -e "${YELLOW}4. Commit the reorganization:${NC}"
echo -e "${YELLOW}   git commit -m \"Refactor: Move frontend into frontend/ directory${NC}"
echo ""
echo "- Reorganized React/Vite frontend into frontend/ subdirectory"
echo "- Maintains separation of concerns: frontend/ and backend/"
echo "- Simplifies monorepo structure and CI/CD configuration"
echo "- Backend remains at root level, frontend at frontend/"
echo "- Updated .gitignore for new paths\""
echo ""

echo -e "${YELLOW}5. Push to remote:${NC}"
echo -e "${YELLOW}   git push origin main${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Updated Commands for Development:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Start frontend dev server:${NC}"
echo -e "${CYAN}   cd frontend${NC}"
echo -e "${CYAN}   npm run dev${NC}"
echo ""

echo -e "${YELLOW}Start backend (in another terminal):${NC}"
echo -e "${CYAN}   cd backend${NC}"
echo -e "${CYAN}   uvicorn main:app --reload${NC}"
echo ""

echo -e "${YELLOW}Build frontend for production:${NC}"
echo -e "${CYAN}   cd frontend${NC}"
echo -e "${CYAN}   npm run build${NC}"
echo ""

echo -e "${YELLOW}Update frontend dependencies:${NC}"
echo -e "${CYAN}   cd frontend${NC}"
echo -e "${CYAN}   npm install${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Update Configuration Files:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}If you have CI/CD pipelines, update paths:${NC}"
echo ""
echo "  GitHub Actions (.github/workflows/*.yml):"
echo -e "${CYAN}    - Change: npm run build${NC}"
echo -e "${CYAN}      To: cd frontend && npm run build${NC}"
echo ""

echo "  Docker (if containerizing frontend):"
echo -e "${CYAN}    - Change: COPY package.json .${NC}"
echo -e "${CYAN}      To: COPY frontend/package.json .${NC}"
echo -e "${CYAN}    - Change: COPY src ./src${NC}"
echo -e "${CYAN}      To: COPY frontend/src ./src{{NC}"
echo ""

echo "  Netlify/Vercel:"
echo -e "${CYAN}    - Base directory: frontend${NC}"
echo -e "${CYAN}    - Build command: npm run build${NC}"
echo -e "${CYAN}    - Publish directory: dist${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Rollback Instructions (if needed):${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

if [ -d "frontend.backup" ]; then
    echo -e "${YELLOW}Backup exists at frontend.backup/${NC}"
    echo ""
    echo "To rollback:"
    echo -e "${CYAN}   rm -rf frontend${NC}"
    echo -e "${CYAN}   mv frontend.backup frontend{{NC}"
    echo -e "${CYAN}   git reset --hard HEAD~1${NC}"
    echo ""
fi

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Frontend reorganization complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
