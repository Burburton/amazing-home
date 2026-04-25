# AI Home Layout Preview — Next Stage Roadmap

**Document Type:** Post-MVP Roadmap  
**Target Project:** AI Home Layout Preview  
**Current Assumption:** Features `001`–`009` have been completed.  
**Recommended Next Step:** Start with `010-public-demo-hardening-showcase-release`.  
**Primary Goal:** Turn the current MVP into a public, understandable, portfolio-ready GitHub Pages demo, then gradually add AI-assisted design capabilities.

---

## 1. Current Project Status

The project has already completed the first-stage MVP foundation:

```text
001 project scaffold
002 floorplan upload workspace
003 wall tracing editor
004 floorplan document model
005 basic 3D shell preview
006 basic furniture library
007 furniture placement
008 export and project persistence
009 dogfooding review and release readiness
```

This means the project has moved beyond a pure technical prototype. The next stage should focus on two things:

1. Make the current MVP easy to understand and publicly demonstrable.
2. Add AI/product value carefully without over-expanding the scope.

---

## 2. Strategic Direction

### Recommended Direction

The next stage should follow this sequence:

```text
Showcase hardening
↓
AI layout suggestion
↓
Layout version comparison
↓
Furniture personalization
↓
Floor plan recognition spike
↓
Portfolio packaging
```

### What Not to Do Yet

Avoid jumping directly into these heavy features:

```text
- Full AI floor plan recognition
- Image-to-3D furniture generation
- User accounts
- Cloud project sync
- Multi-user collaboration
- Mobile-first editor
- Construction or engineering validation
```

These features may be valuable later, but they are too expensive and risky before the public demo flow is polished.

---

# Phase 2 — Showcase and Usability

## Feature 010 — Public Demo Hardening & Showcase Release

### Goal

Turn the current MVP into a polished public demo that can be shown through GitHub Pages without manual explanation.

### Why This Matters

A portfolio project needs to be understandable by someone who opens the link for the first time. The current MVP may work technically, but the next goal is to make it presentable, guided, and self-explanatory.

### Scope

- Add a built-in demo project.
- Add a first-time user guide.
- Improve empty states and error states.
- Improve GitHub Pages presentation flow.
- Update README with demo URL, screenshots, tech stack, MVP capabilities, limitations, and roadmap.
- Add screenshots or GIFs under `docs/assets/`.
- Add product boundary disclaimer.

### Built-in Demo Project Requirements

The app should include a button such as:

```text
Load Demo Project
```

The demo project should load:

```text
- sample floor plan image or placeholder floor plan
- traced wall data
- room/floorplan metadata
- basic furniture placement
- 3D shell preview
```

### First-time User Guide

Add a simple guide:

```text
1. Upload or load a demo floor plan
2. Trace walls
3. Open 3D preview
4. Add furniture
5. Export result
```

### Empty State Requirements

Important empty states:

```text
- No floor plan loaded
- No walls traced
- No furniture added
- No export generated
```

Each empty state should explain the next action.

### README Requirements

README should include:

```text
- Live Demo URL
- Project summary
- Key features
- Tech stack
- How to run locally
- How to deploy to GitHub Pages
- Screenshots
- Known limitations
- Roadmap
- Product boundary disclaimer
```

### Product Boundary Disclaimer

Use wording similar to:

```text
This project is a design visualization tool. It is not a construction, structural engineering, or safety validation tool.
```

### Out of Scope

```text
- AI layout generation
- AI floor plan recognition
- Backend storage
- Account system
- Image-to-3D furniture generation
```

### Acceptance Criteria

```text
- A first-time visitor can understand the app within 1 minute.
- The app can load a demo project without requiring user-uploaded files.
- The demo project demonstrates floor plan, traced walls, 3D shell, furniture placement, and export flow.
- Empty states provide clear next actions.
- README includes demo URL, screenshots, capabilities, limitations, and roadmap.
- GitHub Pages deployment still works.
- npm run build passes.
```

### Suggested OpenCode Prompt

```text
Start feature 010-public-demo-hardening-showcase-release.

Goal:
Turn the current AI Home Layout Preview MVP into a polished public demo suitable for GitHub Pages and portfolio review.

Scope:
- Add a built-in demo project with sample floor plan, walls, 3D shell, and furniture placement.
- Add a first-time user guide explaining the core flow.
- Improve empty states and error states.
- Update README with live demo URL, screenshots, usage instructions, tech stack, limitations, and roadmap.
- Add product boundary disclaimer.
- Keep the app fully compatible with static GitHub Pages deployment.

Out of scope:
- AI recognition
- AI layout generation
- Backend services
- Account system
- Cloud storage
- Image-to-3D furniture generation

Acceptance:
- npm run build passes.
- GitHub Pages deployment still works.
- Demo project can be loaded from the UI.
- First-time users can understand the workflow without external explanation.
```

