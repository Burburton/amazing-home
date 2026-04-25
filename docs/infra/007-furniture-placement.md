# 007 — Furniture Placement

## Feature Name
Furniture Placement and Editing

## Goal
Allow users to move, rotate, resize, and delete furniture items inside the 2D editor, with corresponding 3D preview rendering.

## Product Context
Furniture placement turns the product from a pure floor plan visualizer into a practical layout decision tool.

## Scope

### In Scope
- Select furniture item
- Drag furniture in 2D editor
- Rotate furniture
- Resize furniture dimensions through inspector
- Delete furniture item
- Render furniture as simple 3D boxes in preview
- Save furniture state in `FloorPlanDocument`

### Out of Scope
- Collision detection
- Automatic furniture placement
- Furniture style/material editing
- Real product import
- Advanced 3D furniture models

## Implementation Tasks

1. Add selection support for furniture items.
2. Add drag behavior in 2D editor.
3. Add rotation handle or inspector rotation input.
4. Add inspector controls for width, depth, height.
5. Add delete selected furniture action.
6. Render furniture in 3D preview as category-specific simple boxes.
7. Keep 2D and 3D furniture positions synchronized through shared state.
8. Add tests for furniture update, rotation, resizing, and deletion.

## UX Requirements

- Furniture should be easy to grab and move.
- Selected furniture should be visually distinct.
- Users should understand furniture orientation.
- Dimension editing should be simple and predictable.

## Acceptance Criteria

- User can add furniture from the catalog.
- User can move furniture in 2D.
- User can rotate furniture.
- User can change width/depth/height.
- User can delete furniture.
- Furniture appears in 3D preview.
- 3D furniture updates when 2D placement changes.

## Verification Commands

```bash
npm run typecheck
npm run test
npm run build
```

## Manual Verification

1. Add a sofa, bed, table, and chair.
2. Move each item around the floor plan.
3. Rotate at least one item.
4. Resize one item.
5. Switch to 3D preview.
6. Confirm furniture appears in approximately correct positions.
7. Delete one item.

## async-dev Execution Note

This feature should produce before/after screenshots showing a room with furniture in both 2D and 3D.
