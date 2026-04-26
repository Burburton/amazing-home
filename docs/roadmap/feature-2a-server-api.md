# Feature 2A: Server API for Floor Plan Recognition

**Feature ID**: 2A-01 to 2A-05
**Phase**: V2 AI Recognition
**Duration**: 2 weeks
**Priority**: High

---

## Goal

Deploy CubiCasa5k-based recognition API on Vercel (Free tier) for testing, migrate to Railway ($5/month) if needed.

---

## Architecture

```
amazing-home (Browser)
    ↓ POST /api/recognize (base64 image)
Vercel Serverless Function
    ↓ Load weights from Blob Storage
    ↓ CubiCasa5k inference (PyTorch)
RecognitionResult (JSON)
    ↓
Browser renders detected elements
```

---

## Vercel Deployment Strategy

### Why Vercel First

| Pros | Cons |
|------|------|
| **Free tier** - No cost for testing | **10s timeout** - May need optimization |
| **Serverless** - Auto-scaling | **Cold start** - 3-5s on first call |
| **GitHub integration** - Auto-deploy | **1GB memory** - Model must be optimized |
| **Quick deploy** - Minutes to setup | **50MB function size** - External weights needed |

### Migration Path

```
Vercel (Free, testing)
    ↓ if timeout/memory issues
Railway ($5/month, stable)
    ↓ for production
```

---

## Tasks

### 2A-01: Create API Scaffold

**Deliverable**: Python serverless function for Vercel

**Files**:
```
api/
├── recognize.py          # Vercel serverless function
├── requirements.txt      # Dependencies
├── vercel.json           # Vercel config
```

**vercel.json**:
```json
{
  "functions": {
    "api/recognize.py": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**API Contract**:
```python
# POST /api/recognize
{
  "image_base64": "data:image/png;base64,...",
  "options": {
    "detect_walls": true,
    "detect_rooms": true,
    "detect_icons": true
  }
}

# Response
{
  "walls": [{"start": {...}, "end": {...}, "thickness": 10}],
  "rooms": [{"polygon": [...], "type": "kitchen"}],
  "icons": [{"bbox": {...}, "type": "door"}],
  "confidence": 0.85,
  "processing_time_ms": 3000,
  "model_version": "cubicasa5k-v1"
}
```

---

### 2A-02: Integrate CubiCasa5k Model

**Deliverable**: Working inference pipeline

**Challenge**: CubiCasa5k weights (~40MB) exceed Vercel's 50MB function bundle limit.

**Solution**: Use Vercel Blob Storage for weights.

**Steps**:

1. **Upload weights to Vercel Blob**:
```bash
# Install Vercel CLI
npm i -g vercel

# Upload weights
vercel blob upload cubicasa5k_weights.pkl
# Returns: https://blob.vercel-storage.com/xxx-weights.pkl
```

2. **Load weights at runtime**:
```python
# api/recognize.py
import httpx
import torch
from floortrans.models import HGNet

WEIGHTS_URL = "https://blob.vercel-storage.com/cubicasa5k-weights.pkl"

async def load_model():
    # Download weights (cached by Vercel)
    response = httpx.get(WEIGHTS_URL)
    weights_path = "/tmp/cubicasa5k_weights.pkl"
    with open(weights_path, "wb") as f:
        f.write(response.content)
    
    model = HGNet.load_model(
        'hg_furukawa_original',
        num_classes=44,
        checkpoint=weights_path
    )
    return model

# Global model (cached between warm invocations)
model = None

def get_model():
    global model
    if model is None:
        model = load_model()
    return model
```

3. **Inference function**:
```python
from flask import request, jsonify
import base64
import numpy as np
from PIL import Image
import io

def handler(req):
    if req.method != 'POST':
        return jsonify({'error': 'POST only'}), 405
    
    data = request.get_json()
    image_base64 = data['image_base64'].split(',')[1]  # Remove data:image/... prefix
    
    # Decode image
    image_data = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_data)).convert('RGB')
    
    # Preprocess
    image = image.resize((512, 512))
    tensor = preprocess(image)  # Normalize, to tensor
    
    # Inference
    model = get_model()
    with torch.no_grad():
        heatmaps, rooms, icons = model(tensor)
    
    # Postprocess
    walls = extract_walls(heatmaps)
    room_polygons = extract_rooms(rooms)
    icon_boxes = extract_icons(icons)
    
    return jsonify({
        'walls': walls,
        'rooms': room_polygons,
        'icons': icon_boxes,
        'confidence': 0.85,
        'processing_time_ms': 3000
    })
