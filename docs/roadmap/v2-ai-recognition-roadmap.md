# Floor Plan Deep Learning Recognition Roadmap

**Product**: amazing-home
**Phase**: V2 - AI Recognition
**Date**: 2026-04-26
**Status**: Planning

---

## Executive Summary

**Current State**: V1 MVP complete with basic wall detection (dark pixel + skeleton method)

**Goal**: Add deep learning recognition for:
- Walls, Doors, Windows (structural elements)
- Rooms (kitchen, bedroom, bathroom, living room)
- Furniture icons (bed, sofa, table, toilet, sink)
- Full floor plan parsing

**Key Finding**: Browser-only deep learning is impractical for production-quality recognition. Models require 100-400MB and CUDA operations. Recommended: Server API + optional browser preview.

---

## 1. Technology Options Analysis

### 1.1 Model Selection

| Model | Classes | Size | Precision | Deployment | Recommendation |
|-------|---------|------|-----------|------------|----------------|
| **CubiCasa5k** | 44 (rooms, icons, junctions) | ~40MB weights | mIoU 57.5% | Server (PyTorch) | ✅ **Best for full parsing** |
| **MitUNet** | 1 (walls only) | 257MB | mIoU 87.84% | Server (PyTorch) | ✅ **Best for walls** |
| **TF2DeepFloorplan** | 9 (rooms + boundaries) | 37MB (TFLite) | mIoU ~70% | Browser (TF.js) | ✅ **Best for browser** |
| **RoomFormer** | Polygons (rooms) | ~50MB | Highest | Server (CUDA) | Polygon reconstruction |

**Recommendation Matrix**:

| Use Case | Primary Model | Backup |
|----------|---------------|--------|
| Walls only | MitUNet (server) | Current skeleton method |
| Full floor plan | CubiCasa5k (server) | TF2DeepFloorplan (browser fallback) |
| Browser preview | TF2DeepFloorplan | None (offline fallback) |
| Polygon output | RoomFormer | CubiCasa5k |

### 1.2 Deployment Architecture Options

**Option A: Server API (Recommended for production)**

```
Browser (amazing-home)
    ↓ HTTP POST /api/recognize
API Server (Docker container)
    ↓ PyTorch inference
Recognition Result (JSON)
    ↓
Browser renders result
```

Pros:
- High accuracy (CubiCasa5k/MitUNet)
- No browser memory limits
- GPU acceleration
- Batch processing possible

Cons:
- Requires hosting (Vercel, Railway, AWS)
- API latency (~2-5s per image)
- Privacy concerns (image upload)

**Option B: TensorFlow.js Browser (Preview mode)**

```
Browser loads model (37MB)
    ↓ Local inference
Recognition Result
    ↓
No server needed
```

Pros:
- Zero latency
- Privacy-preserving
- Offline capable
- No hosting cost

Cons:
- Lower accuracy (TF2DeepFloorplan vs CubiCasa5k)
- Memory constraints (mobile devices)
- Limited to rooms + boundaries (no furniture icons)

**Option C: Hybrid (Recommended)**

```
Browser → try TF.js first (37MB)
    ↓ if fails or user requests higher accuracy
Server API → CubiCasa5k fallback
    ↓
Best of both worlds
```

---

## 2. CubiCasa5k Classes Coverage

| Category | Classes | amazing-home Support |
|----------|---------|---------------------|
| **Rooms** | Kitchen, Living Room, Bedroom, Bath, Hallway, Storage, Garage | ✅ Display labels |
| **Icons** | Window, Door, Closet, Toilet, Sink, Bathtub, Fireplace | ✅ Place as furniture |
| **Junctions** | 21 wall endpoint types | ❌ Internal use only |
| **Wall** | Wall class (from junctions) | ✅ Already supported |

**Gap Analysis**:
- CubiCasa5k has **Window** and **Door** - amazing-home doesn't support openings
- CubiCasa5k has **Closet, Toilet, Sink, Bathtub** - not in current furniture catalog
- Need to expand furniture catalog to match dataset

---

## 3. Implementation Roadmap

### Phase 2A: Server API (Week 1-2)

**Goal**: Deploy CubiCasa5k recognition as server API

**Tasks**:

