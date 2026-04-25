# V1 Demo Script

**Product**: amazing-home
**Version**: V1 MVP
**Audience**: Stakeholders, potential users

---

## Setup (2 minutes)

```bash
# Clone repository
git clone https://github.com/user/amazing-home.git
cd amazing-home

# Install dependencies
npm install

# Start development server
npm run dev
```

Open browser to `http://localhost:5173`

---

## Demo Flow (10-15 minutes)

### 1. Introduction (1 min)

**Show**: Initial app state with empty workspace

**Narrate**: 
> "Amazing Home is a floor plan layout visualization tool. You can trace walls from a floor plan image, place furniture, and see a 3D preview of your space."

---

### 2. Upload Floor Plan (2 min)

**Action**: Click "Upload" button or drag image to canvas

**Narrate**:
> "First, upload your floor plan image. The app accepts JPG and PNG files up to 10MB."

**Show**:
- Floor plan image appears on canvas
- Pan/zoom controls work (scroll to zoom, drag to pan)
- Toolbar shows Fit, Reset, Clear options

**Verification**: Image scales correctly, toolbar buttons work

---

### 3. Trace Walls (3 min)

**Action**: 
1. Click "Draw Wall" mode button
2. Click start point on wall line
3. Click end point to complete wall
4. Repeat for 4-5 walls forming a room

**Narrate**:
> "Switch to Draw Wall mode. Click to set the start point, then click again to set the end point. Each click creates a wall segment."

**Show**:
- Walls appear as dark gray lines
- Wall thickness visible
- Click back to "Select" mode
- Click a wall to select it
- Endpoint handles appear
- Drag handles to adjust wall

**Verification**: Walls render correctly, selection works, handles draggable

---

### 4. Set Ceiling Height (1 min)

**Action**: 
1. Open right panel "Project Settings"
2. Adjust Ceiling Height slider (default 2.8m)

**Narrate**:
> "Set the ceiling height for the 3D preview. This determines how tall your walls appear."

**Verification**: Setting persists in document

---

### 5. 3D Preview (2 min)

**Action**: Click "3D Preview" toggle button

**Narrate**:
> "Switch to 3D view to see your traced walls as a three-dimensional space."

**Show**:
- Walls appear as 3D boxes
- Orbit controls (drag to rotate, scroll to zoom)
- Floor plane visible
- Walls at correct height

**Verification**: 3D renders correctly, orbit works

---

### 6. Add Furniture (2 min)

**Action**:
1. Switch back to "2D Editor"
2. Click furniture type in left panel (e.g., Sofa)
3. Furniture appears at center
4. Click to select furniture
5. Drag to move
6. Use Inspector to adjust rotation, size

**Narrate**:
> "Add furniture from the catalog. Select an item to move it, resize it, or rotate it."

**Show**:
- Furniture appears as green rectangles in 2D
- Colored boxes in 3D
- Inspector shows position, size, rotation controls
- Delete button removes furniture

**Verification**: Furniture spawns, draggable, updates in 3D

---

### 7. Save Project (1 min)

**Action**: Click "Save" button in header

**Narrate**:
> "Save your project to browser storage. It will persist across sessions."

**Show**: No visual feedback (localStorage is silent)

**Verification**: Open browser DevTools → Application → Local Storage → see "amazing-home-project"

---

### 8. Export JSON (1 min)

**Action**: Click "Export" button in header

**Narrate**:
> "Export your project as a JSON file. You can share this with others or archive it."

**Show**: JSON file downloads to computer

**Verification**: Open JSON file, see FloorPlanDocument structure

---

### 9. Import JSON (1 min)

**Action**:
1. Click "Clear" to reset canvas
2. Click "Import" button
3. Select previously exported JSON file

**Narrate**:
> "Import a saved project. The app validates the file and restores your layout."

**Show**: Project restores with walls and furniture

**Verification**: All walls/furniture appear correctly

---

### 10. Load Saved (1 min)

**Action**:
1. Refresh browser page (F5)
2. Click "Load" button

**Narrate**:
> "Reload your browser and load the saved project from storage."

**Show**: Project restores instantly

**Verification**: Same state as before refresh

---

## Demo Summary

**Features Demonstrated**:
- ✅ Floor plan image upload
- ✅ Wall tracing and editing
- ✅ 3D preview visualization
- ✅ Furniture catalog and placement
- ✅ Project persistence (localStorage)
- ✅ JSON export/import

**Time**: ~12 minutes

---

## Backup Demo Points

If time permits, also show:

| Feature | Action |
|---------|--------|
| Wall thickness | Select wall → adjust in Inspector |
| Load-bearing toggle | Select wall → toggle checkbox |
| Default wall thickness | Project Settings → adjust |
| Multiple furniture | Add sofa, bed, chair, table |
| Furniture rotation | Inspector → set rotation to 45° |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Image won't load | Check file type (JPG/PNG), size < 10MB |
| Walls not drawing | Ensure "Draw Wall" mode active |
| 3D not rendering | Check console for errors |
| Import fails | Validate JSON structure |
| Save not persisting | Check localStorage enabled |

---

## Demo Assets

Recommended demo images:
- Simple floor plan with clear walls (800x600px)
- Hand-drawn sketch with visible lines
- Blueprint scan with room outlines

---

**End of Demo Script**