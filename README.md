# Amazing Home

**Browser-based Home Layout Preview Tool**

🚀 **Live Demo**: https://burburton.github.io/amazing-home/

A lightweight web application for visualizing home layouts: upload floor plans, trace walls manually, generate 3D shells, place furniture, and export previews.

---

## Demo (5 minutes)

```bash
# Clone and setup
git clone https://github.com/user/amazing-home.git
cd amazing-home
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

### Demo Flow

1. **Upload Floor Plan** - Click Upload or drag image to canvas
2. **Trace Walls** - Switch to Draw Wall mode, click start → click end
3. **View 3D** - Click 3D Preview toggle to see walls in 3D
4. **Add Furniture** - Click furniture type in sidebar (Sofa, Bed, Chair, etc.)
5. **Edit Furniture** - Select furniture, drag to move, use Inspector to resize/rotate
6. **Save Project** - Click Save button (stores in localStorage)
7. **Export JSON** - Click Export to download project file

**Full demo script**: See [docs/product/v1-demo-script.md](docs/product/v1-demo-script.md)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:5173 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once (70 tests) |
| `npm run test:watch` | Run tests in watch mode |

---

## Project Structure

```text
amazing-home/
├── src/
│   ├── app/              # App entry and shell
│   ├── components/
│   │   ├── layout/       # Layout components (Header, Sidebar, InspectorPanel)
│   │   ├── editor2d/     # 2D floor plan editor (Konva canvas)
│   │   ├── preview3d/    # 3D visualization (Three.js)
│   │   ├── furniture/    # Furniture catalog and inspector
│   │   └── shared/       # Shared UI components
│   ├── domain/
│   │   └── floorplan/    # FloorPlanDocument model, geometry, furniture catalog
│   ├── store/            # Zustand state management
│   └── styles/           # Global CSS and Tailwind
├── tests/                # Unit tests (70 tests)
├── docs/
│   ├── product/          # Demo script, release checklist
│   └── dogfooding/       # V1 dogfooding report
└── public/               # Static assets
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Build | Vite | Fast dev server, optimized builds |
| Framework | React 18 | UI components |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first styling |
| State | Zustand | Document-centric state management |
| 2D Editor | Konva.js + react-konva | Canvas rendering, wall/furniture drawing |
| 3D Preview | Three.js + react-three-fiber | Wall/furniture 3D visualization |
| Testing | Vitest + happy-dom | Unit tests |

---

## Features

### Implemented (V1 MVP)

| Feature | Status |
|---------|--------|
| Floor plan image upload | ✅ JPG/PNG, max 10MB |
| 2D canvas with pan/zoom | ✅ Scroll zoom, drag pan |
| Wall tracing editor | ✅ Click start → click end |
| Wall selection/editing | ✅ Endpoint handles, thickness |
| 3D wall preview | ✅ Box meshes, orbit controls |
| Furniture catalog | ✅ 7 types (sofa, bed, chair, etc.) |
| Furniture placement | ✅ Add, move, rotate, resize |
| 3D furniture preview | ✅ Colored boxes by category |
| Project persistence | ✅ localStorage save/load |
| JSON export/import | ✅ FloorPlanDocument serialization |
| Project name editing | ✅ Inline edit in header |

### Planned (V1.5+)

- Room detection from closed wall loops
- Undo/redo functionality
- Click-to-place furniture mode
- Grid snapping overlay
- AI layout suggestions
- Parametric furniture generation

---

## Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Bundle size > 1MB | Major | Three.js heavy; code-split planned |
| Furniture spawns at center | Minor | Click placement mode planned |
| No undo/redo | Major | History stack planned for V1.5 |
| No grid snapping | Minor | Optional overlay planned |
| Konva type workarounds | Low | Third-party library limitation |

See full report: [docs/dogfooding/v1-dogfooding-report.md](docs/dogfooding/v1-dogfooding-report.md)

---

## Architecture

**Data Model**: Single `FloorPlanDocument` as source of truth

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
```

**State Flow**: Zustand store → Components → FloorPlanDocument

All operations (add wall, move furniture, etc.) update the document, which flows to both 2D and 3D views.

---

## Development Workflow

This project uses `amazing-async-dev` for day-sized async development:

1. `plan-day` → Create bounded task
2. `run-day` → AI executes autonomously
3. `review-night` → Human reviews (20-30 min)
4. `resume-next-day` → Continue from state

**Results**: 8 features, 70 tests, 100% pass rate in single session.

---

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test -- --coverage
```

**Test Categories**:
- Document model: 29 tests
- Geometry utilities: 11 tests
- Furniture operations: 12 tests
- Serialization/persistence: 16 tests
- Scaffold: 2 tests

---

## Deployment

```bash
# Static hosting (any CDN)
npm run build
# Upload dist/ folder

# Vercel
vercel deploy

# Netlify
netlify deploy
```

---

## License

MIT