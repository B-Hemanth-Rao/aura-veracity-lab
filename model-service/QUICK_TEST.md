"""
Quick Test Guide for Model Serving API

This file documents the steps to quickly test the FastAPI inference endpoint.

## Prerequisites

1. Model checkpoint exists at: model-service/checkpoints/debug.pth
   - If not, run: python model-service/src/train.py --data-dir model-service/data/sample --debug --output model-service/checkpoints/

2. Sample images exist at: model-service/data/sample/train/real/r0.jpg
   - If not, create them with the sample dataset generation script

## Quick Test

### Step 1: Create .env file (if not exists)

```bash
cd model-service
echo "MODEL_API_KEY=devkey" > .env
```

### Step 2: Start the API server

```bash
# From project root
export MODEL_API_KEY=devkey
uvicorn model_service.src.serve.api:app --reload --port 8001

# Or from model-service directory
export MODEL_API_KEY=devkey
uvicorn src.serve.api:app --reload --port 8001
```

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     FastAPI Server Starting...
INFO:     Using device: cpu
INFO:     Initializing model...
INFO:     Model checkpoint loaded from: .../checkpoints/debug.pth
INFO:     Model ready for inference
```

### Step 3: Test the /infer endpoint (in another terminal)

```bash
# Basic test with API key
curl -X POST \
  -H "X-API-KEY: devkey" \
  -F "file=@model-service/data/sample/train/real/r0.jpg" \
  http://127.0.0.1:8001/infer

# Expected response (200 OK):
{
  "request_id": "abc12345",
  "fake_prob": 0.45,
  "real_prob": 0.55
}
```

### Step 4: Test error cases

#### Missing API key (should get 401):
```bash
curl -X POST \
  -F "file=@model-service/data/sample/train/real/r0.jpg" \
  http://127.0.0.1:8001/infer

# Expected response (401 Unauthorized):
{"detail": "Invalid or missing X-API-KEY header"}
```

#### Invalid API key (should get 401):
```bash
curl -X POST \
  -H "X-API-KEY: wrongkey" \
  -F "file=@model-service/data/sample/train/real/r0.jpg" \
  http://127.0.0.1:8001/infer

# Expected response (401 Unauthorized):
{"detail": "Invalid or missing X-API-KEY header"}
```

#### Invalid image format (should get 400):
```bash
# Create a text file
echo "not an image" > test.txt

curl -X POST \
  -H "X-API-KEY: devkey" \
  -F "file=@test.txt" \
  http://127.0.0.1:8001/infer

# Expected response (400 Bad Request):
{"detail": "Invalid image format: ..."}
```

### Step 5: Check health and config endpoints

```bash
# Health check
curl http://127.0.0.1:8001/health

# Expected response:
{
  "status": "healthy",
  "model_loaded": true,
  "checkpoint_exists": true
}

# Server config
curl http://127.0.0.1:8001/config

# Expected response:
{
  "device": "cpu",
  "cuda_available": false,
  "checkpoint_path": "...",
  "checkpoint_exists": true,
  "model_loaded": true,
  "max_file_size_mb": 10.0
}

# API info
curl http://127.0.0.1:8001/

# Expected response:
{
  "name": "Frame Classification API",
  "version": "1.0.0",
  "endpoints": {
    "infer": "POST /infer - Run inference on image file",
    "health": "GET /health - Health check",
    "docs": "GET /docs - Interactive API docs",
    "redoc": "GET /redoc - Alternative API docs"
  }
}
```

## Interactive Testing

Open the Swagger UI in your browser:
- http://127.0.0.1:8001/docs

You can:
1. Click on POST /infer
2. Click "Try it out"
3. Enter X-API-KEY header value: `devkey`
4. Click "Choose File" and select an image
5. Click "Execute"

## Automated Testing

### Using Python (requests)

```python
import requests

api_key = "devkey"
image_path = "model-service/data/sample/train/real/r0.jpg"

with open(image_path, "rb") as f:
    files = {"file": f}
    headers = {"X-API-KEY": api_key}
    
    response = requests.post(
        "http://127.0.0.1:8001/infer",
        files=files,
        headers=headers,
    )

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# Verify response structure
result = response.json()
assert "request_id" in result
assert "fake_prob" in result
assert "real_prob" in result
assert 0 <= result["fake_prob"] <= 1
assert 0 <= result["real_prob"] <= 1
assert abs((result["fake_prob"] + result["real_prob"]) - 1.0) < 0.01
print("✓ All assertions passed!")
```

### Using pytest

```python
# Save as test_serve.py
import requests
import pytest

API_KEY = "devkey"
API_URL = "http://127.0.0.1:8001"
IMAGE_PATH = "model-service/data/sample/train/real/r0.jpg"

def test_infer_success():
    """Test successful inference."""
    with open(IMAGE_PATH, "rb") as f:
        files = {"file": f}
        headers = {"X-API-KEY": API_KEY}
        
        response = requests.post(
            f"{API_URL}/infer",
            files=files,
            headers=headers,
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "request_id" in data
    assert "fake_prob" in data
    assert "real_prob" in data
    assert 0 <= data["fake_prob"] <= 1
    assert 0 <= data["real_prob"] <= 1

def test_missing_api_key():
    """Test missing API key returns 401."""
    with open(IMAGE_PATH, "rb") as f:
        files = {"file": f}
        response = requests.post(f"{API_URL}/infer", files=files)
    
    assert response.status_code == 401
    assert "X-API-KEY" in response.json()["detail"]

def test_invalid_api_key():
    """Test invalid API key returns 401."""
    with open(IMAGE_PATH, "rb") as f:
        files = {"file": f}
        headers = {"X-API-KEY": "wrongkey"}
        response = requests.post(f"{API_URL}/infer", files=files, headers=headers)
    
    assert response.status_code == 401

def test_health_check():
    """Test health check endpoint."""
    response = requests.get(f"{API_URL}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

# Run with: pytest test_serve.py -v
```

Run the pytest tests:
```bash
pytest test_serve.py -v
```

## Environment Variables

For production, use environment variables instead of .env:

```bash
# Linux/Mac
export MODEL_API_KEY="your-strong-key"
export PYTHONUNBUFFERED=1

# Windows PowerShell
$env:MODEL_API_KEY = "your-strong-key"
$env:PYTHONUNBUFFERED = "1"

# Docker
docker run \
  -e MODEL_API_KEY="your-strong-key" \
  -p 8001:8001 \
  image-name
```

## Common Issues

### Model not loading
```
ERROR: Failed to initialize model: ...
```

**Solution**: Check that checkpoint exists:
```bash
ls -la model-service/checkpoints/debug.pth
```

If missing, train the model first:
```bash
python model-service/src/train.py --data-dir model-service/data/sample --debug --output model-service/checkpoints/
```

### Port already in use
```
ERROR: Address already in use
```

**Solution**: Use a different port:
```bash
uvicorn model_service.src.serve.api:app --reload --port 8002
```

### CUDA out of memory
```
RuntimeError: CUDA out of memory
```

**Solution**: Run on CPU instead:
```bash
export CUDA_VISIBLE_DEVICES=""
uvicorn model_service.src.serve.api:app --reload --port 8001
```

### File not found errors
```
FileNotFoundError: [Errno 2] No such file or directory: '...'
```

**Solution**: Ensure you're in the correct directory:
```bash
# From project root
cd model-service
export MODEL_API_KEY=devkey
uvicorn src.serve.api:app --reload --port 8001
```

## Next Steps

1. **Run full integration test** with backend API
2. **Deploy to staging** environment
3. **Load test** with multiple concurrent requests
4. **Monitor** with logging and metrics
5. **Update** to use trained model checkpoint

## Useful curl aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias test_infer='curl -X POST \
  -H "X-API-KEY: devkey" \
  -F "file=@model-service/data/sample/train/real/r0.jpg" \
  http://127.0.0.1:8001/infer'

alias test_health='curl http://127.0.0.1:8001/health'

alias test_docs='open http://127.0.0.1:8001/docs'
```

Then use:
```bash
test_infer
test_health
test_docs
```
"""

# This file is meant to be viewed/run, not imported
if __name__ == "__main__":
    print(__doc__)
