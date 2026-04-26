# Wall Detection Improvement Plan

**Date**: April 26, 2026  
**Status**: Planning  
**Mode**: async-dev canonical loop

---

## Problem Statement

Current wall detection implementation has significant limitations:

| Issue | Current State | Expected State |
|-------|---------------|----------------|
| Edge detection | None (pixel brightness threshold only) | Canny edge detection |
| Line detection | Row/column scan | Hough Transform (HoughLinesP) |
| Line orientation | Only horizontal/vertical | Any angle |
| Noise handling | None | Morphological operations (opening/closing) |
| Threshold | Hardcoded (100) | Adaptive/Otsu thresholding |
| Thickness detection | Fixed (10px) | Variable based on wall width |

**Result**: Fails on most real floor plan images with noise, text, furniture symbols.

---

## Research Summary (Industry Best Practices)

### 1. Preprocessing Pipeline

| Step | Method | Purpose |
|------|--------|---------|
| Grayscale | Standard formula (0.299R + 0.587G + 0.114B) | Convert to single channel |
| Gaussian blur | σ=1-2 | Reduce noise before edge detection |
| Morphological opening | 3×3 kernel | Remove small noise spots |
| Morphological closing | 3×3 kernel | Fill small holes in walls |
| Binarization | Adaptive threshold or Otsu | Handle varying lighting |

### 2. Edge Detection

**Canny Edge Detection** (industry standard):
- σ parameter: 0.1-1.0 (controls smoothing)
- Two thresholds: low (50-100), high (100-200)
- Outputs binary edge map

**Why Canny**:
- Better than Sobel for line detection
- Suppresses noise
- Detects strong and weak edges
- Used before Hough in all floor plan papers

### 3. Line Detection - Hough Transform

**Standard vs Probabilistic Hough**:

| Method | Returns | Use Case |
|--------|---------|----------|
| HoughLines | (ρ, θ) parameters | Dominant directions |
| **HoughLinesP** | (x₀, y₀, x₁, y₁) endpoints | **Wall segments (preferred)** |

**HoughLinesP Parameters** (from research):

| Parameter | Typical Range | Notes |
|-----------|---------------|-------|
| rho | 1 | Distance resolution (pixels) |
| theta | π/180 | Angle resolution (radians) |
| threshold | 50-150 | Min votes for line |
| minLineLength | 40-120px | Min wall length |
| maxLineGap | 5-15px | Max gap to connect |

**Scale consideration**: Higher threshold needed for larger images (4K needs more votes).

### 4. Floor Plan Specific Techniques

From research papers:

| Paper | Technique |
|-------|-----------|
| Mace et al. | Distance + texture between parallel lines |
| Ahmed et al. | Line thickness levels (thick, medium, thin) |
| Riedinger et al. | Binarization + thickness-based wall classification |
| Grimenez et al. | Pattern processing + morphological operations |
| Modern approaches | Semantic segmentation (FPN) + Hough |

**Key insight**: Walls typically have:
- Consistent thickness (thicker than furniture symbols)
- Dark color (black/dark gray)
- Horizontal or vertical orientation (most floor plans)
- Connect to form closed loops (rooms)

### 5. Morphological Direction Extraction

**Critical technique from arxiv paper**:

```
1. Detect main wall angles via Hough histogram
2. For each angle (0°, 90°, 180°, 270°):
   - Rotate mask to align walls
   - Apply morphological opening with:
     - Horizontal kernel (extract horizontal walls)
     - Vertical kernel (extract vertical walls)
3. Contour extraction for individual segments
4. Validate: remove tilted walls (bounding box check)
```

This handles slightly inclined walls that pure row/scan misses.

---

## Proposed Architecture

### Phase 1: Basic Canny + Hough (Day 1)

```
Input Image
    ↓
Grayscale conversion
    ↓
Gaussian blur (σ=1)
    ↓
Canny edge detection (50, 150)
    ↓
HoughLinesP (rho=1, theta=π/180, threshold=100, minLineLength=50, maxLineGap=10)
    ↓
Line filtering (length, angle)
    ↓
Output: Wall candidates
```

### Phase 2: Morphological Enhancement (Day 2)