---

# Phase 3 — Smart Layout Suggestions

## Feature 011 — AI Layout Suggestion Spike

### Goal

Explore layout suggestions based on the existing floorplan JSON and furniture data.

### Recommended First Implementation

Start with a rule-based or mock AI system before connecting to a real LLM.

The system should generate layout suggestions for user priorities such as:

```text
- Spaciousness priority
- Storage priority
- Work-from-home priority
- Family-friendly layout
- Minimal furniture layout
```

### Input

```text
- floorplan JSON
- room dimensions
- wall structure
- existing furniture items
- selected user priority
```

### Output

Each suggestion should include:

```text
- layout option name
- one-sentence summary
- recommended changes
- best-fit scenario
- tradeoff explanation
```

Example:

```text
Option: Work-from-home layout
Summary: Creates a focused work zone near the window while preserving the main living area.
Changes:
- Move desk near the window.
- Keep sofa facing the main wall.
- Add storage cabinet near the entrance.
Tradeoff:
- Better work separation, but slightly less open floor area.
```

### Scope

- Add layout suggestion panel.
- Add user priority selection.
- Generate 3–5 suggestion cards.
- Do not automatically mutate the floorplan yet.
- Allow saving a suggestion as a note or candidate layout.

### Out of Scope

```text
- Real LLM integration unless project is ready
- Automatic furniture movement
- Complex design optimization
- Real interior design validation
```

### Acceptance Criteria

```text
- Users can select a layout priority.
- The app generates multiple suggestion cards.
- Suggestions are based on available project data where possible.
- Suggestions are clearly marked as design references, not guaranteed professional design advice.
- npm run build passes.
```

---

## Feature 012 — Layout Version Comparison

### Goal

Allow users to compare different layout versions and design directions.

### Scope

- Add layout version model if missing.
- Allow saving current layout as a named version.
- Allow duplicating a layout version.
- Allow switching between versions.
- Show version metadata:
  - name
  - created time
  - summary
  - source type: manual / suggestion / imported
- Support side-by-side comparison if feasible.

### Recommended Data Model

```ts
type LayoutVersion = {
  id: string;
  name: string;
  sourceType: 'manual' | 'suggestion' | 'demo';
  summary?: string;
  floorplan: FloorPlan;
  createdAt: string;
  updatedAt: string;
};
```

### Acceptance Criteria

```text
- Users can save the current design as a named version.
- Users can duplicate and switch layout versions.
- Data persists through existing local persistence mechanism.
- Version switching updates both 2D and 3D views.
- npm run build passes.
```

---

## Feature 013 — Layout Recommendation UX

### Goal

Make layout suggestions feel integrated into the product instead of being isolated text cards.

### Scope

- Convert suggestions into candidate version actions.
- Add “Apply as New Version” button.
- Add before/after explanation panel.
- Add design rationale display.
- Add user feedback buttons:
  - useful
  - not useful
  - too generic
  - unrealistic

### Acceptance Criteria

```text
- A generated suggestion can be saved as a candidate layout version.
- User can compare original and suggestion-based versions.
- Basic user feedback can be captured locally.
- npm run build passes.
```

---

# Phase 4 — Furniture Personalization

## Feature 014 — Parametric Furniture Generator

### Goal

Generate simple 3D furniture assets from category and dimensions without using image-to-3D.

### Why This Comes Before Image-to-3D

Image-to-3D is expensive and unstable. A parametric generator gives the product a useful personalization path while staying technically manageable.

### Supported Categories

```text
- sofa
- bed
- dining table
- chair
- desk
- cabinet
- coffee table
```

### Input

```text
- furniture category
- width
- depth
- height
- color/material label
```

### Output

```text
- simple 3D placeholder model
- 2D footprint
- saved furniture asset
```

### Scope

- Add create custom furniture form.
- Generate simple 2D and 3D representation.
- Save generated furniture to local furniture library.
- Allow placement in existing layout.

### Acceptance Criteria

```text
- User can create furniture with custom dimensions.
- Generated furniture appears in the furniture library.
- Generated furniture can be placed in 2D and shown in 3D.
- Dimensions are preserved in project data.
- npm run build passes.
```

