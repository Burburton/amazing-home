# 005 — Basic 3D Shell Preview

## Feature Name
Generate Basic 3D Shell from Wall Lines

## Goal
Convert traced 2D wall lines into a simple 3D preview with walls, floor plane, camera controls, and height settings.

## Product Context
This is the main moment where the product becomes visually valuable. Users should see their traced floor plan become a navigable 3D space.

## Scope

### In Scope
- Add React Three Fiber canvas
- Generate wall meshes from 2D wall lines
- Use ceiling height setting for wall height
- Generate simple floor plane bounding the traced area
- Add orbit controls
- Toggle between 2D editor and 3D preview
- Update 3D preview when walls change

### Out of Scope
- Roof/ceiling rendering
- Room-specific floors
- Doors/windows cutouts
- Advanced lighting/materials
- Photorealistic rendering
- Walkthrough first-person mode

## Recommended Libraries
- Three.js
- React Three Fiber
- Drei

## Geometry Strategy

For each wall line:

1. Convert 2D start/end points into XZ coordinates.
2. Compute wall direction vector.
3. Compute wall length.
4. Create a box mesh with:
   - width = wall length
   - depth = wall thickness
   - height = ceiling height
5. Rotate and position the mesh along the original 2D segment.

## Implementation Tasks

1. Install React Three Fiber and Drei.
2. Create `Preview3D` component.
3. Add wall-to-mesh conversion utility.
4. Render walls as simple box meshes.
5. Render floor plane based on bounding box of all walls.
6. Add camera, lighting, and orbit controls.
7. Add 2D/3D view toggle.
8. Add ceiling height control in inspector/settings.
9. Add tests for wall geometry conversion math.
10. Add sample project demo.

## Acceptance Criteria

- User can switch from 2D editor to 3D preview.
- Traced walls appear as 3D walls.
- Wall height reflects ceiling height setting.
- Wall thickness is visible.
- Camera can orbit around the model.
- 3D preview updates after wall edits.
- Build passes.

## Verification Commands

```bash
npm run typecheck
npm run test
npm run build
```

## Manual Verification

1. Upload a floor plan.
2. Draw several connected walls.
3. Switch to 3D preview.
4. Confirm walls appear in expected positions.
5. Change ceiling height.
6. Confirm walls update.
7. Orbit camera around the model.

## async-dev Execution Note

This feature should produce visual evidence: one screenshot of traced 2D walls and one screenshot of corresponding 3D walls.
