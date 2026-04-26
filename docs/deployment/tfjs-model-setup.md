# TensorFlow.js Model Setup

The AI Recognition feature uses TensorFlow.js for browser-based floor plan inference.

## Current Status

**No publicly hosted TensorFlow.js floor plan model exists.**

The application uses a **fallback mode** (pixel brightness detection) that works without a model.

## Fallback Mode

When no model is loaded, the recognizer uses pixel brightness detection:
- Detects dark pixels as potential walls
- Generates mock room polygon
- Generates mock door icon
- Confidence: ~55%

This is sufficient for basic testing but not accurate recognition.

## Getting a Real Model

### Option 1: Convert TF2DeepFloorplan

The [zcemycl/TF2DeepFloorplan](https://github.com/zcemycl/TF2DeepFloorplan) project provides pretrained models.

**Download SavedModel (107MB):**
```bash
pip install gdown
gdown https://drive.google.com/uc?id=1tuqUPbiZnuubPFHMQqCo1_kFNKq4hU8i
unzip model.zip
```

**Convert to TensorFlow.js:**
```bash
pip install tensorflowjs

tensorflowjs_converter \
  --input_format=tf_saved_model \
  --output_format=tfjs_graph_model \
  --saved_model_tags=serve \
  model/store \
  web_model
```

**Output files:**
```
web_model/
├── model.json
├── group1-shard1of1.bin (or multiple shards)
```

### Option 2: Use TFLite Model (Smaller)

The TFLite model (37MB) is smaller and may be easier to convert:

```bash
gdown https://drive.google.com/uc?id=1B-Fw-zgufEqiLm00ec2WCMUo5E6RY2eO
```

Note: TFLite to TF.js conversion requires additional steps.

### Option 3: Train Your Own Model

Train on CubiCasa5k dataset:
- Dataset: https://zenodo.org/record/2615498
- 5000 floor plans with annotations
- 44 classes (walls, rooms, doors, furniture)

## Hosting the Model

After conversion, host the `web_model/` folder:

| Platform | Method |
|----------|--------|
| **Vercel Blob Storage** | `vercel blob put web_model/model.json` |
| **GitHub Release** | Upload as release asset |
| **Cloudflare R2** | Free 10GB storage |
| **Self-hosted** | Any static file server |

## Configuration

Update `src/domain/floorplan/tfjs-recognizer.ts`:

```typescript
const MODEL_URL = 'https://your-host.com/web_model/model.json'
```

## Model Size Reference

| Format | Size | Browser Load Time |
|--------|------|-------------------|
| SavedModel (.pb) | 107MB | N/A (server only) |
| TFLite | 37MB | N/A (mobile only) |
| TF.js GraphModel | ~40-50MB | 5-15s (depends on network) |
| TF.js LayersModel | ~40-50MB | Similar |

## Performance Optimization

For faster loading:
1. **Lazy load**: Only load when user clicks "Recognize"
2. **Cache in IndexedDB**: Use `tf.loadGraphModel(url, { cache: true })`
3. **Code splitting**: Dynamic import TensorFlow.js
4. **Compression**: Enable gzip on hosting platform