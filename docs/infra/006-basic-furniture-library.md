# 006 — Basic Furniture Library

## Feature Name
Basic Furniture Library

## Goal
Provide a small library of basic furniture types that users can place into the floor plan and later preview in 3D.

## Product Context
Furniture placement is the first step toward furnishing design. V1 should use simple parametric placeholder furniture instead of AI-generated furniture assets.

## Scope

### In Scope
- Add furniture catalog panel
- Include basic categories: sofa, bed, dining table, chair, desk, cabinet, coffee table
- Define default dimensions for each category
- Define simple 2D representation
- Define simple 3D representation metadata
- Allow adding furniture item to project state

### Out of Scope
- Real furniture product import
- Image-to-3D generation
- Textured GLB models
- Product links
- Furniture recommendations

## Data Model Addition

```ts
type FurnitureCategory =
  | 'sofa'
  | 'bed'
  | 'dining_table'
  | 'chair'
  | 'desk'
  | 'cabinet'
  | 'coffee_table';

type FurnitureItem = {
  id: string;
  category: FurnitureCategory;
  name: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  rotation: number;
};
```

## Implementation Tasks

1. Create furniture domain types.
2. Create default furniture catalog.
3. Add furniture library sidebar/panel.
4. Add action to insert furniture at center of current view.
5. Render furniture item in 2D editor as simple rectangle/icon.
6. Prepare 3D metadata for each category.
7. Add tests for furniture creation and catalog definitions.

## Acceptance Criteria

- User can see a basic furniture library.
- User can add at least seven furniture categories.
- Added furniture appears in the 2D editor.
- Furniture item is stored in `FloorPlanDocument`.
- Default dimensions are reasonable and editable later.

## Verification Commands

```bash
npm run typecheck
npm run test
npm run build
```

## async-dev Execution Note

This feature should stay simple. The goal is to create structured furniture data, not beautiful models.
