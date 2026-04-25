# 002 — Floor Plan Upload Workspace

## Feature Name
Floor Plan Upload and 2D Workspace

## Goal
Allow users to upload a floor plan image and view it inside a zoomable, pannable 2D workspace.

## Product Context
The core user journey starts from an existing home floor plan. Before recognition or tracing, users need a stable workspace where the image can be displayed and used as a tracing reference.

## Scope

### In Scope
- Upload JPG/PNG floor plan image
- Display image on 2D canvas
- Pan and zoom workspace
- Reset view
- Fit image to canvas
- Store uploaded image in browser memory/local object URL
- Basic source image metadata in app state

### Out of Scope
- PDF parsing
- Auto floor plan recognition
- Wall tracing
- 3D generation
- Project persistence beyond current session

## Recommended Library
- React-Konva / Konva.js

## Data Model Addition

```ts
type SourceImage = {
  id: string;
  name: string;
  objectUrl: string;
  width: number;
  height: number;
  uploadedAt: string;
};
```

## Implementation Tasks

1. Add upload button and hidden file input.
2. Validate file type for JPG/PNG.
3. Read image dimensions after upload.
4. Render image in Konva stage/layer.
5. Add mouse wheel zoom centered around cursor.
6. Add drag-to-pan support.
7. Add toolbar actions: fit to screen, reset view, clear image.
8. Store source image metadata in Zustand.
9. Add basic error message for unsupported files.
10. Add tests for upload validation and source image metadata handling.

## UX Requirements

- The user should immediately see the uploaded floor plan.
- The canvas should not feel stuck or static.
- Pan/zoom should feel smooth enough for tracing.
- Empty state should explain what to upload.

## Acceptance Criteria

- User can upload a JPG/PNG floor plan.
- Image appears inside the 2D workspace.
- User can zoom in/out.
- User can pan around the image.
- User can reset or fit the view.
- Unsupported files show a clear error.
- App state contains source image metadata.

## Verification Commands

```bash
npm run typecheck
npm run test
npm run build
```

## Manual Verification

1. Start dev server.
2. Upload a sample floor plan image.
3. Zoom in and inspect wall details.
4. Pan to all corners of the image.
5. Reset view.
6. Clear image and re-upload.

## async-dev Execution Note

This feature should produce screenshot evidence showing the uploaded floor plan in the workspace.
