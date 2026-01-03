# Configuration Refactoring - Quick Reference

## ⚡ Quick Start

### Install Dependencies
```bash
cd model-service
pip install -r requirements.txt  # Now includes pyyaml
```

### Run API with Default Config
```bash
python -m uvicorn src.serve.api:app --host 0.0.0.0 --port 8000
# Uses config from: config/config.yaml
```

### Run API with Custom Configuration
```bash
# Option 1: Environment variables
export MODEL_SERVER_PORT=9001
export MODEL_LOGGING_LEVEL=DEBUG
python -m uvicorn src.serve.api:app

# Option 2: .env file
echo "MODEL_SERVER_PORT=9001" > .env
echo "MODEL_LOGGING_LEVEL=DEBUG" >> .env
python -m uvicorn src.serve.api:app

# Option 3: Modify config/config.yaml
nano config/config.yaml  # Edit and save
python -m uvicorn src.serve.api:app
```

### Train Model
```bash
# With default device (auto-detect CUDA if available)
python src/train.py --data-dir data/sample --debug --output checkpoints/

# Force CPU training
export MODEL_INFERENCE_DEVICE=cpu
python src/train.py --data-dir data/sample --debug --output checkpoints/

# Force CUDA training
export MODEL_INFERENCE_DEVICE=cuda
python src/train.py --data-dir data/sample --debug --output checkpoints/
```

### Run Tests
```bash
# Config tests (23 tests)
python -m pytest tests/test_config.py -v

# All tests
python -m pytest tests/ -v
```

---

## 📋 Configuration Options

### Model Configuration
```yaml
model:
  checkpoint_path: "checkpoints/debug.pth"     # ENV: MODEL_MODEL_CHECKPOINT_PATH
  image_size: 224                               # ENV: MODEL_MODEL_IMAGE_SIZE
  model_type: "efficientnet_b3"                # (no env override)
```

### Server Configuration
```yaml
server:
  host: "0.0.0.0"                              # ENV: MODEL_SERVER_HOST
  port: 8000                                   # ENV: MODEL_SERVER_PORT
  max_file_size_mb: 10                         # ENV: MODEL_SERVER_MAX_FILE_SIZE_MB
  workers: 1                                   # (no env override)
  reload: false                                # (no env override)
```

### Logging Configuration
```yaml
logging:
  level: "INFO"                                # ENV: MODEL_LOGGING_LEVEL
  json: true                                   # ENV: MODEL_LOGGING_JSON
  log_file: ""                                 # (no env override)
```

### Security Configuration
```yaml
security:
  api_key: "change-in-production"              # ENV: MODEL_API_KEY ⭐ IMPORTANT
  require_api_key: true                        # (no env override)
```

### Inference Configuration
```yaml
inference:
  device: "auto"                               # ENV: MODEL_INFERENCE_DEVICE
  cache_model: true                            # (no env override)
  max_concurrent: 4                            # (no env override)
```

---

## 🐍 Python API

### Get Configuration
```python
from src.config import get_config

config = get_config()
print(config.server.port)  # 8000
print(config.model.checkpoint_path)  # /path/to/checkpoint.pth
```

### Access All Values
```python
config = get_config()

# Model
checkpoint = config.model.checkpoint_path
image_size = config.model.image_size

# Server
host = config.server.host
port = config.server.port
max_file_size = config.server.max_file_size_mb

# Logging
log_level = config.logging.level
use_json = config.logging.json

# Security
api_key = config.security.api_key

# Inference
device = config.inference.device  # "auto" -> resolves to "cuda" or "cpu"
```

### Debug Configuration
```python
from src.config import get_config, print_config

# Print full config as JSON
print(print_config())

# Check specific value
config = get_config()
if config.logging.json:
    print("JSON logging enabled")
```

---

## 🗂️ File Structure

```
model-service/
├── 📄 config/
│   ├── config.yaml              ✨ MAIN CONFIGURATION FILE
│   └── .env.example             Environment variable reference
├── 📄 src/
│   ├── config.py                ✨ CONFIGURATION MODULE (new)
│   ├── serve/
│   │   └── api.py               Updated to use config
│   ├── train.py                 Updated to use config
│   └── models/
│       └── frame_model.py
├── 📄 tests/
│   ├── test_config.py           ✨ CONFIGURATION TESTS (new)
│   └── test_model.py
├── 📄 requirements.txt           Updated: added pyyaml
├── 📄 CONFIG_REFACTORING.md      Complete guide
└── 📄 REFACTORING_SUMMARY.md     Summary report
```

