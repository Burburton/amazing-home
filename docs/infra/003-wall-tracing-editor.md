# 003 — Wall Tracing Editor

## Feature Name
Manual Wall Tracing Editor

## Goal
Allow users to manually trace walls over the uploaded floor plan image by drawing editable wall lines.

## Product Context
The first MVP should not depend on automatic floor plan recognition. Manual tracing gives users control and provides the structured wall data needed for 3D generation.

## Scope

### In Scope
- Draw wall line by clicking start and end points
- Select wall
- Move wall endpoints
- Delete wall
- Set wall thickness
- Mark wall as load-bearing
- Show basic wall length in canvas units
- Store walls in shared floor plan document state

### Out of Scope
- Auto wall recognition
- Room auto-detection
- Door/window editing
- Advanced snapping
- Real-world scale calibration
- Undo/redo

## Data Model Addition

```ts
type Point2D = {
  x: number;
  y: number;
};

type Wall = {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number;
  isLoadBearing: boolean;
};
```

## Implementation Tasks

1. Add editor mode selector: select / draw wall.
2. In draw wall mode, first click creates start point and second click creates end point.
3. Render walls as Konva lines with visible thickness.
4. Add wall selection behavior.
5. Show endpoint handles for selected wall.
6. Allow endpoint drag editing.
7. Add delete selected wall action.
8. Add inspector controls for wall thickness and load-bearing flag.
9. Show rough length label.
10. Add basic unit tests for wall creation, update, delete.

## UX Requirements

- Drawing a wall should require minimal explanation.
- Selected walls should be visually obvious.
- Endpoint handles should be easy to grab.
- The user should always know which mode they are in.

## Acceptance Criteria

- User can draw multiple wall lines over a floor plan image.
- User can select a wall.
- User can move wall endpoints.
- User can delete a selected wall.
- User can change wall thickness.
- User can mark a wall as load-bearing.
- Wall data is stored in shared state.

## Verification Commands

```bash
npm run typecheck
npm run test
npm run build
```

## Manual Verification

1. Upload a floor plan.
2. Enter draw wall mode.
3. Trace at least five wall segments.
4. Select one wall.
5. Move its endpoint.
6. Mark it load-bearing.
7. Delete one wall.
8. Confirm remaining walls persist in state during the session.

## async-dev Execution Note

This is the first feature that creates real product value. Keep the interaction simple. Do not add snapping until the basic flow is stable.
