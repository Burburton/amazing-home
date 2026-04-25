# 004 — Floor Plan Document Model

## Feature Name
Shared FloorPlanDocument Model

## Goal
Introduce a single structured document model that stores project metadata, source image metadata, walls, rooms, furniture, and settings.

## Product Context
The app needs one canonical data model shared by the 2D editor, 3D preview, save/load workflow, and future AI features. Without this, the app will drift into inconsistent editor state and preview state.

## Scope

### In Scope
- Define `FloorPlanDocument`
- Add project metadata
- Add global settings such as ceiling height and default wall height
- Add room placeholder model
- Add furniture placeholder model
- Add import/export JSON helpers
- Add sample document fixture

### Out of Scope
- Persistent cloud backend
- Full project list
- Advanced schema migration
- AI-generated layout versions

## Proposed Model

```ts
type FloorPlanDocument = {
  version: string;
  project: ProjectMeta;
  sourceImage?: SourceImage;
  walls: Wall[];
  rooms: Room[];
  furniture: FurnitureItem[];
  settings: ProjectSettings;
};

type ProjectMeta = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type ProjectSettings = {
  ceilingHeight: number;
  defaultWallThickness: number;
  unit: 'px' | 'm';
};
```

## Implementation Tasks

1. Create `src/domain/floorplan/types.ts`.
2. Move existing image and wall types into domain types.
3. Create document factory function.
4. Create document validation helper.
5. Add JSON serialize/deserialize helpers.
6. Add sample floor plan document under `public/samples` or `src/domain/floorplan/fixtures`.
7. Refactor editor state to use `FloorPlanDocument`.
8. Add tests for creation, serialization, deserialization, and validation.

## Acceptance Criteria

- App has a clear canonical `FloorPlanDocument` type.
- Existing wall tracing feature uses this model.
- Source image metadata is part of the model.
- Settings include ceiling height and default wall thickness.
- JSON export/import helpers work in tests.
- Sample document can be loaded in development.

## Verification Commands

```bash
npm run typecheck
npm run test
npm run build
```

## async-dev Execution Note

This feature is architecture-critical. Avoid overengineering, but make the model stable enough for 3D preview and furniture placement.