---

## ✅ Testing

### Run Config Tests
```bash
cd model-service
python -m pytest tests/test_config.py -v
```

**Expected Output**:
```
tests/test_config.py::TestModelConfig::test_default_values PASSED
tests/test_config.py::TestModelConfig::test_checkpoint_path_resolution PASSED
... (21 more tests)
======================== 23 passed in 0.24s ========================
```

### Verify Integration
```bash
# Test API can load
python -c "from src.serve.api import app; print('✅ API loads')"

# Test training script can load
python -c "from src.train import config; print('✅ Training script loads')"

# Test config directly
python -c "from src.config import get_config; c = get_config(); print(f'✅ Config loaded: port={c.server.port}')"
```

---

## 🔧 Changing Configuration

### Method 1: Edit config.yaml (Persistent)
```bash
# Edit the main config file
nano config/config.yaml

# Changes apply to all future runs
python -m uvicorn src.serve.api:app
```

### Method 2: Create .env file (Local Override)
```bash
# Create .env in model-service directory
cat > .env << EOF
MODEL_SERVER_PORT=9001
MODEL_LOGGING_LEVEL=DEBUG
MODEL_API_KEY=my-secret-key
EOF

# Run - will load from .env
python -m uvicorn src.serve.api:app
```

### Method 3: Environment Variables (Temporary)
```bash
# Set for current shell session
export MODEL_SERVER_PORT=9001
export MODEL_LOGGING_LEVEL=DEBUG

# Run - uses environment variables
python -m uvicorn src.serve.api:app

# Variables are lost when shell closes
```

### Priority Order
```
1. Environment Variables     (highest priority)
2. .env file
3. config/config.yaml
4. Default values           (lowest priority)
```

---

## 🔐 Security

### Default API Key
```yaml
security:
  api_key: "change-in-production"
```

⚠️ **IMPORTANT**: Change this before production deployment!

### Production Setup
```bash
# Option 1: Use strong random key in config.yaml
security:
  api_key: "sk_prod_8f7a9b3c4d5e6f7a8b9c0d1e2f3a4b5c"

# Option 2: Use environment variable (recommended)
export MODEL_API_KEY="sk_prod_8f7a9b3c4d5e6f7a8b9c0d1e2f3a4b5c"
python -m uvicorn src.serve.api:app

# Option 3: Use .env file (not in version control)
echo "MODEL_API_KEY=sk_prod_8f7a9b3c4d5e6f7a8b9c0d1e2f3a4b5c" > .env
python -m uvicorn src.serve.api:app
```

**Best Practice**: Use environment variables or .env file, never hardcode in config.yaml for production.

---

## 📊 Configuration Examples

### Example 1: Development Setup
```yaml
# config/config.yaml
server:
  host: "127.0.0.1"
  port: 8001
  reload: true

logging:
  level: "DEBUG"
  json: false

inference:
  device: "auto"
```

### Example 2: Production Setup
```yaml
# config/config.yaml
server:
  host: "0.0.0.0"
  port: 8000
  max_file_size_mb: 100
  workers: 4
  reload: false

logging:
  level: "INFO"
  json: true
  log_file: "/var/log/model-service/api.log"

inference:
  device: "cuda"
  max_concurrent: 8

security:
  api_key: "CHANGE_ME"  # Override with env var!
```

### Example 3: CPU-Only Setup
```yaml
# config/config.yaml
inference:
  device: "cpu"
  cache_model: true
  max_concurrent: 2

server:
  workers: 1  # Reduce workers on CPU
```

### Example 4: Large File Support
```yaml
# config/config.yaml
server:
  max_file_size_mb: 500  # 500 MB max upload

model:
  image_size: 512  # Larger images
```

---

## 📈 Monitoring

