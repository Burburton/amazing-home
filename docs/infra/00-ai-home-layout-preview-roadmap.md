# AI Home Layout Preview — Executable Product Roadmap

## 1. Product Direction

**Product name:** AI Home Layout Preview

**One-line positioning:**
A browser-based home layout visualization tool that lets users upload a real floor plan, trace/edit the layout, generate a simple 3D home shell, place furniture, and export design previews.

This roadmap intentionally narrows the original AI Interior Layout and Furnishing App PRD into a practical first product that can be built, tested, and dogfooded through `amazing-async-dev`.

## 2. Strategic Decision

The original PRD has strong product potential but is too broad for a first implementation. It includes floor plan recognition, editable 2D layout, 3D generation, AI layout suggestions, AI furnishing, user-imported furniture references, product-image-to-3D generation, and export workflows.

For the first real application, the recommended direction is:

> Build a web MVP focused on **floor plan upload → manual wall tracing → simple 3D shell generation → basic furniture placement → export preview**.

This validates the core user behavior before investing in expensive AI features.

## 3. MVP Goal

The MVP should validate five questions:

1. Are users willing to upload a real floor plan?
2. Can users manually trace or correct a floor plan with acceptable effort?
3. Does a simple 3D shell help users understand their home layout?
4. Does basic furniture placement create enough value for layout preview?
5. Is this workflow suitable for async AI-assisted development using `amazing-async-dev`?

## 4. Recommended Technology Stack

### Frontend
- Vite
- React
- TypeScript
- Tailwind CSS

### 2D Editing
- React-Konva / Konva.js
- Canvas-based floor plan image display
- Wall tracing, drag handles, snapping, selection, deletion

### 3D Preview
- Three.js
- React Three Fiber
- Drei helpers such as OrbitControls

### State Management
- Zustand
- Single source of truth: `FloorPlanDocument`

### Persistence
- V1: localStorage + import/export JSON
- V1.5: Supabase or lightweight backend

### Deployment
- Vercel for web app deployment
- GitHub repository for code and evidence tracking

## 5. Architecture Principle

The product should be designed around a shared structured model:

```ts
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

The 2D editor modifies this model. The 3D preview reads this model. Export and save workflows serialize this model.

Avoid maintaining separate 2D and 3D state models.

## 6. Scope by Version

## V0 — Technical Spike

Purpose: prove that the browser can support the core interaction and rendering loop.

Deliverables:
- React app scaffold
- 2D canvas image workspace
- manual wall line drawing
- generated 3D wall shell from wall lines
- basic save/load JSON

Expected duration: 3–5 focused development days.

## V1 — MVP

Purpose: create a usable browser-based layout preview tool.

Deliverables:
- project creation
- floor plan upload
- pan/zoom workspace
- manual wall tracing editor
- room naming and ceiling height
- simple 3D shell generation
- basic furniture library
- furniture placement
- screenshot export
- README and demo workflow

Expected duration: 4–6 weeks depending on execution speed.

## V1.5 — Usability and Dogfooding Hardening

Purpose: make the MVP easier to use and easier to validate.

Deliverables:
- snapping and alignment improvements
- dimension labels
- undo/redo
- versioned project save
- sample project templates
- better export layout
- dogfooding report generated through async-dev

Expected duration: 2–4 weeks.

## V2 — AI-Assisted Layout Preview

Purpose: introduce AI only after the manual workflow is usable.

Deliverables:
- AI-assisted room/furniture layout suggestions
- prompt-based style intent
- rule-based constraints for furniture placement
- multi-version comparison
- lightweight recommendation summaries

Expected duration: 4–8 weeks.

## V3 — User-Imported Furniture and Image-to-3D

Purpose: validate the strongest differentiation from the original PRD.

Deliverables:
- furniture image upload
- dimension input or dimension drawing upload
- parametric furniture generation by category
- GLB asset support
- optional image-to-3D API integration
- personal furniture asset library

Expected duration: depends heavily on external AI/3D generation APIs.

## 7. Feature Execution Order

Recommended execution order:

1. `001-project-scaffold`
2. `002-floorplan-upload-workspace`
3. `003-wall-tracing-editor`
4. `004-floorplan-document-model`
5. `005-basic-3d-shell-preview`
6. `006-basic-furniture-library`
7. `007-furniture-placement`
8. `008-export-and-project-persistence`
9. `009-dogfooding-review-and-release-readiness`
10. `010-ai-layout-suggestion-spike`
11. `011-parametric-furniture-generation-spike`

The first nine features are enough for a real V1 MVP.

## 8. Repository Strategy

Use a new standalone product repository:

```text
ai-home-layout-preview/
```

Do not put application source code directly inside `amazing-async-dev`.

Use `amazing-async-dev` as the planning, execution, review, and evidence system:

```text
amazing-async-dev = async development operating system
ai-home-layout-preview = real product application repo
```

## 9. Recommended Repository Structure

```text
ai-home-layout-preview/
  README.md
  package.json
  vite.config.ts
  tsconfig.json
  src/
    app/
    components/
      editor2d/
      preview3d/
      furniture/
      panels/
    domain/
      floorplan/
      geometry/
      furniture/
    store/
    utils/
    styles/
  public/
    samples/
  docs/
    product/
    architecture/
    decisions/
    dogfooding/
  tests/
```

## 10. async-dev Usage Pattern

For each feature:

1. Create feature in async-dev.
2. Generate a day plan.
3. Produce an execution pack.
4. Feed execution pack to OpenCode or another coding agent.
5. Run verification.
6. Produce review-night artifact.
7. Capture blockers and follow-up tasks.
8. Continue with resume-next-day.

Recommended product id:

```text
ai-home-layout-preview
```

## 11. Definition of Done for V1

V1 is done when a user can:

1. Open the web app.
2. Create or load a project.
3. Upload a floor plan image.
4. Trace wall lines manually.
5. Set ceiling height.
6. Switch to 3D preview.
7. See generated walls and floor.
8. Add at least five furniture types.
9. Move, rotate, and resize furniture.
10. Save the project locally.
11. Export a 2D or 3D screenshot.
12. Follow README instructions to reproduce the demo.

## 12. What Not To Build in V1

Do not include these in V1:

- full AI floor plan recognition
- fully automatic 2D-to-3D reconstruction
- advanced photorealistic rendering
- construction safety validation
- plumbing/electrical/HVAC planning
- real contractor workflow
- multiplayer collaboration
- account system
- payment system
- image-to-3D furniture model generation
- mobile-first editing experience

## 13. Why This Direction Is Practical

This direction is feasible because it turns a broad AI interior design platform into a focused web-based spatial editing and preview tool. It also gives the project a clear evolution path:

```text
manual layout preview → assisted layout generation → personalized furniture import → AI furniture generation
```

The first version can be built without depending on uncertain AI model quality, while still preserving a natural path toward the original product vision.

## 14. Suggested Next Action

Start with `001-project-scaffold`, then immediately proceed to `002-floorplan-upload-workspace` and `003-wall-tracing-editor`.

Do not spend too much time perfecting the PRD before building. The most important early validation is whether the floor plan upload and wall tracing experience feels usable.
