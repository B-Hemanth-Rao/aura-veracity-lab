# Dataset Audit - Quick Start Guide

## Overview

The dataset audit module validates train/val/test splits for data leakage **before training**. It detects:
- ⚠️ Identity overlap (same person in multiple splits)
- ⚠️ Duplicate videos (bit-for-bit identical files)
- ⚠️ Duplicate audio (identical audio tracks)
- ⚠️ Suspicious metadata patterns

## 30-Second Quick Start

```bash
cd model-service

# Basic audit on default config
python audit_dataset.py --config config/config.yaml

# Or with custom data path
python audit_dataset.py --data-root /path/to/your/data --splits train val test

# Check the report
cat audit_report.json
```

## What You'll See

```
============================================================
AUDIT SUMMARY
============================================================
Risk Level: NONE
Issues Found: 0
Total Samples: 12215
Samples by Split:
  train     :  8234
  val       :  2105
  test      :  1876

Recommendations:
  • No data leakage detected. Dataset appears clean.
============================================================
```

## Risk Levels Explained

| Level | What It Means | What To Do |
|-------|---------------|-----------|
| **NONE** | ✅ All clear | Proceed with training |
| **LOW** | ⚠️ Minor issues | Check recommendations |
| **MEDIUM** | ⚠️⚠️ Some issues | Review & consider fixes |
| **HIGH** | 🔴 Serious issues | Stop & fix dataset |
| **CRITICAL** | 🔴🔴 Major problems | Stop & redesign splits |

## Understanding Findings

### Identity Overlap
**Problem:** Same person appears in train AND val/test
```json
"identity_overlap": {
  "('train', 'val')": ["person_001", "person_042"]
}
```
**Fix:** Move all person_001 samples to single split

### Video Hash Collision
**Problem:** Identical video file in multiple splits (copy-paste error?)
```json
"video_hash_collisions": {
  "('train', 'val')": [
    {
      "hash": "a7f3d2c8e9b1...",
      "split1_samples": ["train_001"],
      "split2_samples": ["val_034"]
    }
  ]
}
```
**Fix:** Remove duplicate from one split

### Audio Hash Collision
**Problem:** Same audio track in multiple splits
**Fix:** Re-extract audio or verify split assignments

### Metadata Similarity
**Problem:** Too many samples with identical codec/resolution
**Fix:** Verify diverse data sources; check encoding pipeline

## Real Example: Fixing Issues

```bash
# Run audit
python audit_dataset.py --data-root data/deepfake

# View report
cat audit_report.json

# If identity overlap found:
# Move person_001 samples to train only
mv data/deepfake/val/person_001_* data/deepfake/train/

# If duplicate video found:
# Remove from test split
rm data/deepfake/test/video_123/video.mp4

# Re-run audit
python audit_dataset.py --data-root data/deepfake
```

## Expected Performance

- **1,000 samples**: ~8 seconds
- **10,000 samples**: ~80 seconds ⏱️
- **100,000 samples**: ~13 minutes

(Depends on disk speed; slower on network drives)

## Integration with Training

Before running training, add this check:

```python
# train.py
import sys
from audit_dataset import DatasetAuditor

# Audit first
auditor = DatasetAuditor(data_root='data/deepfake', config=config)
report = auditor.audit()

# Stop if critical/high risk
if report['risk_assessment']['level'] in {'CRITICAL', 'HIGH'}:
    print("❌ Dataset audit failed!")
    for rec in report['recommendations']:
        print(f"  → {rec}")
    sys.exit(1)

# Warn if medium risk
if report['risk_assessment']['level'] == 'MEDIUM':
    print("⚠️  Dataset warnings:")
    for rec in report['recommendations']:
        print(f"  → {rec}")
    print("Proceeding anyway...")

# Safe to train
print(f"✅ Dataset audit passed ({report['total_samples']} samples)")
train_model(config)
```

## Dataset Structure

The audit expects this directory layout:

```
data/deepfake/
├── train/
│   ├── sample_001/
│   │   ├── video.mp4              ← video file (required)
│   │   ├── audio.wav              ← audio file (optional)
│   │   └── meta.json              ← metadata (optional)
│   ├── sample_002/
│   │   └── ...
├── val/
│   ├── sample_101/
│   │   └── ...
└── test/
    ├── sample_201/
    │   └── ...
```

**Metadata JSON format:**
```json
{
  "label": 0,
  "identity": "person_001",
  "speaker": "actor_042"
}
```

## CLI Options

```bash
python audit_dataset.py [options]
```

**Options:**
- `--config FILE` - Config YAML path (loads data_root automatically)
- `--data-root PATH` - Override data root directory
- `--splits SPLITS...` - Which splits to audit (default: train val test)
- `--output FILE` - JSON report path (default: audit_report.json)
- `--verbose` - Show detailed logging

**Examples:**
```bash
# With config file
python audit_dataset.py --config config/config.yaml

# Custom output
python audit_dataset.py --data-root data/my_data --output results/audit.json

# Only audit train/val (skip test)
python audit_dataset.py --data-root data/deepfake --splits train val

# With verbose logging
python audit_dataset.py --config config/config.yaml --verbose
```

## Exit Codes

The script exits with:
- **0** = NONE/LOW risk (safe to train)
- **1** = MEDIUM/HIGH risk (review recommended)
- **2** = CRITICAL risk (do not train)

Use in CI/CD:
```bash
python audit_dataset.py --config config.yaml
if [ $? -ne 0 ]; then
  echo "Dataset failed audit!"
  exit 1
fi
echo "Dataset passed audit - proceeding with training"
```

## Common Issues & Fixes

### "No samples found"
```
ERROR: No samples found in data/deepfake
```
- Check directory structure matches expected layout
- Verify split folders exist (train/, val/, test/)
- Ensure video files have proper extensions (.mp4, .avi, etc.)

### "Hash computation slow"
- Normal! Large videos take time
- Network drives are slower than local SSD
- For pre-computed hashes, use separate SHA256 tool

### "Missing metadata warnings"
```
DEBUG: Failed to extract video metadata: ...
```
- Optional - audit continues without metadata
- Install cv2/torchaudio for more details
- Or provide JSON metadata files

### Memory issues with huge datasets
- Process splits separately:
```bash
python audit_dataset.py --data-root data --splits train
python audit_dataset.py --data-root data --splits val
python audit_dataset.py --data-root data --splits test
```

## Sample Report Output

See `audit_report.json` for a complete example with:
- Risk assessment and issue counts
- Detailed findings per type
- Timestamps and performance metrics
- Actionable recommendations

## Questions?

Check `AUDIT_README.md` for full documentation including:
- Detailed finding explanations
- Integration patterns
- Advanced usage
- Troubleshooting guide

## Running Tests

Verify the audit module works:

```bash
# Run all tests
python -m pytest tests/test_audit_dataset.py -v

# Run specific test
python -m pytest tests/test_audit_dataset.py::TestDatasetAuditor::test_identity_overlap_detection -v

# Run with coverage
python -m pytest tests/test_audit_dataset.py --cov=audit_dataset
```

All 20 tests should pass in ~42 seconds.

---

**TL;DR:** `python audit_dataset.py --config config/config.yaml` → check `audit_report.json` → proceed if risk is NONE/LOW

---

*Last updated: 2025-12-15*
