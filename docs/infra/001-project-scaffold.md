# 001 — Project Scaffold

## Feature Name
Project Scaffold and Development Baseline

## Goal
Create the initial web application repository for `ai-home-layout-preview`, including build tooling, folder structure, baseline UI, testing setup, and documentation.

## Product Context
This is the foundation for a browser-based home layout preview tool. The app will later support floor plan upload, manual wall tracing, 3D shell generation, furniture placement, and export.

## Scope

### In Scope
- Create Vite + React + TypeScript project
- Add Tailwind CSS
- Add basic app shell
- Add route/page placeholders
- Add lint/typecheck/test scripts
- Add basic README
- Add docs directory
- Add initial architecture note

### Out of Scope
- Floor plan upload
- 2D drawing tools
- 3D rendering
- Furniture placement
- Backend service
- AI features

## Suggested Tech Choices
- Vite
- React
- TypeScript
- Tailwind CSS
- Vitest
- ESLint
- Prettier

## Suggested Directory Structure

```text
src/
  app/
  components/
    layout/
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
docs/
  product/
  architecture/
  decisions/
  dogfooding/
```

## Implementation Tasks

1. Initialize Vite React TypeScript project.
2. Install Tailwind CSS and configure global styles.
3. Create app shell with header, sidebar placeholder, main workspace, and right inspector panel placeholder.
4. Add empty placeholder components for `Editor2D`, `Preview3D`, and `ProjectPanel`.
5. Add basic typecheck, lint, test, and build scripts.
6. Add a minimal unit test to confirm test runner works.
7. Add README with setup, run, build, and test commands.
8. Add `docs/architecture/initial-architecture.md`.

## Acceptance Criteria

- `npm install` works.
- `npm run dev` starts the app.
- `npm run build` passes.
- `npm run test` passes.
- App displays a clear shell with placeholder areas.
- README explains how to run the project.
- Directory structure supports future editor and 3D preview work.

## Verification Commands

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run dev
```

## async-dev Execution Note

This feature is ideal for the first execution pack. Keep the implementation boring and stable. Do not introduce 2D or 3D complexity yet.
