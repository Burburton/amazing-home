# ProductBrief

> Minimum structured representation of a product idea.

---

## Metadata

| Field | Value |
|-------|-------|
| Object Type | `ProductBrief` |
| Purpose | Define a product idea with bounded scope |
| Update Frequency | Low (infrequent) |
| Owner | Human or planning workflow |

---

## Product Definition

```yaml
product_id: "amazing-home"
name: "Amazing Home"
problem: "Homeowners and solo builders lack a simple browser-based tool to visualize their home layout, trace floor plans manually, preview a 3D shell, and place furniture without requiring expensive software or complex AI features"
target_user: "Solo builders, homeowners, and DIY enthusiasts planning interior layouts who want a lightweight preview tool without subscription costs"
core_value: "Upload floor plan → trace walls → generate 3D shell → place furniture → export preview, all in browser without AI dependencies"
constraints:
  - "Single developer, day-sized async loops via amazing-async-dev"
  - "Browser-only, no backend for V1"
  - "Manual tracing only, no automatic floor plan recognition for V1"
  - "Basic furniture library, no user-imported furniture for V1"
  - "No AI features until manual workflow proven usable"
success_signal: "User can upload floor plan, trace walls, see 3D shell, place 5+ furniture types, save project, and export screenshot in under 30 minutes"

# Optional
non_goals:
  - "Full AI floor plan recognition"
  - "Automatic 2D-to-3D reconstruction"
  - "Photorealistic rendering"
  - "Account/payment system"
  - "Mobile-first editing"
  - "Multiplayer collaboration"

initial_feature_candidates:
  - "001-project-scaffold"
  - "002-floorplan-upload-workspace"
  - "003-wall-tracing-editor"
  - "004-floorplan-document-model"
  - "005-basic-3d-shell-preview"
  - "006-basic-furniture-library"
  - "007-furniture-placement"
  - "008-export-and-project-persistence"

notes: "First version validates core manual workflow before investing in AI features. Technology stack: Vite, React, TypeScript, Tailwind, Konva.js (2D), Three.js/React Three Fiber (3D), Zustand (state)."
```

---

## Validation Checklist

- [x] product_id is unique and follows pattern
- [x] problem is at least 20 characters
- [x] success_signal is measurable
- [x] constraints do not conflict with core_value
- [x] All required fields present

---

## Lifecycle Notes

| Aspect | Detail |
|--------|--------|
| Created by | Human planning |
| Updated | Infrequently (major scope changes) |
| Storage | `projects/amazing-home/product-brief.md` |
| Format | Markdown with YAML block |

---

## Reference

- Roadmap: `docs/infra/00-ai-home-layout-preview-roadmap.md`
- Orchestration: `amazing-async-dev` (managed_external mode)