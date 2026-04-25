# Amazing Home — Product & Engineering Case Study

**Product**: Browser-based home layout visualization tool  
**URL**: https://burburton.github.io/amazing-home/  
**Date**: April 2026

---

## Problem

Home layout planning tools are typically:
- **Heavy**: Professional CAD software requires training
- **Platform-bound**: Desktop-only, no browser access
- **Expensive**: Subscription-based, not accessible for casual users

**User need**: A lightweight, browser-based tool for visualizing home layouts—upload a floor plan, trace walls, see 3D preview, place furniture, and export designs.

---

## Product Direction

**Target user**: Homeowners planning renovations, renters visualizing furniture placement, casual users exploring layout ideas.

**Scope boundary**:
- **Visualization only** — not for construction/engineering validation
- **Browser-based** — no backend, static deployment on GitHub Pages
- **Manual tracing** — user traces walls, no automatic recognition (yet)

**Non-goals**:
- Professional CAD replacement
- Structural engineering validation
- Cloud project sync
- Multi-user collaboration

---

## Architecture

### Frontend Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Build | Vite | Fast dev server, optimized builds |
| Framework | React 18 | UI components |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first styling |
| State | Zustand | Document-centric state management |
| 2D Editor | Konva.js + react-konva | Canvas rendering |
| 3D Preview | Three.js + react-three-fiber | 3D visualization |
| Testing | Vitest + happy-dom | Unit tests |

### Data Model

**Single FloorPlanDocument as source of truth**:

```typescript
interface FloorPlanDocument {
  version: string
  project: ProjectMeta
  sourceImage?: SourceImage
  walls: Wall[]
  rooms: Room[]
  furniture: FurnitureItem[]
  settings: ProjectSettings
}
```

All operations (add wall, move furniture) update the document, which flows to both 2D and 3D views.

### State Flow

```
User action → Zustand store → FloorPlanDocument update → 
  → 2D Konva canvas re-render
  → 3D Three.js scene re-render
```

---

## Feature Breakdown

### Phase 1 — MVP Foundation (Features 001-009)

| Feature | Description | Status |
|---------|-------------|--------|
| 001 | Project scaffold (Vite, React, TypeScript, Tailwind) | ✅ |
| 002 | Floor plan upload, canvas workspace, pan/zoom | ✅ |
| 003 | Wall tracing editor, click start → click end | ✅ |
| 004 | FloorPlanDocument model, serialization | ✅ |
| 005 | 3D preview with Three.js wall meshes | ✅ |
| 006 | Furniture library (7 categories) | ✅ |
| 007 | Furniture placement, drag/resize/rotate | ✅ |
| 008 | Project persistence, JSON export/import | ✅ |
| 009 | Dogfooding review, release readiness | ✅ |

### Phase 2 — Showcase & Usability (Features 010-012)

| Feature | Description | Status |
|---------|-------------|--------|
| 010 | Demo button, welcome guide, empty states | ✅ |
| 011 | Layout suggestions (rule-based) | ✅ |
| 012 | Layout version saving/switching | ✅ |

### Phase 3 — Personalization (Features 014-017)

| Feature | Description | Status |
|---------|-------------|--------|
| 014 | Custom furniture creation (dimensions) | ✅ |
| 015 | Furniture dimension editing | ✅ |
| 016 | Product image reference cards | ✅ |
| 017 | Furniture asset library with persistence | ✅ |

### Phase 4 — Advanced Features (Features 018, 021, 022)

| Feature | Description | Status |
|---------|-------------|--------|
| 018 | Wall detection spike (experimental) | ✅ |
| 021 | Case study page | ✅ |
| 022 | Demo video/GIF walkthrough | ✅ |

---

## Technical Decisions

### Why Konva.js for 2D?

- **Canvas-based**: Better performance for large floor plans
- **Event handling**: Built-in click/drag/zoom support
- **React integration**: react-konva provides declarative API

**Tradeoff**: Bundle size increase (~100KB), but acceptable for visualization tool.

### Why Three.js for 3D?

- **Industry standard**: Most popular WebGL library
- **React Three Fiber**: Declarative 3D rendering
- **Orbit controls**: Built-in camera manipulation

**Tradeoff**: Bundle size ~1.3MB, but gzip ~390KB acceptable for demo.

### Why Zustand over Redux?

- **Document-centric**: Single document state, no complex slices
- **Simplicity**: No actions/reducers boilerplate
- **Performance**: Built-in shallow equality for selective updates

### Why No Backend?

- **Static hosting**: GitHub Pages, zero infrastructure
- **Browser storage**: localStorage for persistence
- **Export flow**: JSON download, user controls their data

---

## Limitations

### Current Limitations

1. **Bundle size**: 1.3MB (Three.js heavy)
2. **Manual tracing**: User must trace walls, no auto-detection
3. **No grid snapping**: Free positioning only
4. **No room detection**: Walls don't form room polygons
5. **No loading states**: Large images may freeze briefly

### Accepted Tradeoffs

- **Visualization only**: Not for construction/engineering
- **Browser-bound**: No mobile-first, no cloud sync
- **Demo quality**: Sufficient for portfolio, not production

---

## Async AI Development Workflow

This project used `amazing-async-dev` for day-sized async development:

### Workflow

```
plan-day → Create bounded task
run-day → AI executes autonomously
review-night → Human reviews (20-30 min)
resume-next-day → Continue from state
```

### Results

| Metric | Value |
|--------|-------|
| Features completed | 15 features |
| Tests passing | 86 tests (100% pass rate) |
| Development sessions | Multiple autonomous sessions |
| Human review time | ~30 minutes per session |

### Key Benefits

- **State-based resume**: Next day starts from RunState, no context reconstruction
- **Bounded execution**: Clear task_scope prevents scope creep
- **Artifact-first**: ExecutionPack → ExecutionResult → DailyReviewPack

---

## Future Roadmap

### Near-term (V1.5)

- Grid snapping overlay
- Wall detection spike (experimental)
- Demo video/GIF for portfolio

### Medium-term (V2)

- Room detection from closed wall loops
- AI layout suggestions with LLM integration
- Parametric furniture library

### Long-term (V3)

- Mobile-first editor
- Cloud project sync
- Multi-user collaboration

---

## Positioning Statement

> **Amazing Home is a design visualization tool.**
> 
> It is **not**:
> - A construction planning tool
> - A structural engineering validator
> - A replacement for professional CAD software
> 
> **Use case**: Visualizing furniture placement, exploring layout ideas, communicating design concepts—not building plans.

---

## Repository

- **Code**: https://github.com/Burburton/amazing-home
- **Live Demo**: https://burburton.github.io/amazing-home/
- **Docs**: `/docs` folder in repository

---

**Last Updated**: April 2026