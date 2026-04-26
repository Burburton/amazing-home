# Amazing Home — Technical Architecture Writeup

**Purpose**: Interview-ready architecture documentation  
**Audience**: Technical interviewers, portfolio reviewers  
**Last Updated**: April 2026

---

## 1. System Overview

**Amazing Home** is a browser-based home layout visualization tool. Users upload floor plan images, trace walls, place furniture, and view 3D previews. The entire application runs as a static GitHub Pages deployment with no backend.

### Key Constraints

- **No backend**: Static deployment only (GitHub Pages)
- **Browser-only**: No server-side processing
- **Local persistence**: localStorage + JSON export
- **Real-time sync**: 2D and 3D views synchronized

---

## 2. Frontend Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Build | Vite | Fast dev server, ESM-first, optimized production builds |
| Framework | React 18 | Component-based UI, hooks, concurrent rendering |
| Language | TypeScript | Type safety, IDE support, catch errors early |
| Styling | Tailwind CSS | Utility-first, rapid prototyping, consistent design |
| State | Zustand | Minimal boilerplate, document-centric state, shallow equality |
| 2D Canvas | Konva.js + react-konva | Canvas-based, event handling, performant for large floor plans |
| 3D Preview | Three.js + react-three-fiber | WebGL rendering, declarative 3D, orbit controls |
| Testing | Vitest + happy-dom | Fast unit tests, jsdom alternative |

### Why This Stack?

**Zustand over Redux**: 
- Single document state, no complex slices
- No actions/reducers boilerplate
- Built-in shallow equality for selective updates
- History (undo/redo) easily implemented with past/future arrays

**Konva.js over SVG**:
- Canvas-based: Better performance for 100+ objects
- Built-in click/drag/zoom support
- React integration via react-konva

**Three.js over alternatives**:
- Industry standard WebGL library
- react-three-fiber: Declarative 3D rendering
- OrbitControls: Built-in camera manipulation

---

## 3. Data Model

### Single Document Architecture

The entire application state is a single `FloorPlanDocument`:

```typescript
interface FloorPlanDocument {
  version: string
  project: ProjectMeta
  sourceImage?: SourceImage
  walls: Wall[]
  rooms: Room[]
  doors: Door[]
  windows: Window[]
  furniture: FurnitureItem[]
  settings: ProjectSettings
}

interface Wall {
  id: string
  start: Point2D
  end: Point2D
  thickness: number
  isLoadBearing: boolean
}

interface FurnitureItem {
  id: string
  category: FurnitureCategory
  name: string
  position: Point2D
  rotation: number
  width: number
  height: number
  elevation: number
  customName?: string
  productImageUrl?: string
  productUrl?: string
  notes?: string
}
```

### Why Single Document?

- **Simplifies synchronization**: Both 2D and 3D views render from same document
- **Serialization**: JSON export/import is trivial
- **Undo/redo**: Clone document on each action, push to history stack
- **Version management**: Each version is a cloned document snapshot

---

## 4. State Flow

### User Action → Document Update → View Sync

```
User clicks "Add Sofa"
    ↓
Zustand action: addFurniture(category, position)
    ↓
Document updated: furniture.push(newItem)
    ↓
History snapshot: past.push(cloneDocument(document))
    ↓
Components re-render:
  - 2D Konva canvas: New Rect appears
  - 3D Three.js scene: New Box appears
  - Sidebar: Furniture list updated
  - Inspector: Shows new item count
```

### Zustand Store Structure

```typescript
interface FloorPlanState {
  // Core document
  document: FloorPlanDocument
  
  // UI state
  workspace: WorkspaceState      // pan/zoom
  selectedWallId: string | null
  selectedFurnitureId: string | null
  editorMode: EditorMode
  viewMode: ViewMode
  
  // History
  history: {
    past: FloorPlanDocument[]
    future: FloorPlanDocument[]
  }
  
  // Versions
  versions: LayoutVersion[]
  activeVersionId: string | null
  
  // Custom assets
  customFurnitureAssets: CustomFurnitureAsset[]
  
  // Actions
  addWall: (start, end) => void
  updateWall: (id, updates) => void
  addFurniture: (category, position) => void
  undo: () => void
  redo: () => void
  saveVersion: (name, sourceType) => void
}
```

