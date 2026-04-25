# 009 — Dogfooding Review and Release Readiness

## Feature Name
Dogfooding Review and V1 Release Readiness

## Goal
Use `amazing-async-dev` to review the full V1 development process, verify the app end-to-end, identify usability issues, and prepare a stable demo release.

## Product Context
This product is not only a home layout app; it is also a real-world validation target for `amazing-async-dev`. This feature ensures the development loop itself produces useful evidence and improvement feedback.

## Scope

### In Scope
- End-to-end demo script
- Manual QA checklist
- Known issues list
- Usability review
- Technical debt list
- async-dev dogfooding report
- V1 release checklist
- README improvement
- Demo screenshots

### Out of Scope
- New product features
- Major refactors
- AI features
- Backend implementation

## Implementation Tasks

1. Create `docs/dogfooding/v1-dogfooding-report.md`.
2. Create `docs/product/v1-demo-script.md`.
3. Create `docs/product/v1-release-checklist.md`.
4. Run full user journey manually.
5. Capture screenshots for each major step.
6. Record bugs and UX friction.
7. Classify issues as blocker / major / minor.
8. Update README with demo instructions.
9. Confirm deployment readiness.

## End-to-End Demo Flow

1. Open app.
2. Upload floor plan image.
3. Trace walls.
4. Set ceiling height.
5. Generate 3D preview.
6. Add furniture.
7. Move and rotate furniture.
8. Save project.
9. Export JSON.
10. Export 2D screenshot.
11. Export 3D screenshot.

## Acceptance Criteria

- Demo script exists.
- Release checklist exists.
- Dogfooding report exists.
- Known issues are categorized.
- README includes setup and demo instructions.
- V1 can be demonstrated from a clean checkout.
- No blocker issues remain for demo release.

## Verification Commands

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run dev
```

## async-dev Execution Note

This is a review and stabilization feature, not a feature-building sprint. The output should make it easy to decide whether to continue to V1.5 or start an AI feature spike.