```
Input Image
    ↓
Grayscale
    ↓
Adaptive threshold (Otsu)
    ↓
Morphological opening (3×3) → remove noise
    ↓
Morphological closing (3×3) → fill holes
    ↓
Edge detection on cleaned image
    ↓
HoughLinesP
    ↓
Direction-based morphological extraction
    ↓
Contour extraction
    ↓
Wall segments
```

### Phase 3: Smart Filtering (Day 3)

```
Wall candidates
    ↓
Thickness estimation (wall width detection)
    ↓
Remove thin lines (furniture symbols, text)
    ↓
Connect nearby endpoints (gap filling)
    ↓
Merge parallel lines (same wall detected twice)
    ↓
Angle validation (remove diagonal artifacts)
    ↓
Output: Cleaned walls
```

---

## Implementation Plan

### Day 1: Canny + HoughLinesP

**Goal**: Replace row/scan with industry-standard edge detection.

**Files to modify**:
- `src/domain/floorplan/wall-detection.ts`

**New functions**:
- `applyGaussianBlur()`
- `applyCannyEdgeDetection()`
- `applyHoughLinesP()`
- `filterLinesByLength()`
- `filterLinesByAngle()`

**Acceptance**:
- Detects walls at any angle (not just H/V)
- Works on noisy images
- Parameters adjustable via UI

### Day 2: Morphological Operations

**Goal**: Preprocess to remove noise and fill gaps.

**New functions**:
- `applyAdaptiveThreshold()`
- `applyMorphologicalOpening()`
- `applyMorphologicalClosing()`
- `extractDirectionalComponents()`

**Acceptance**:
- Handles text/furniture symbols in floor plans
- Fills small gaps in wall lines
- Separates horizontal/vertical walls

### Day 3: Smart Filtering

**Goal**: Post-process to clean wall candidates.

**New functions**:
- `estimateWallThickness()`
- `removeThinLines()`
- `connectNearbyEndpoints()`
- `mergeParallelLines()`
- `validateWallAngles()`

**Acceptance**:
- Removes non-wall lines
- Connects wall segments
- Returns clean wall list

---

## Testing Strategy

### Test Images

Need sample floor plans to validate:

| Type | Source | Purpose |
|------|--------|---------|
| Clean floor plan | SVG demo | Baseline validation |
| Real floor plan with text | User upload | Noise handling |
| Hand-drawn floor plan | Sketch | Line quality tolerance |
| Modern CAD floor plan | Export | Precision validation |

### Metrics

| Metric | Target |
|--------|--------|
| Wall detection rate | >80% of visible walls |
| False positive rate | <20% non-wall lines |
| Gap tolerance | Connect walls within 10px |
| Angle tolerance | Detect walls ±5° from H/V |

---

## Timeline (Canonical Loop)

| Day | Phase | Deliverable |
|-----|-------|-------------|
| Day 1 | Phase 1 | Canny + HoughLinesP implementation |
| Day 2 | Phase 2 | Morphological operations |
| Day 3 | Phase 3 | Smart filtering |
| Day 4 | Review | Test suite + parameter tuning |
| Day 5 | Polish | UI adjustments + documentation |

---

## Open Questions

1. **JavaScript canvas API limitations**: 
   - No built-in Canny/Hough
   - Need custom implementation or library
   - OpenCV.js available but ~8MB bundle

2. **Bundle size tradeoff**:
   - OpenCV.js: ~8MB (heavy)
   - Custom implementation: Lighter but limited
   - Recommendation: Start with custom, evaluate OpenCV.js later

3. **Parameter tuning**:
   - Need UI controls for threshold, minLineLength, maxLineGap
   - Auto-tuning via Otsu for threshold
   - User-adjustable for other params

4. **Real floor plan testing**:
   - Need actual floor plan images with walls
   - Current demo SVG is artificial
   - Should test with user-provided images

---

## Decision Needed

**Should I proceed with:**
1. **Custom implementation** (no OpenCV.js, lighter bundle)
2. **OpenCV.js integration** (8MB, full toolkit)
3. **Hybrid** (custom Canny, evaluate OpenCV.js later)

**Recommendation**: Start with Option 1 (custom). If it works, lighter bundle. If not, consider Option 2.

---

## Next Action

Start Day 1: Implement Canny edge detection + HoughLinesP in wall-detection.ts.

**Entry point**: Modify `detectWallsFromImage()` to use new pipeline.

---

**Document Version**: 1.0  
**Author**: Sisyphus (async-dev session)