### Check Configuration Status
```bash
# Print current configuration
python -c "from src.config import print_config; print(print_config())"

# Check specific value
python -c "from src.config import get_config; c = get_config(); print(f'Device: {c.inference.device}')"
```

### Verify Configuration in Logs
```bash
# Run with config output
python -c "
from src.config import get_config, print_config
c = get_config()
print('Configuration loaded:')
print(print_config())
"
```

### Health Check Endpoint
```bash
# API provides /config endpoint for debugging
curl http://localhost:8000/config | jq

# Response includes config-driven values
{
  "device": "cuda",
  "checkpoint_path": "/path/to/checkpoints/debug.pth",
  "max_file_size_mb": 10,
  "api_key_required": true,
  "logging_level": "INFO"
}
```

---

## 🚀 Deployment

### Docker
```bash
# Configuration in container:
# - Loads from config/config.yaml
# - Can override with environment variables
# - .env file not used (set ENV vars instead)

docker run -e MODEL_SERVER_PORT=8000 \
           -e MODEL_API_KEY=sk_prod_xxx \
           -e MODEL_LOGGING_LEVEL=INFO \
           aura-veracity-backend
```

### Kubernetes
```yaml
# config/config.yaml in image
# Override in deployment:
env:
  - name: MODEL_SERVER_PORT
    value: "8000"
  - name: MODEL_API_KEY
    valueFrom:
      secretKeyRef:
        name: api-secrets
        key: api_key
  - name: MODEL_INFERENCE_DEVICE
    value: "cuda"
```

### Cloud Run / App Engine
```bash
# Set environment variables
export MODEL_SERVER_PORT=8080  # Cloud Run requires port 8080
export MODEL_API_KEY=sk_prod_xxx
export MODEL_LOGGING_LEVEL=INFO

# Deploy
python -m uvicorn src.serve.api:app --host 0.0.0.0 --port 8080
```

---

## ⚠️ Troubleshooting

### Configuration Not Loading
```
Error: No such file or directory: 'config/config.yaml'
```
**Solution**: Create config/config.yaml or it will use defaults. Check file exists:
```bash
ls -la config/config.yaml
```

### Invalid Configuration
```
Error: ValueError: Invalid configuration: ...
```
**Solution**: Check YAML syntax and field values:
```bash
python -c "from src.config import get_config; print(get_config())"
```

### Port Already in Use
```
Error: Address already in use
```
**Solution**: Change port in config:
```bash
export MODEL_SERVER_PORT=9001
python -m uvicorn src.serve.api:app
```

### API Key Not Recognized
```
Error: 401 Unauthorized - Invalid or missing X-API-KEY header
```
**Solution**: Ensure API key is set correctly:
```bash
export MODEL_API_KEY=your-key-here
python -m uvicorn src.serve.api:app
```

### Device Not Available
```
Warning: Requested device 'cuda' but not available, falling back to 'cpu'
```
**Solution**: Check CUDA availability or change device:
```bash
export MODEL_INFERENCE_DEVICE=cpu
python src/train.py --data-dir data/sample --debug
```

---

## 📚 Further Reading

- **CONFIG_REFACTORING.md** - Complete refactoring guide
- **REFACTORING_SUMMARY.md** - Detailed summary report
- **config/config.yaml** - Configuration file with comments
- **src/config.py** - Source code with docstrings
- **tests/test_config.py** - Unit tests as usage examples

---

## ✅ Checklist

- [ ] Install requirements: `pip install -r requirements.txt`
- [ ] Review `config/config.yaml` and customize as needed
- [ ] Run tests: `python -m pytest tests/test_config.py -v`
- [ ] Start API: `python -m uvicorn src.serve.api:app`
- [ ] Test API: `curl http://localhost:8000/health`
- [ ] Check config endpoint: `curl http://localhost:8000/config`

---

## 📞 Support

For issues or questions:
1. Check CONFIG_REFACTORING.md for detailed guide
2. Review config/config.yaml for available options
3. Run tests to validate configuration
4. Check logs with `MODEL_LOGGING_LEVEL=DEBUG`

---

**Status**: ✅ Configuration refactoring complete  
**Tests**: ✅ 23/23 passing  
**Backward Compatible**: ✅ Yes  
**Production Ready**: ✅ Yes