---

## Feature 015 — User-defined Furniture Dimensions

### Goal

Improve furniture editing so users can precisely adjust width, depth, height, and rotation.

### Scope

- Add furniture property inspector.
- Edit width, depth, height, rotation.
- Validate dimensions.
- Update 2D footprint and 3D model in near real time.
- Add reset-to-default option.

### Acceptance Criteria

```text
- Selecting furniture opens a property inspector.
- Dimension edits update the scene immediately.
- Invalid values are blocked or clearly explained.
- Changes persist across reloads.
- npm run build passes.
```

---

## Feature 016 — Product Image Reference Card

### Goal

Allow users to attach product reference images to custom furniture assets without generating a 3D model yet.

### Scope

- Upload product reference image.
- Attach it to a furniture asset.
- Show reference image in furniture detail panel.
- Store product name, category, dimensions, and notes.
- Support local persistence.

### Acceptance Criteria

```text
- User can upload a product image for a furniture item.
- The image is displayed in the furniture asset detail panel.
- Product metadata persists locally.
- The feature does not attempt image-to-3D generation yet.
- npm run build passes.
```

---

## Feature 017 — Furniture Asset Library V1

### Goal

Turn basic and user-created furniture into a reusable personal asset library.

### Scope

- Add furniture library page or side panel.
- Show built-in and custom furniture separately.
- Support search/filter by category.
- Support duplicate/delete custom asset.
- Support placing asset into current layout.

### Acceptance Criteria

```text
- Furniture assets are organized in a usable library UI.
- Built-in and custom assets are visually distinguished.
- Users can reuse custom furniture across project versions.
- npm run build passes.
```

---

# Phase 5 — Floor Plan Recognition Spike

## Feature 018 — Floor Plan Recognition Spike

### Goal

Explore whether basic wall detection can assist the user without replacing manual correction.

### Recommended Scope

This should be a spike, not a production feature.

Start with one or two approaches:

```text
- image preprocessing
- line detection
- contour extraction
- simple wall candidate generation
```

The output should be candidate wall lines, not final walls.

### Important Product Principle

Recognition must remain editable. The user must be able to correct everything.

### Scope

- Add experimental recognition entry point.
- Process uploaded floor plan image.
- Generate candidate wall lines.
- Let user review and accept/reject candidates.
- Keep manual tracing as the primary fallback.

### Out of Scope

```text
- Perfect automatic recognition
- Room semantic recognition
- Door/window detection
- Engineering accuracy
- Backend ML pipeline unless intentionally added
```

### Acceptance Criteria

```text
- Recognition can produce candidate wall lines on at least one sample floor plan.
- Candidates can be accepted or discarded.
- Existing manual tracing flow remains unaffected.
- The feature is clearly labeled experimental.
- npm run build passes.
```

---

## Feature 019 — Wall Detection Review Workflow

### Goal

Improve the UX for reviewing automatically detected wall candidates.

### Scope

- Show detected candidates in a different visual style.
- Add accept all / reject all.
- Add per-wall accept/reject.
- Add confidence or quality label if available.
- Add conversion from candidate wall to editable wall.

### Acceptance Criteria

```text
- Users can review recognition results before applying them.
- Accepted candidates become normal editable walls.
- Rejected candidates are removed.
- Manual editing works after acceptance.
- npm run build passes.
```

---

## Feature 020 — AI Recognition Correction UX

### Goal

Make recognition errors easy to fix.

### Scope

- Add correction prompts after recognition.
- Highlight suspicious wall gaps.
- Highlight overlapping or disconnected wall lines.
- Add quick fix actions:
  - connect endpoints
  - delete duplicate wall
  - align wall
  - snap endpoint

### Acceptance Criteria

```text
- Common recognition issues are visually surfaced.
- Users can fix wall gaps and duplicates faster than manual editing from scratch.
- The flow reinforces that AI output is only a draft.
- npm run build passes.
```

---

# Phase 6 — Portfolio and Career Packaging

## Feature 021 — Case Study Page

### Goal

Create a product/engineering case study page for the project.

### Scope

Add a page or markdown document explaining:

```text
- problem
- users
- product direction
- architecture
- feature breakdown
- technical decisions
- limitations
- future roadmap
- async-dev dogfooding process
```

### Acceptance Criteria

```text
- Case study can be linked from README.
- It explains both product and engineering decisions.
- It includes screenshots or GIFs.
- It clearly describes the AI-assisted development workflow.
```

