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

1. **Load Demo** - Click "Demo" button to see a sample project
2. **Upload Floor Plan** - Or upload your own JPG/PNG image
3. **Trace Walls** - Switch to Draw Wall mode, click start → click end
4. **View 3D** - Click 3D Preview toggle to see walls in 3D
5. **Add Furniture** - Click furniture type, then click canvas to place
6. **Edit Furniture** - Select furniture, drag to move, use Inspector to resize/rotate
7. **Save Project** - Click Save button (stores in localStorage)
8. **Export JSON** - Click Export to download project file

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
| `npm run test` | Run tests once (86 tests) |
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

### Implemented (V1 MVP + Feature 010)

| Feature | Status |
|---------|--------|
| Floor plan image upload | ✅ JPG/PNG, max 10MB |
| 2D canvas with pan/zoom | ✅ Scroll zoom, drag pan |
| Wall tracing editor | ✅ Click start → click end |
| Wall selection/editing | ✅ Endpoint handles, thickness |
| 3D wall preview | ✅ Box meshes, orbit controls |
| Furniture catalog | ✅ 7 types (sofa, bed, chair, etc.) |
| Furniture placement | ✅ Click-to-place mode |
| 3D furniture preview | ✅ Colored boxes by category |
| Project persistence | ✅ localStorage save/load |
| JSON export/import | ✅ FloorPlanDocument serialization |
| Project name editing | ✅ Inline edit in header |
| Undo/redo | ✅ Keyboard shortcuts (Ctrl+Z/Y) |
| Loading states | ✅ Spinner during image upload |
| Built-in demo project | ✅ "Demo" button loads sample |
| First-time user guide | ✅ Welcome modal on first visit |
| Empty state hints | ✅ Action guidance messages |
| Product disclaimer | ✅ Not for construction/engineering |

---

## Roadmap

### Phase 2 — Showcase & Usability (In Progress)

| Feature | Description | Status |
|---------|-------------|--------|
| 010 Public Demo Hardening | Built-in demo, user guide, empty states | ✅ Complete |
| 011 AI Layout Suggestions | Rule-based layout recommendations | 🔜 Planned |
| 012 Layout Version Comparison | Save/compare design versions | 🔜 Planned |
| 013 Layout Recommendation UX | Apply suggestions as versions | 🔜 Planned |

### Phase 3 — Smart Layout

| Feature | Description | Status |
|---------|-------------|--------|
| 014 Parametric Furniture | Custom dimensions for furniture | 🔜 Planned |
| 015 User-defined Dimensions | Furniture property inspector | 🔜 Planned |
| 016 Product Image Reference | Attach images to furniture | 🔜 Planned |
| 017 Furniture Asset Library | Reusable personal library | 🔜 Planned |

### Phase 4 — Floor Plan Recognition

| Feature | Description | Status |
|---------|-------------|--------|
| 018 Wall Detection Spike | Experimental line detection | 🔜 Planned |
| 019 Wall Detection Review | Accept/reject candidates | 🔜 Planned |
| 020 Recognition Correction UX | Fix detection errors | 🔜 Planned |

### Phase 5 — Portfolio Packaging

| Feature | Description | Status |
|---------|-------------|--------|
| 021 Case Study Page | Product/engineering writeup | 🔜 Planned |
| 022 Demo Video/GIF | Visual demo for sharing | 🔜 Planned |
| 023 Architecture Writeup | Technical documentation | 🔜 Planned |
| 024 Resume Packaging | Portfolio-ready descriptions | 🔜 Planned |

See full roadmap: [docs/infra/ai_home_layout_next_stage_roadmap.md](docs/infra/ai_home_layout_next_stage_roadmap.md)

---

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| Bundle size > 1MB | Major | Accepted (Three.js; gzip ~384KB) |
| No grid snapping | Minor | Planned V1.5 |
| Konva type workarounds | Low | Upstream issue |
| No room detection | Minor | Planned V2 |

**Fixed issues**: Undo/redo ✅, Click-to-place furniture ✅, Loading states ✅

See full report: [docs/product/known-issues.md](docs/product/known-issues.md)

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
- Document model: 45 tests
- Geometry utilities: 11 tests
- Furniture operations: 12 tests
- Serialization/persistence: 16 tests
- Scaffold: 2 tests

**Total**: 86 tests

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

## Case Study

See [docs/case-study.md](docs/case-study.md) for:
- Problem statement and product direction
- Architecture and technical decisions
- Feature breakdown and roadmap
- Async AI development workflow
- Limitations and positioning statement

---

## License

MIT