#!/bin/bash
# Quick start script for Aura Veracity backend development

set -e

echo "🚀 Starting Aura Veracity Backend Setup..."

# Check Python version
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Create .env if not exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your Supabase SERVICE_ROLE_KEY"
fi

# Run tests
echo "🧪 Running tests..."
pytest -v || true

# Start development server
echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 Starting development server..."
echo "📖 API docs will be available at http://localhost:8000/docs"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
