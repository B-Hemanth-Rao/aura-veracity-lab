# Modality Ablation Study Guide

## Overview

The modality ablation study enables quantification of independent contributions from **audio** and **video** streams to deepfake detection performance. By training and evaluating models with different modality combinations, you can:

- **Isolate modality effects**: Measure exactly how much each modality contributes
- **Optimize architectures**: Focus computational resources on the strongest modality
- **Plan deployments**: Choose appropriate configurations for different scenarios
- **Understand failure modes**: Identify when one modality compensates for the other

## Quick Start

### 1. Configure Modality Ablation

Edit [config/config.yaml](config/config.yaml) under the `model` section:

```yaml
model:
  enable_audio: true    # Set to false for video-only training
  enable_video: true    # Set to false for audio-only training
  checkpoint_dir: checkpoints
  architecture: multimodal
  fusion_strategy: concat
```

### 2. Train with Different Modalities

```bash
# Full multimodal (default)
python -m src.train.multimodal_train --config config/config.yaml --data-root data/deepfake

# Video-only
sed -i 's/enable_audio: true/enable_audio: false/' config/config.yaml
python -m src.train.multimodal_train --config config/config.yaml --data-root data/deepfake

# Audio-only
sed -i 's/enable_video: true/enable_video: false/' config/config.yaml
python -m src.train.multimodal_train --config config/config.yaml --data-root data/deepfake

# Reset to multimodal
sed -i 's/enable_audio: false/enable_audio: true/' config/config.yaml
sed -i 's/enable_video: false/enable_video: true/' config/config.yaml
```

### 3. Run Ablation Study Evaluation

```bash
python -m src.eval.ablation_study \
  --config config/config.yaml \
  --checkpoint checkpoints/final.pth \
  --data-root data/deepfake \
  --output ablation_report.json \
  --output-csv ablation_report.csv
```

## Configuration Options

### Enable/Disable Modalities

```yaml
model:
  # Option 1: Both enabled (multimodal)
  enable_audio: true
  enable_video: true
  
  # Option 2: Video only
  enable_audio: false
  enable_video: true
  
  # Option 3: Audio only
  enable_audio: true
  enable_video: false
```

### Fusion Strategies

The fusion strategy applies only when **both** modalities are enabled:

```yaml
model:
  fusion_strategy: "concat"      # Concatenate video and audio features
                                 # fusion_dim = video_dim + audio_dim
  
  # Or use attention-based fusion (future)
  # fusion_strategy: "attention"
```

## Output Format

### JSON Report Structure

The ablation study generates a comprehensive JSON report with:

```json
{
  "metadata": {
    "timestamp": "2024-01-15T10:30:45",
    "model_checkpoint": "checkpoints/final.pth",
    "splits_evaluated": ["train", "val", "test"],
    "total_samples_evaluated": 3487
  },
  "configurations": {
    "multimodal": {...},
    "video-only": {...},
    "audio-only": {...}
  },
  "performance_comparison": {
    "train": { ... },
    "val": { ... },
    "test": { ... }
  },
  "modality_contribution": {
    "summary": {
      "dominant_modality": "video",
      "video_contribution_percent": 62.4,
      "audio_contribution_percent": 37.6,
      "fusion_benefit_percent": 2.3
    },
    "by_metric": { ... },
    "analysis": { ... }
  },
  "insights": { ... }
}
```

## Understanding Results

### Contribution Percentages

The **dominant modality** and contribution percentages tell you how much each stream matters:

- **Video contribution**: 62.4% means video drives ~62% of performance improvements
- **Audio contribution**: 37.6% means audio drives ~37% of performance improvements
- **Fusion benefit**: 2.3% means combining them adds only 2.3% improvement over video alone

### Interpretation Examples

**If video dominates (>70% contribution):**
```
- Visual artifacts are primary deepfake indicators
- Resource-constrained deployments should prioritize video
- Audio can be considered optional enhancement
```

**If contributions are balanced (40-60% each):**
```
- Both modalities equally important
- Full multimodal model recommended
- Modalities provide complementary information
```

**If fusion benefit is high (>5%):**
```
- Modalities are complementary, not redundant
- Multimodal approach is essential
- Strong synergy between audio and video
```

### Per-Split Comparison

The report includes separate analysis for train/val/test splits:

```json
"per_split_analysis": {
  "train": {
    "best_configuration": "multimodal",
    "auc_difference_max_min": 0.0424,
    "average_performance": { ... }
  }
}
```

**Key insights:**
- Consistent ranking across splits → stable differences
- Different best configs per split → possible overfitting
- Large differences → strong modality effects

## Advanced Usage

### Evaluate with Custom Checkpoint

```bash
python -m src.eval.ablation_study \
  --config config/config.yaml \
  --checkpoint my_model_epoch_25.pth \
  --data-root data/deepfake
```

### Batch Size and Worker Configuration

```bash
python -m src.eval.ablation_study \
  --config config/config.yaml \
  --checkpoint checkpoints/final.pth \
  --batch-size 32 \
  --num-workers 4 \
  --data-root data/deepfake
```

### CSV Output for Analysis

```bash
python -m src.eval.ablation_study \
  --config config/config.yaml \
  --checkpoint checkpoints/final.pth \
  --data-root data/deepfake \
  --output ablation_report.json \
  --output-csv ablation_report.csv
```

