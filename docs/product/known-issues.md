# Known Issues

**Product**: amazing-home
**Version**: V1 MVP
**Date**: 2026-04-25

---

## Summary

| Severity | Count |
|----------|-------|
| Blockers | 0 |
| Major | 2 |
| Minor | 2 |
| Fixed | 4 |

**Release Status**: ✅ Demo-ready (no blockers)

---

## Blockers

None.

---

## Major Issues

### 1. Bundle Size > 1MB

**Description**: Production build is 1,378KB due to Three.js inclusion

**Impact**: Slow initial load for users

**Workaround**: Acceptable for demo; gzip size is 392KB

**Fix Plan**: V1.5 - Code-split Three.js, lazy load 3D preview

**Priority**: High

---

### 2. ~~No Undo/Redo~~ ✅ FIXED

**Description**: Wall and furniture operations cannot be undone

**Impact**: ~~User mistakes require manual correction or clearing~~

**Fix**: Added Zustand history state with undo/redo actions, UI buttons, and keyboard shortcuts (Ctrl+Z, Ctrl+Y)

**Date Fixed**: 2026-04-25

---

### 3. No Room Detection

**Description**: Closed wall loops are not detected as rooms

**Impact**: Users cannot see room boundaries or assign room names

**Workaround**: Manual wall tracing for room boundaries

**Fix Plan**: V2 - Algorithm to detect closed polygons

**Priority**: Medium (feature gap, not bug)

---

## Minor Issues

### 4. ~~Furniture Spawns at Center~~ ✅ FIXED

**Description**: ~~Clicking furniture catalog adds item at canvas center, not click point~~

**Fix**: Added click-to-place mode (EditorMode: 'placeFurniture') - click catalog item enters placement mode, click canvas to place furniture at that position

**Date Fixed**: 2026-04-25

---

### 5. No Grid Snapping

**Description**: Walls and furniture don't snap to grid lines

**Impact**: Manual alignment required for precise layouts

**Workaround**: Use visual alignment

**Fix Plan**: V1.5 - Optional grid overlay with snapping

**Priority**: Low

---

### 6. Konva Type Workarounds

**Description**: ESLint disabled for Konva Stage ref type issues

**Impact**: Reduced type safety in editor components

**Workaround**: Acceptable (third-party library limitation)

**Fix Plan**: None (upstream issue)

**Priority**: Low

---

### 7. ~~No Keyboard Shortcuts~~ ✅ FIXED

**Description**: ~~No hotkeys for common actions (save, undo, mode switch)~~

**Fix**: Added keyboard shortcuts:
- Ctrl+Z: Undo
- Ctrl+Shift+Z / Ctrl+Y: Redo
- Ctrl+S: Save to browser storage

**Date Fixed**: 2026-04-25

---

### 8. ~~No Loading States~~ ✅ FIXED

**Description**: ~~No visual feedback during image upload or 3D render~~

**Fix**: Added loading overlay with spinner for image upload. Shows "Loading image..." text during file processing and Konva image loading.

**Date Fixed**: 2026-04-25

---

## Triaged Issues

### Reported During Development

| Issue | Status | Resolution |
|-------|--------|------------|
| Happy-dom ESM compatibility | ✅ Fixed | Switch from jsdom |
| React-Konva peer deps | ✅ Fixed | --legacy-peer-deps |
| Node engine warning | ⚠️ Accepted | v20.13 vs v20.19 |

---

## Issue Reporting

Found a bug? Create issue at GitHub repository with:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser version
5. Screenshots if applicable

---

## Issue Tracking

Issues are tracked in:
- [docs/dogfooding/v1-dogfooding-report.md](docs/dogfooding/v1-dogfooding-report.md) - Development findings
- [docs/product/v1-release-checklist.md](docs/product/v1-release-checklist.md) - Release readiness

---

**Last Updated**: 2026-04-25