---

## 5. 2D Editor Architecture

### Component: Editor2D.tsx

- **Stage/Layer**: Konva canvas hierarchy
- **Image layer**: Floor plan image rendering
- **Wall layer**: Line shapes with click handlers
- **Furniture layer**: Rect shapes with drag handlers
- **Handle layer**: Circles for wall endpoint editing

### Event Handling

| Event | Handler | Action |
|-------|---------|--------|
| Canvas click (Draw Wall mode) | Set drawingStart or addWall | Wall creation |
| Canvas click (Place Furniture mode) | addFurnitureAtPosition | Furniture placement |
| Wall click | selectWall | Highlight wall |
| Furniture drag | updateFurniture position | Move furniture |
| Handle drag | updateWall endpoint | Adjust wall shape |
| Wheel | Zoom canvas | Adjust workspace.scale |
| Stage drag | Pan canvas | Adjust workspace.positionX/Y |

### Coordinate Transformation

Canvas coordinates → Document coordinates:

```typescript
const getCanvasPoint = (): Point2D | null => {
  const pointer = stage.getPointerPosition()
  return {
    x: (pointer.x - workspace.positionX) / workspace.scale,
    y: (pointer.y - workspace.positionY) / workspace.scale,
  }
}
```

---

## 6. 3D Preview Architecture

### Component: Preview3D.tsx

- **Canvas**: react-three-fiber WebGL canvas
- **PerspectiveCamera**: 3D view camera
- **OrbitControls**: Mouse rotation/pan/zoom
- **Lights**: Ambient + directional for basic lighting
- **Floor**: Plane mesh for ground
- **Walls**: Box meshes from wallToMeshData()
- **Furniture**: Box meshes with category colors

### Geometry Conversion

```typescript
function wallToMeshData(wall: Wall, ceilingHeight: number) {
  const length = distanceBetween(wall.start, wall.end)
  const centerX = (wall.start.x + wall.end.x) / 2
  const centerY = (wall.start.y + wall.end.y) / 2
  const angle = Math.atan2(
    wall.end.y - wall.start.y,
    wall.end.x - wall.start.x
  )
  
  return {
    args: [length, ceilingHeight, wall.thickness],
    position: [centerX, ceilingHeight/2, centerY],
    rotation: [0, -angle, 0],
  }
}
```

### Camera Positioning

Auto-position camera based on bounding box:

```typescript
const boundingBox = computeBoundingBox(walls)
const cameraPos = [
  boundingBox.centerX + 300,
  400,
  boundingBox.centerY + 300
]
const target = [boundingBox.centerX, 0, boundingBox.centerY]
```

---

## 7. Local Persistence

### Two-Tier Persistence

| Tier | Storage | Data |
|------|---------|------|
| Auto-save | localStorage | Current document |
| Manual export | JSON file | Full document with metadata |

### localStorage Keys

```typescript
'amazing-home-document'      // Current floor plan
'amazing-home-custom-assets' // Custom furniture library
'amazing-home-suggestion-feedbacks' // User feedback on suggestions
'amazing-home-welcome-seen'  // First-time user guide dismissed
```

### Serialization

```typescript
// Save
const json = JSON.stringify(document, null, 2)
localStorage.setItem('amazing-home-document', json)

// Load
const stored = localStorage.getItem('amazing-home-document')
const parsed = JSON.parse(stored)
if (parsed.version === '1.0.0') {
  loadDocument(parsed)
}
```

---

## 8. Export Flow

### JSON Export

User clicks "Export":
1. Serialize document to JSON
2. Add metadata (version, project name, timestamps)
3. Download as `.json` file

### Import Flow

User clicks "Import":
1. File picker opens
2. Read JSON file
3. Validate version field
4. Load document into Zustand

---

## 9. AI Extension Points

### Layout Suggestions (Feature 011)

**Current**: Rule-based templates (15 presets per priority)

**Extension Points**:
- `generateSuggestions()` could call external LLM API
- Priority weights could be user-configurable
- Suggestion cards could include confidence scores

### Wall Detection (Feature 018)

**Current**: Simple grayscale threshold detection

