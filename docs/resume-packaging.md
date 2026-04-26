# Amazing Home — Resume & Portfolio Packaging

**Purpose**: Interview-ready project descriptions  
**Last Updated**: April 2026

---

## 1. One-Line Project Description

> Browser-based home layout visualization tool for uploading floor plans, tracing walls, placing furniture, and viewing 3D previews—all without a backend.

---

## 2. Resume Bullets (3 Options)

### Option A (Technical Focus)

- Built a browser-based home layout visualization tool using React, TypeScript, Konva.js, and Three.js, enabling users to upload floor plans, trace walls, generate 3D previews, place furniture, and export designs—all as a static GitHub Pages deployment with no backend infrastructure.

- Designed a unified FloorPlanDocument model to synchronize 2D canvas editing, 3D WebGL rendering, furniture placement, undo/redo history, version management, and JSON persistence in a single-document architecture, achieving 86 unit tests with 100% pass rate.

- Implemented experimental wall detection, layout suggestion generation, and wall correction tools as AI extension points, demonstrating iterative feature development through an async AI workflow that bounded execution scope and preserved state across multi-day autonomous sessions.

### Option B (Product Focus)

- Created Amazing Home, a browser-based tool for visualizing home layouts, allowing users to upload floor plan images, trace walls, place furniture from a catalog, view 3D previews, and export designs as JSON—all deployed as a static GitHub Pages demo with zero backend dependencies.

- Designed the product as a design visualization tool with clear boundaries (not for construction/engineering), implementing features like layout suggestions, version comparison, custom furniture assets, and wall correction tools based on a multi-phase roadmap.

- Developed 24 features across 6 phases using an async AI development workflow, completing MVP foundation, showcase hardening, AI suggestions, furniture personalization, wall detection spike, and portfolio packaging within bounded day-sized execution loops.

### Option C (Hybrid)

- Built Amazing Home, a browser-based home layout visualization tool using React, TypeScript, Konva, and Three.js, deployed as a static GitHub Pages app with no backend, enabling floor plan upload, wall tracing, 3D preview, furniture placement, and JSON export.

- Implemented a single-document architecture (FloorPlanDocument) with Zustand state management, undo/redo history, version management, and real-time 2D/3D synchronization, achieving 86 unit tests with 100% pass rate across 24 features.

- Demonstrated async AI development workflow with bounded day-sized execution, multi-phase roadmap planning, and autonomous feature implementation from MVP foundation through portfolio packaging.

---

## 3. GitHub README Summary

**Amazing Home** is a browser-based home layout visualization tool.

Upload a floor plan, trace walls, place furniture, see 3D preview, export as JSON.

- **Live Demo**: https://burburton.github.io/amazing-home/
- **Tech Stack**: React, TypeScript, Vite, Konva.js, Three.js, Zustand, Tailwind CSS
- **Features**: Wall tracing, 3D preview, furniture catalog, custom dimensions, layout suggestions, version comparison, wall detection, wall correction
- **Deployment**: Static GitHub Pages, no backend
- **Tests**: 86 unit tests, 100% pass rate

**Disclaimer**: This is a design visualization tool. Not for construction or engineering validation.

---

## 4. LinkedIn Project Description

**Amazing Home — Browser-Based Home Layout Visualization**

I built Amazing Home to demonstrate full-stack frontend skills: React, TypeScript, canvas-based 2D editing, WebGL 3D rendering, and state management—all deployed as a static GitHub Pages app with zero backend.

**What it does**:
- Upload floor plan images and trace walls manually or with experimental auto-detection
- Place furniture from a 7-category catalog or create custom pieces with defined dimensions
- View real-time 3D preview with orbit controls
- Save multiple layout versions and compare designs
- Get layout suggestions based on priorities (spaciousness, storage, work-from-home)
- Scan for wall problems (gaps, duplicates, misalignment) and apply quick fixes
- Export/import projects as JSON

**Tech highlights**:
- Konva.js for 2D canvas (walls, furniture, handles)
- Three.js + react-three-fiber for 3D WebGL preview
- Zustand for document-centric state with undo/redo
- 86 unit tests, 100% pass rate
- Static deployment, local persistence

