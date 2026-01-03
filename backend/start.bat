@echo off
REM Quick start script for Aura Veracity backend on Windows

echo.
echo 🚀 Starting Aura Veracity Backend Setup...
echo.

REM Check Python version
python --version

REM Create virtual environment if not exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -q -r requirements.txt

REM Create .env if not exists
if not exist ".env" (
    echo 📋 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env with your Supabase SERVICE_ROLE_KEY
    pause
)

REM Start development server
echo.
echo ✅ Setup complete!
echo.
echo 🎉 Starting development server...
echo 📖 API docs will be available at http://localhost:8000/docs
echo.

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