**Extension Points**:
- Replace with ML-based edge detection (e.g., OpenCV.js)
- Add confidence scoring per detected wall
- Multi-pass detection (horizontal → vertical → diagonal)

---

## 10. Async AI Development Workflow

### Day-Sized Execution Loop

This project was developed using `amazing-async-dev`:

```
plan-day → Create bounded task (ExecutionPack)
run-day → AI executes autonomously
review-night → Human reviews (20-30 min)
resume-next-day → Continue from RunState
```

### Results

| Metric | Value |
|--------|-------|
| Features completed | 24 features |
| Tests passing | 86 tests (100% pass rate) |
| Development sessions | Multiple autonomous sessions |
| Human review time | ~30 minutes per session |

### Key Benefits

- **State-based resume**: Next day starts from RunState, no context reconstruction
- **Bounded execution**: Clear task_scope prevents scope creep
- **Artifact-first**: ExecutionPack → ExecutionResult → DailyReviewPack

---

## 11. Tradeoffs

### Accepted Tradeoffs

| Tradeoff | Reason |
|----------|--------|
| Bundle size 1.4MB | Three.js heavy, but gzip ~395KB acceptable |
| No real-time collaboration | Static deployment, no backend |
| No auto wall detection | Experimental only, manual tracing primary |
| No room polygon detection | Complex algorithm, MVP scope |
| Local-only persistence | No cloud sync, static deployment |

### Rejected Alternatives

| Alternative | Why Rejected |
|-------------|--------------|
| Redux for state | Overkill for single document |
| SVG for 2D | Performance concerns with 100+ objects |
| Backend storage | Violates static deployment constraint |
| WebGL-only (no 2D) | Users need tracing precision |

---

## 12. Scaling Considerations

### Current Limits

- **Floor plan size**: ~800×600px practical limit (canvas memory)
- **Furniture count**: ~100 items before performance degradation
- **Wall count**: ~50 walls before 3D render slowdown

### Scaling Paths

| Problem | Solution |
|---------|----------|
| Large floor plans | Image tiling, lazy rendering |
| Many furniture items | Virtualization, visible-area-only rendering |
| Complex walls | Simplify geometry, reduce mesh count |

---

## 13. Testing Strategy

### Test Categories

| Category | Tests | Coverage |
|----------|-------|----------|
| Document operations | 45 | Wall/furniture CRUD, undo/redo |
| Geometry utilities | 11 | Distance, bounding box, wall mesh |
| Furniture operations | 12 | Catalog, placement, dimensions |
| Serialization | 16 | JSON export/import, validation |
| Scaffold | 2 | Basic sanity checks |

### Testing Approach

- **Unit tests**: Pure functions (geometry, serialization)
- **Integration tests**: Zustand actions with document updates
- **No E2E tests**: Static deployment, manual verification

---

## 14. Deployment Architecture

### GitHub Pages Workflow

```yaml
# .github/workflows/deploy.yml
- npm ci --legacy-peer-deps
- npm run build
- GITHUB_PAGES=true (sets base path)
- Deploy to gh-pages branch
```

### Build Output

```
dist/
├── index.html           (entry point)
├── assets/
│   ├── index-*.js       (bundle ~1.4MB)
│   └── index-*.css      (styles ~17KB)
```

---

## 15. Future Architecture

### Near-term (V1.5)

- Grid snapping overlay
- Room polygon detection
- Performance optimization (virtualization)

### Medium-term (V2)

- Optional backend for cloud sync
- Real-time collaboration (WebRTC)
- AI-powered suggestions (LLM integration)

---

## 16. Key Files Reference

| File | Purpose |
|------|---------|
| `src/store/useFloorPlanStore.ts` | Zustand state + actions |
| `src/domain/floorplan/types.ts` | Type definitions |
| `src/domain/floorplan/document.ts` | Document operations |
| `src/components/editor2d/Editor2D.tsx` | 2D canvas editor |
| `src/components/preview3d/Preview3D.tsx` | 3D WebGL preview |
| `src/domain/floorplan/geometry.ts` | Geometry utilities |
| `src/domain/floorplan/furniture-catalog.ts` | Catalog definitions |

---

**Document Version**: 1.0  
**Last Updated**: April 2026