The CSV format:
```csv
split,configuration,auc,f1_score,accuracy,precision,recall,loss
train,multimodal,0.9847,0.9562,0.9515,0.9614,0.9510,0.1243
train,video-only,0.9612,0.9261,0.9195,0.9332,0.9191,0.1876
train,audio-only,0.9423,0.8946,0.8862,0.9014,0.8879,0.2541
```

### Verbose Output

```bash
python -m src.eval.ablation_study \
  --config config/config.yaml \
  --checkpoint checkpoints/final.pth \
  --data-root data/deepfake \
  --verbose
```

## API Usage

### Using AblationStudy Programmatically

```python
from src.eval.ablation_study import AblationStudy
from src.config import Config

# Load configuration
config = Config("config/config.yaml")

# Create ablation study
ablation = AblationStudy(
    config=config,
    checkpoint="checkpoints/final.pth",
    data_root="data/deepfake",
    output="ablation_report.json",
    batch_size=16,
    num_workers=2,
    device='cuda',
)

# Run evaluation
report = ablation.run()

# Access results programmatically
print(f"Video contribution: {report['modality_contribution']['summary']['video_contribution_percent']}%")
print(f"Best config: {report['per_split_analysis']['test']['best_configuration']}")
```

### Directly Evaluate Single Configuration

```python
from src.models.multimodal_model import MultimodalModel
from src.config import Config

config = Config("config/config.yaml")

# Create video-only model
model = MultimodalModel(
    config=config,
    num_classes=2,
    enable_video=True,
    enable_audio=False,  # Disable audio
)

# Load checkpoint
checkpoint = torch.load("checkpoints/final.pth")
model.load_state_dict(checkpoint, strict=False)

# Use for inference with only video
logits = model(video=video_tensor, audio=None)
```

## Deployment Recommendations

Based on ablation results, choose the appropriate configuration:

### High Accuracy (No Constraints)
- **Configuration**: Multimodal (both audio and video)
- **Typical AUC**: 96-98%
- **Use case**: Server-side detection, forensic analysis
- **Advantages**: Highest accuracy, best generalization
- **Disadvantages**: Maximum latency and compute

### Mobile/Resource-Constrained
- **Configuration**: Video-only
- **Typical AUC**: 94-96%
- **Use case**: Mobile apps, edge devices
- **Advantages**: 40-50% parameter reduction, lower latency
- **Disadvantages**: 2-3% accuracy loss

### Audio-Focused Content
- **Configuration**: Audio-only
- **Typical AUC**: 90-94%
- **Use case**: Podcast analysis, voice-only content
- **Advantages**: Specialized for speech deepfakes
- **Disadvantages**: Can miss visual artifacts

### Fallback/Robustness
- **Configuration**: Ensemble (weighted combination)
- **Example**: 60% video-only + 40% audio-only predictions
- **Use case**: Handle scenarios where one modality unavailable
- **Advantages**: Graceful degradation

## Troubleshooting

### Issue: "at least one modality must be enabled"

**Cause**: Both `enable_audio` and `enable_video` are set to `false`

**Solution**:
```yaml
model:
  enable_audio: true   # Enable at least one
  enable_video: true
```

### Issue: CUDA out of memory

**Solution**: Reduce batch size in ablation_study.py:
```bash
python -m src.eval.ablation_study \
  --batch-size 8 \
  --data-root data/deepfake
```

### Issue: Checkpoint incompatibility with ablation

**Cause**: Checkpoint trained with different modality config

**Solution**: Use `strict=False` (default in ablation_study.py):
```python
# Automatically loads compatible weights
ablation.run()
```

## Sample Results

See [sample_ablation_results.json](sample_ablation_results.json) for a complete example report showing:

- Realistic performance metrics across three configurations
- Modality contribution analysis
- Per-split performance comparison
- Deployment recommendations

Key findings from sample:
```
- Video dominates: 62.4% of performance
- Audio provides: 37.6% of performance  
- Multimodal fusion benefit: +2.3% over video-only
- Recommendation: Video-only for edge deployment (~94% AUC)
               Multimodal for server-side (~96% AUC)
```

## Testing

Run unit tests for modality ablation functionality:

```bash
# All tests
pytest tests/test_modality_ablation.py -v

# Specific test class
pytest tests/test_modality_ablation.py::TestMultimodalModelInstantiation -v

# With coverage
pytest tests/test_modality_ablation.py --cov=src.models --cov=src.eval
```

Test coverage includes:
- ✅ Configuration loading with modality flags
- ✅ Model instantiation (multimodal, video-only, audio-only)
- ✅ Forward pass with different modality inputs
- ✅ Feature extraction per modality
- ✅ Fusion dimension computation
- ✅ Trainer integration with modality config
- ✅ End-to-end ablation workflows

## References

### Related Files
- Configuration: [config/config.yaml](config/config.yaml)
- Model: [src/models/multimodal_model.py](src/models/multimodal_model.py)
- Training: [src/train/multimodal_train.py](src/train/multimodal_train.py)
- Evaluation: [src/eval/ablation_study.py](src/eval/ablation_study.py)
- Tests: [tests/test_modality_ablation.py](tests/test_modality_ablation.py)

### Architecture Details
- Video encoder: EfficientNet-B2 backbone
- Audio encoder: 1D CNN (64→128→256 channels)
- Fusion strategies: Concatenation (default), Attention (available)
- Metrics: AUC, F1, Accuracy, Precision, Recall, FPR@95%TPR