| ID | Task | Duration | Deliverable |
|----|------|----------|-------------|
| 2A-01 | Create API server scaffold | 1 day | FastAPI/Flask app |
| 2A-02 | Integrate CubiCasa5k model | 2 days | `/api/recognize` endpoint |
| 2A-03 | Docker container setup | 1 day | Dockerfile + compose |
| 2A-04 | Deploy to Railway/Vercel | 1 day | Live API URL |
| 2A-05 | Browser integration | 2 days | API call + result parsing |

**API Contract**:

```typescript
// POST /api/recognize
interface RecognitionRequest {
  image: string; // base64 or multipart
  options?: {
    detectWalls: boolean;
    detectRooms: boolean;
    detectIcons: boolean;
  };
}

interface RecognitionResponse {
  walls: Wall[];
  rooms: Room[];
  icons: Icon[];
  confidence: number;
  processingTime: number;
}
```

### Phase 2B: Browser Preview (Week 3)

**Goal**: Add TensorFlow.js fallback for offline/preview

**Tasks**:

| ID | Task | Duration | Deliverable |
|----|------|----------|-------------|
| 2B-01 | Convert TF2DeepFloorplan to TF.js | 1 day | `model.json` + shards |
| 2B-02 | Lazy load model (on demand) | 1 day | 37MB loaded when needed |
| 2B-03 | Implement inference pipeline | 2 days | `recognizeInBrowser()` |
| 2B-04 | Hybrid fallback logic | 1 day | Browser → API fallback |

### Phase 2C: Furniture Catalog Expansion (Week 4)

**Goal**: Support all CubiCasa5k furniture icons

**New Furniture Types**:

| Current | Add | Icon |
|---------|-----|------|
| sofa, bed, dining_table, chair, desk, cabinet, coffee_table | **window** | 🪟 |
| | **door** | 🚪 |
| | **closet** | 🗄️ |
| | **toilet** | 🚽 |
| | **sink** | 🚰 |
| | **bathtub** | 🛁 |
| | **fireplace** | 🔥 |

### Phase 2D: Room Labels (Week 5)

**Goal**: Display room type labels on 2D canvas

**Tasks**:

| ID | Task | Duration | Deliverable |
|----|------|----------|-------------|
| 2D-01 | Room polygon data model | 1 day | `Room` type with label |
| 2D-02 | Room label rendering | 1 day | Konva text labels |
| 2D-03 | Room selection UI | 1 day | Click room to inspect |
| 2D-04 | Room color coding | 1 day | Kitchen=yellow, Bath=blue |

### Phase 2E: 3D Integration (Week 6)

**Goal**: Use recognition result for 3D preview

**Tasks**:

| ID | Task | Duration | Deliverable |
|----|------|----------|-------------|
| 2E-01 | Room height from type | 1 day | Bath lower ceiling |
| 2E-02 | Furniture from icons | 2 days | Auto-place detected furniture |
| 2E-03 | Door/window 3D meshes | 2 days | Opening geometry |

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    amazing-home (Browser)                │
├─────────────────────────────────────────────────────────┤
│  UI Layer                                                │
│  ├── UploadPanel → send image                            │
│  ├── RecognitionPanel → choose method                    │
│  ├── WallDetectionPanel → current skeleton method        │
│  ├── RoomLabelPanel → display room types                 │
│  ├── FurniturePanel → detected furniture                 │
├─────────────────────────────────────────────────────────┤
│  Recognition Layer                                       │
│  ├── Method 1: TensorFlow.js (37MB, browser)             │
│  │   └─→ TF2DeepFloorplan (rooms + boundaries)           │
│  ├── Method 2: Server API (fallback)                     │
│  │   └─→ POST /api/recognize → CubiCasa5k                │
│  ├── Method 3: Current skeleton (walls only)             │
│  │   └─→ Dark pixel + morphological opening              │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                              │
│  ├── FloorPlanDocument                                   │
│  │   ├── walls[]                                         │
│  │   ├── rooms[] ← NEW                                   │
│  │   ├── furniture[]                                     │
│  │   ├── openings[] ← NEW (doors, windows)               │
│  ├── RecognitionResult                                   │
│  │   ├── confidence per detection                        │
│  │   ├── sourceMethod (browser/api/skeleton)             │
└─────────────────────────────────────────────────────────┘

                          ↓ HTTP (optional)