---

## Feature 022 — Demo Video / GIF

### Goal

Create a short visual demo for GitHub, resume, and portfolio sharing.

### Scope

Recommended demo flow:

```text
1. Open GitHub Pages demo
2. Load demo project
3. Show 2D traced floor plan
4. Switch to 3D shell
5. Place furniture
6. Export screenshot
```

### Acceptance Criteria

```text
- A 20–60 second demo video or GIF exists.
- README links to or embeds the demo.
- The demo highlights the core product flow.
```

---

## Feature 023 — Technical Architecture Writeup

### Goal

Document the system architecture in a way that is useful for interviews and portfolio review.

### Scope

Cover:

```text
- frontend architecture
- floorplan data model
- 2D editor architecture
- 3D rendering architecture
- local persistence
- export flow
- AI extension points
- async-dev dogfooding process
```

### Acceptance Criteria

```text
- Architecture writeup exists under docs/.
- It includes diagrams or structured sections.
- It explains important tradeoffs.
- It can be reused for interview storytelling.
```

---

## Feature 024 — Resume / Portfolio Packaging

### Goal

Prepare concise resume and portfolio descriptions for the project.

### Output

Create:

```text
- one-line project description
- 3 resume bullets
- GitHub README summary
- LinkedIn project description
- interview explanation script
```

### Example Resume Bullets

```text
- Built a browser-based AI home layout preview tool using React, TypeScript, Konva, and Three.js, enabling users to upload floor plans, trace walls, generate a 3D shell, place furniture, and export visual previews.

- Designed a unified floorplan JSON model to synchronize 2D editing, 3D rendering, furniture placement, local persistence, and export workflows in a static GitHub Pages-compatible application.

- Dogfooded an async AI development workflow to manage feature planning, execution packs, review artifacts, and release readiness across a multi-stage product roadmap.
```

### Acceptance Criteria

```text
- Resume-ready bullets are documented.
- Portfolio summary is documented.
- Interview explanation script is documented.
- Project positioning is clear: AI-assisted home layout visualization, not construction engineering.
```

---

# Recommended Execution Order

## Recommended Immediate Next Steps

```text
010 Public Demo Hardening & Showcase Release
011 AI Layout Suggestion Spike
012 Layout Version Comparison
013 Layout Recommendation UX
014 Parametric Furniture Generator
015 User-defined Furniture Dimensions
016 Product Image Reference Card
017 Furniture Asset Library V1
018 Floor Plan Recognition Spike
019 Wall Detection Review Workflow
020 AI Recognition Correction UX
021 Case Study Page
022 Demo Video / GIF
023 Technical Architecture Writeup
024 Resume / Portfolio Packaging
```

## Minimum Valuable Next Batch

If you want a smaller execution batch, do only:

```text
010 Public Demo Hardening & Showcase Release
011 AI Layout Suggestion Spike
012 Layout Version Comparison
014 Parametric Furniture Generator
021 Case Study Page
```

This batch gives you:

```text
- public demo quality
- first AI/product intelligence layer
- versioned design comparison
- personalized furniture direction
- portfolio-ready explanation
```

---

# How to Use This Roadmap with async-dev / OpenCode

## Suggested Workflow

For each feature:

```text
1. Create or register the feature in async-dev.
2. Generate a day plan or execution pack.
3. Feed the execution pack into OpenCode.
4. Run implementation.
5. Verify locally.
6. Deploy to GitHub Pages if applicable.
7. Run review-night or equivalent review process.
8. Record evidence and known issues.
9. Continue to the next feature only after acceptance criteria pass.
```

## Recommended Feature Start Prompt Template

```text
Start feature <feature-id>.

Use the roadmap requirements for this feature.

Constraints:
- Keep the app compatible with GitHub Pages static deployment.
- Do not introduce backend services unless explicitly required.
- Preserve existing MVP functionality.
- Update tests, README, and documentation when appropriate.
- Run npm run build before completion.

Deliverables:
- Implementation
- Updated documentation
- Verification notes
- Known limitations
- Screenshots or demo evidence where relevant
```

---

# Final Recommendation

The next feature should be:

```text
010-public-demo-hardening-showcase-release
```

Do this before adding more AI capabilities.

Reason:

The project already has a working MVP chain. The highest-value next move is to make the project publicly understandable and portfolio-ready. After that, add AI layout suggestions and furniture personalization in controlled steps.

