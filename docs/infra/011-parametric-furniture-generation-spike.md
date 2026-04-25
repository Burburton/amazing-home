# 011 — Parametric Furniture Generation Spike

## Feature Name
Parametric Furniture Generation from User Dimensions

## Goal
Create a practical bridge toward user-imported furniture by generating simple dimension-constrained furniture models from category and size inputs.

## Product Context
The original PRD includes generating near-real 3D furniture from product images and dimension drawings. That is valuable but too complex for V1. A better intermediate step is parametric furniture generation.

## Scope

### In Scope
- User selects furniture category
- User inputs width, depth, height
- App generates simple 2D/3D furniture representation
- User can edit color/material label
- Furniture is saved as a custom asset

### Out of Scope
- Image-to-3D generation
- Dimension drawing OCR
- Product URL parsing
- Realistic mesh generation
- Manufacturing-grade accuracy

## Supported Categories
- Sofa
- Bed
- Dining table
- Chair
- Desk
- Cabinet
- Coffee table

## Implementation Tasks

1. Add custom furniture creation form.
2. Add category selector.
3. Add dimension inputs.
4. Add simple generated 2D representation.
5. Add simple generated 3D representation.
6. Add custom furniture asset library.
7. Allow placing generated furniture into project.
8. Add validation for dimensions.
9. Add tests for asset creation.

## Acceptance Criteria

- User can create custom furniture with dimensions.
- Custom furniture appears in the furniture library.
- User can place it into the layout.
- It appears in 2D and 3D preview.
- It can be saved with the project.

## Future Extension

After this spike, the app can evolve toward:

1. product image upload for visual reference
2. manual material/color matching
3. dimension drawing parsing
4. external image-to-3D API integration
5. GLB asset import/export

## async-dev Execution Note

This is the safest path toward the original furniture-generation vision. It avoids depending on unstable AI mesh quality too early.
