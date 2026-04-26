# Model Weights Directory

This directory stores downloaded model weights for upload to Vercel Blob Storage.

## CubiCasa5k Model

- **File**: `cubicasa5k_model.pt`
- **Expected Size**: ~40MB
- **Classes**: 44 (walls, rooms, doors, windows, furniture)
- **Source**: Official repo or Papers with Code

## Download Instructions

```bash
# Option 1: From official repo (check releases)
# TODO: Add official URL after librarian search

# Option 2: From TF2DeepFloorplan (browser-compatible)
git clone https://github.com/therenderengineer/TF2DeepFloorplan
# Convert weights from TF.js format to PyTorch

# Option 3: Train from scratch using CubiCasa5k dataset
# Dataset: https://zenodo.org/record/2615498
```

## Upload to Vercel

After downloading, run:

```bash
./scripts/upload-weights.sh model-weights/cubicasa5k_model.pt
```

## Alternative: Use Placeholder Mode

For initial testing, use `USE_PLACEHOLDER=true` (default). This returns mock recognition results without needing actual model weights.