```

---

### 2A-03: Vercel Project Setup

**Deliverable**: Deployed API URL

**Steps**:

1. **Initialize Vercel project**:
```bash
cd amazing-home-api  # New repo for API
vercel login          # Login with GitHub
vercel init           # Create project
```

2. **Configure project**:
```json
// vercel.json
{
  "version": 2,
  "functions": {
    "api/*.py": {
      "runtime": "python3.9",
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "env": {
    "WEIGHTS_URL": "@cubicasa5k_weights_url"
  }
}
```

3. **Deploy**:
```bash
vercel --prod
# Output: https://amazing-home-api.vercel.app
```

**Test endpoint**:
```bash
curl -X POST https://amazing-home-api.vercel.app/api/recognize \
  -H "Content-Type: application/json" \
  -d '{"image_base64": "..."}'
```

---

### 2A-04: Browser Integration

**Deliverable**: API call from amazing-home

**New file**: `src/services/recognitionApi.ts`

```typescript
// src/services/recognitionApi.ts

const API_URL = 'https://amazing-home-api.vercel.app/api/recognize';

export interface RecognitionResult {
  walls: Wall[];
  rooms: Room[];
  icons: Icon[];
  confidence: number;
  processing_time_ms: number;
}

export async function recognizeFloorPlan(
  imageBase64: string,
  options?: {
    detect_walls?: boolean;
    detect_rooms?: boolean;
    detect_icons?: boolean;
  }
): Promise<RecognitionResult> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: imageBase64,
      options: options || { detect_walls: true, detect_rooms: true, detect_icons: true }
    })
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}
```

**Update WallDetectionPanel**:
```typescript
// Add "Server API" method
const handleServerRecognize = async () => {
  setIsDetecting(true);
  
  try {
    const base64 = await imageToBase64(document.sourceImage.objectUrl);
    const result = await recognizeFloorPlan(base64);
    
    // Convert API result to walls
    const walls = result.walls.map(w => ({
      id: `server-wall-${Date.now()}-${Math.random()}`,
      start: w.start,
      end: w.end,
      thickness: w.thickness || 10,
      isLoadBearing: false
    }));
    
    setCandidateWalls(walls);
  } catch (err) {
    setError('Server API failed. Try browser method.');
  } finally {
    setIsDetecting(false);
  }
};
```

---

### 2A-05: Performance Optimization (if needed)

**Problem**: Vercel 10s timeout may be exceeded for large images.

**Solutions**:

| Issue | Solution |
|-------|----------|
| Timeout >10s | Resize image to 512x512 before sending |
| Cold start slow | Use warm function, keep model loaded |
| Memory limit | Use smaller model (UNet vs CubiCasa5k) |
| Blob download slow | Cache weights in function memory |

**Optimized flow**:
```typescript
// Resize before sending (browser side)
const resizeImage = async (imageUrl: string, maxSize = 512): Promise<string> => {
  const img = new Image();
  img.src = imageUrl;
  await img.decode();
  
  // Resize to 512x512
  const canvas = document.createElement('canvas');
  canvas.width = maxSize;
  canvas.height = maxSize;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, maxSize, maxSize);
  
  return canvas.toDataURL('image/png', 0.8);
};
```

---

## Acceptance Criteria

- [ ] Vercel project deployed (free tier)
- [ ] `/api/recognize` endpoint works
- [ ] Processing time <10 seconds
- [ ] Browser can call API successfully
- [ ] Recognition result renders on canvas
- [ ] User can apply detected walls/furniture

---

## Cost Estimate

| Phase | Platform | Cost |
|-------|----------|------|
| **Testing** | Vercel | **$0** (free tier) |
| **Production** | Railway | $5/month (if needed) |

---

## Timeline

| Day | Task | Status |
|-----|------|--------|
| 1 | 2A-01: API scaffold | ✅ **Completed** |
| 2-3 | 2A-02: Model + Blob Storage | ✅ **Completed** (placeholder mode) |
| 4 | 2A-03: Vercel deploy | ⏳ **In Progress** (requires user login) |
| 5 | 2A-04: Browser integration | ✅ **Completed** |
| 6-7 | 2A-05: Optimization | Pending |

### Implementation Summary (Day 1)

**Files Created**:
- `api/recognize.py` - Main recognition endpoint (placeholder + production modes)
- `api/health.py` - Health check with model status
- `api/model_loader.py` - Weight download and caching from Blob Storage
- `api/inference.py` - Preprocess, inference, postprocess pipeline
- `api/requirements.txt` - Python dependencies (torch, scipy, scikit-image)
- `src/services/recognitionApi.ts` - Browser API client
- `src/components/shared/AIRecognitionPanel.tsx` - UI panel
- `vercel.json` - Vercel deployment config

**Verification**:
- Tests: 86/86 passing ✅
- Typecheck: Clean ✅
- Build: Successful (1.4MB bundle) ✅
- Git: Pushed to main ✅

**Next Steps**:
1. User runs `vercel` to deploy (requires Vercel login)
2. Test placeholder API on Vercel
3. Upload CubiCasa5k weights to Blob Storage
4. Switch to production mode (`USE_PLACEHOLDER=false`)

---

## Migration to Railway (if needed)

If Vercel limits are problematic:

```bash
# Railway migration steps
1. Create Railway account ($5/month)
2. Deploy same Docker container
3. No timeout/memory limits
4. GPU available (optional, extra cost)
```

---

## Dependencies

- Vercel account (free)
- GitHub repo for auto-deploy
- CubiCasa5k weights in Blob Storage
- Python 3.9 runtime

---

**Feature Version**: 2A-v2.0 (Vercel-first)
**Author**: Sisyphus