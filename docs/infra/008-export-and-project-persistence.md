# 008 — Export and Project Persistence

## Feature Name
Local Project Persistence and Preview Export

## Goal
Allow users to save/load their project locally and export 2D/3D preview images.

## Product Context
A design tool becomes useful only if users can keep their work and share results. V1 should support local persistence before adding accounts or cloud storage.

## Scope

### In Scope
- Save current project to localStorage
- Load saved project from localStorage
- Export project JSON file
- Import project JSON file
- Export 2D canvas screenshot
- Export 3D preview screenshot
- Basic project name editing

### Out of Scope
- Cloud account system
- Multi-device sync
- PDF report generation
- Share link generation
- Collaboration

## Implementation Tasks

1. Add project name field.
2. Add save-to-browser action.
3. Add load-from-browser action.
4. Add export JSON action.
5. Add import JSON action with validation.
6. Add 2D screenshot export from canvas.
7. Add 3D screenshot export from WebGL canvas.
8. Add basic success/error toast messages.
9. Add tests for JSON import/export and validation.

## Acceptance Criteria

- User can save project locally.
- User can reload the app and recover saved project.
- User can export project JSON.
- User can import project JSON.
- User can export a 2D preview image.
- User can export a 3D preview image.
- Invalid JSON shows a safe error.

## Verification Commands

```bash
npm run typecheck
npm run test
npm run build
```

## Manual Verification

1. Create a project with walls and furniture.
2. Save to browser.
3. Refresh page.
4. Load saved project.
5. Export JSON.
6. Clear state.
7. Import JSON.
8. Export 2D screenshot.
9. Export 3D screenshot.

## async-dev Execution Note

This feature should capture evidence files: exported JSON and exported preview images.
