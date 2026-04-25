# Initial Architecture

**Amazing Home - V1 MVP Technical Foundation**

---

## Overview

Amazing Home is a browser-based home layout visualization tool built with a modern React + TypeScript stack. The architecture prioritizes simplicity and manual workflow validation before introducing AI features.

---

## Core Architecture Principle

**Single Source of Truth**: The `FloorPlanDocument` serves as the unified data model that all components consume and produce.

```typescript
type FloorPlanDocument = {
  project: ProjectMeta;
  sourceImage?: SourceImage;
  scale?: ScaleCalibration;
  walls: Wall[];
  rooms: Room[];
  doors: Door[];
  windows: Window[];
  furniture: FurnitureItem[];
  settings: ProjectSettings;
};
```

The 2D editor modifies this model. The 3D preview reads this model. Export workflows serialize this model.

**Avoid maintaining separate 2D and 3D state models.**

---

## Component Architecture

### Layout Shell

```
┌─────────────────────────────────────────────────┐
│ Header (project name, mode indicator)           │
├───────────┬─────────────────────┬───────────────┤
│ Sidebar   │ MainWorkspace       │ Inspector     │
│ (tools)   │ (2D Editor | 3D)    │ (properties)  │
│           │                     │               │
│           │                     │               │
├───────────┴─────────────────────┴───────────────┤
```

### Component Layers

| Layer | Responsibility |
|-------|----------------|
| `layout/` | Shell structure, navigation |
| `editor2d/` | Canvas rendering, wall tracing, selection |
| `preview3d/` | Three.js scene, camera controls, furniture rendering |
| `panels/` | Tool palettes, dialogs, modals |
| `domain/` | Data models, geometry math, validation |

---

## State Management

Zustand provides a single global store for the FloorPlanDocument:

```typescript
// store/useFloorPlanStore.ts
interface FloorPlanStore {
  document: FloorPlanDocument | null;
  selectedElement: string | null;
  editingMode: '2d' | '3d';
  
  // Actions
  setDocument: (doc: FloorPlanDocument) => void;
  updateWall: (id: string, wall: Wall) => void;
  addFurniture: (item: FurnitureItem) => void;
}
```

---

## 2D Editor Strategy

**Konva.js** provides canvas-based rendering for:
- Floor plan image overlay
- Wall line drawing with drag handles
- Snap-to-grid and snap-to-wall
- Selection and transform tools

Wall geometry is stored as line segments with endpoints. The 2D editor does NOT render the 3D view - it only produces geometry data.

---

## 3D Preview Strategy

**React Three Fiber + Drei** provides:
- Wall mesh generation from 2D wall data
- Floor and ceiling planes
- Furniture model placement
- OrbitControls for camera navigation

The 3D preview reads the FloorPlanDocument and renders geometry. It does NOT modify the document - that happens in the 2D editor.

---

## Persistence Strategy

**V1**: localStorage + JSON import/export

```typescript
// Simple localStorage persistence
const saveProject = (doc: FloorPlanDocument) => {
  localStorage.setItem('amazing-home-project', JSON.stringify(doc));
};

const loadProject = (): FloorPlanDocument | null => {
  const data = localStorage.getItem('amazing-home-project');
  return data ? JSON.parse(data) : null;
};
```

**V1.5**: Supabase backend (planned)

---

## Build and Tooling

| Tool | Purpose |
|------|---------|
| Vite | Fast HMR, optimized builds |
| TypeScript | Type safety, strict mode |
| Tailwind CSS | Utility-first styling |
| ESLint | Code quality |
| Vitest | Unit testing |

---

## Future Extensions

| Phase | Addition |
|-------|----------|
| V1.5 | Undo/redo, snapping improvements |
| V2 | AI layout suggestions |
| V3 | User-imported furniture, image-to-3D |

---

## References

- Roadmap: `docs/infra/00-ai-home-layout-preview-roadmap.md`
- Product Brief: `projects/amazing-home/product-brief.md`
- Orchestration: `amazing-async-dev`