┌─────────────────────────────────────────────────────────┐
│                   API Server (Docker)                     │
├─────────────────────────────────────────────────────────┤
│  FastAPI/Flask                                           │
│  ├── /api/recognize                                      │
│  │   └─→ CubiCasa5k inference                            │
│  ├── /api/recognize/walls                                │
│  │   └─→ MitUNet inference                               │
│  ├── /api/health                                         │
├─────────────────────────────────────────────────────────┤
│  Models                                                  │
│  ├── cubicasa5k_weights.pkl (~40MB)                      │
│  ├── mitunet_weights.pth (~257MB)                        │
│  ├── LMDB database (optional)                            │
├─────────────────────────────────────────────────────────┤
│  Infrastructure                                          │
│  ├── Docker container                                   │
│  ├── GPU support (optional)                              │
│  ├── Railway/Vercel deployment                          │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Cost Analysis

### Server API Hosting

| Platform | Cost | GPU | Notes |
|----------|------|-----|-------|
| **Railway** | $5/month | No | CPU inference (~5s) |
| **Vercel** | Free tier | No | Serverless, ~3s cold start |
| **AWS Lambda** | $0.20/invocation | No | Pay per request |
| **Google Cloud Run** | $0.01/second | Optional | GPU adds cost |
| **Self-hosted VPS** | $10-20/month | Optional | Full control |

**Recommended**: Vercel (free) for testing → Railway ($5/month) for production

### TensorFlow.js Bundle Impact

| Component | Size | Impact |
|-----------|------|--------|
| TensorFlow.js core | ~1.5MB | Add to bundle |
| TF2DeepFloorplan model | 37MB | Lazy load |
| Current bundle | ~1.4MB | +TF.js = ~3MB total |

**Recommendation**: Lazy load TF.js + model only when user clicks "Detect (Browser)" button.

---

## 6. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API latency too high | Browser TF.js as fallback |
| Model accuracy low | Let user choose detection method |
| Hosting cost escalates | Usage limits, browser-first approach |
| Privacy concerns | Browser TF.js for offline mode |
| Mobile memory limits | Warn users, offer API fallback |

---

## 7. Success Metrics

| Metric | V1 Baseline | V2 Target |
|--------|-------------|-----------|
| Wall detection accuracy | ~60% (skeleton) | 85% (MitUNet/CubiCasa) |
| Furniture detection | Manual placement | Auto-detect 7 types |
| Room type recognition | None | 12 room types |
| Processing time | ~1s (browser) | ~3s (browser), ~5s (API) |
| User satisfaction | TBD | Higher accuracy → more adoption |

---

## 8. Timeline

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | 2A | API server deployed |
| 2 | 2A | Browser integration complete |
| 3 | 2B | TensorFlow.js fallback ready |
| 4 | 2C | Furniture catalog expanded |
| 5 | 2D | Room labels functional |
| 6 | 2E | 3D preview integration |

**Total**: 6 weeks for full V2 recognition

---

## 9. Decision Points

**Decision 1: Hosting Platform (Updated)**

| Option | Cost | Effort | Recommendation |
|--------|------|--------|----------------|
| Vercel | **Free** | Low | ✅ **Start here** |
| Railway | $5/month | Low | Production upgrade |
| AWS | Pay-per-use | Medium | Scale later |
| Self-hosted | $10-20/month | High | Advanced users |

**Migration path**: Vercel (free testing) → Railway (stable production)

**Decision 2: Browser vs API First**

| Option | Accuracy | UX | Recommendation |
|--------|----------|-----|----------------|
| Browser-first | Lower (70%) | Faster | ✅ Default |
| API-first | Higher (85%) | Slower | Premium option |
| Hybrid | Variable | Flexible | ✅ **Best** |

**Decision 3: Model for API**

| Option | Classes | Size | Recommendation |
|--------|---------|------|----------------|
| CubiCasa5k | 44 (full) | ~40MB | ✅ **Primary** |
| MitUNet | 1 (walls) | ~257MB | Walls-only option |
| Both | All | ~300MB | Advanced deployment |

---

## 10. Next Action

**Immediate**: Create feature spec for 2A-01 (API server scaffold)

**Questions for user**:
1. Prefer Railway ($5/month) or Vercel (free)?
2. Browser-first or API-first approach?
3. Need all 44 CubiCasa5k classes or subset?

---

**Document Version**: 1.0
**Research Sources**: CubiCasa5k GitHub, MitUNet paper, TensorFlow.js docs, ONNX Runtime docs
**Author**: Sisyphus (async-dev session)