**Check it out**: https://burburton.github.io/amazing-home/

This is a design visualization tool—not for construction or engineering. But it demonstrates what a single developer can build with modern frontend tech and disciplined execution.

---

## 5. Interview Explanation Script

### Opening (30 seconds)

"Amazing Home is a browser-based tool for visualizing home layouts. I built it to demonstrate my frontend capabilities: React, TypeScript, canvas-based 2D editing, and WebGL 3D rendering—all deployed as a static GitHub Pages app with no backend. Users can upload a floor plan, trace walls, place furniture, and see a real-time 3D preview."

### Architecture Deep Dive (1 minute)

"The core architecture is a single-document model. Everything—walls, furniture, settings, history—is stored in one `FloorPlanDocument` object managed by Zustand. When users add a wall or move furniture, I clone the document and push it to a history stack, which enables undo/redo with zero complexity. Both the 2D canvas and 3D scene read from the same document, so they're always synchronized. The 2D editor uses Konva.js for canvas rendering—it handles click events, drag interactions, and zoom/pan. The 3D preview uses Three.js via react-three-fiber, which gives us declarative 3D rendering with orbit controls for camera manipulation."

### Technical Challenges (1 minute)

"The main challenge was synchronizing 2D and 3D views without a backend. I chose a single-document architecture because it simplifies serialization—export is just `JSON.stringify(document)`, import is `JSON.parse()` with version validation. For the 2D canvas, I had to implement coordinate transformations: canvas coordinates (which include pan/zoom offsets) to document coordinates (which are absolute positions). That's `(pointer.x - panOffset) / zoomScale`. For 3D, I compute the bounding box of all walls to auto-position the camera, then convert each wall to a 3D box mesh by calculating its center, rotation angle, and dimensions."

### State Management (30 seconds)

"I chose Zustand over Redux because this app has a single document state, not complex slices. Zustand gives me minimal boilerplate—no actions/reducers, just direct state mutations. I added a history array for undo/redo: on each action, I clone the document and push to `past`, on undo I pop from `past` and push to `future`. This gives me 50-step undo history with ~1KB per snapshot, which is acceptable for localStorage."

### Features (30 seconds)

"The app has 24 features across 6 phases. Beyond the MVP (wall tracing, 3D preview, furniture placement), I added layout suggestions—rule-based templates for different priorities like spaciousness or work-from-home. Users can save multiple versions and compare them. There's also a custom furniture creator, product reference cards, and experimental wall detection with a review workflow where users can accept or reject detected candidates before applying."

### Testing (15 seconds)

"I wrote 86 unit tests covering document operations, geometry utilities, furniture placement, and serialization. The tests run in ~1 second with Vitest and happy-dom. Every feature I add comes with tests first—I don't commit unless all 86 pass."

### Async AI Workflow (15 seconds)

"This project also demonstrates an async AI development workflow. I used `amazing-async-dev` for day-sized execution loops: each day, I'd plan a bounded task, run autonomous execution, then review at night. This gave me state-based resume across sessions and prevented scope creep with clear task boundaries."

### Closing (15 seconds)

"The result is a complete frontend application: 24 features, 86 tests passing, deployed as a static demo. It's positioned as a design visualization tool—not for construction—but it shows what modern frontend tech can achieve with disciplined execution."

---

## 6. Project Positioning Statement

> **Amazing Home is a design visualization tool.**
> 
> It is **not**:
> - A construction planning tool
> - A structural engineering validator
> - A replacement for professional CAD software
> 
> **Use case**: Visualizing furniture placement, exploring layout ideas, communicating design concepts—not building plans.

---

## 7. Summary

| Deliverable | Location |
|-------------|----------|
| One-line description | Section 1 above |
| Resume bullets | Section 2 (3 options) |
| README summary | Section 3 |
| LinkedIn description | Section 4 |
| Interview script | Section 5 |
| Positioning statement | Section 6 |

**Document Version**: 1.0  
**Last Updated**: April 2026