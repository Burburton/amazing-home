import { describe, it, expect, beforeEach } from 'vitest'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { createEmptyDocument, createDocumentWithImage, validateDocument, serializeDocument, deserializeDocument, addWallToDocument, getWallLength } from '@domain/floorplan/document'
import { SourceImage, Point2D, DOCUMENT_VERSION } from '@domain/floorplan/types'
import { sampleFloorPlanDocument } from '@domain/floorplan/fixtures/sample-document'

describe('FloorPlanDocument Model', () => {
  it('should create empty document', () => {
    const doc = createEmptyDocument('test-001', 'Test Project')
    expect(doc.version).toBe(DOCUMENT_VERSION)
    expect(doc.project.id).toBe('test-001')
    expect(doc.project.name).toBe('Test Project')
    expect(doc.walls).toEqual([])
    expect(doc.rooms).toEqual([])
    expect(doc.furniture).toEqual([])
    expect(doc.settings.ceilingHeight).toBe(2.8)
    expect(doc.settings.defaultWallThickness).toBe(10)
  })

  it('should create document with image', () => {
    const image: SourceImage = {
      id: 'img-001',
      name: 'test.png',
      objectUrl: 'blob:test',
      width: 800,
      height: 600,
      uploadedAt: '2026-04-25T00:00:00Z',
    }
    const doc = createDocumentWithImage('test-002', 'With Image', image)
    expect(doc.sourceImage).toEqual(image)
  })

  it('should validate document', () => {
    const doc = createEmptyDocument('test-003', 'Valid Doc')
    expect(validateDocument(doc)).toBe(true)
    expect(validateDocument(null)).toBe(false)
    expect(validateDocument({})).toBe(false)
    expect(validateDocument({ version: 'wrong' })).toBe(false)
  })

  it('should serialize and deserialize document', () => {
    const doc = createEmptyDocument('test-004', 'Serialize Test')
    const json = serializeDocument(doc)
    expect(json).toContain('"version": "1.0.0"')
    
    const restored = deserializeDocument(json)
    expect(restored).not.toBeNull()
    expect(restored!.project.id).toBe('test-004')
  })

  it('should return null for invalid JSON', () => {
    const result = deserializeDocument('not json')
    expect(result).toBeNull()
    
    const invalidDoc = JSON.stringify({ version: 'wrong' })
    expect(deserializeDocument(invalidDoc)).toBeNull()
  })

  it('should add wall to document', () => {
    const doc = createEmptyDocument('test-005', 'Wall Test')
    const start: Point2D = { x: 0, y: 0 }
    const end: Point2D = { x: 100, y: 0 }
    
    const updated = addWallToDocument(doc, start, end)
    expect(updated.walls.length).toBe(1)
    expect(updated.walls[0]!.start).toEqual(start)
    expect(updated.walls[0]!.end).toEqual(end)
    expect(updated.walls[0]!.thickness).toBe(10)
    expect(updated.project.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('should calculate wall length', () => {
    const wall = { id: 'w1', start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, thickness: 10, isLoadBearing: false }
    expect(getWallLength(wall)).toBe(100)
    
    const diagonal = { id: 'w2', start: { x: 0, y: 0 }, end: { x: 100, y: 100 }, thickness: 10, isLoadBearing: false }
    expect(getWallLength(diagonal)).toBeCloseTo(141.42, 1)
  })

  it('should load sample fixture', () => {
    expect(sampleFloorPlanDocument.version).toBe(DOCUMENT_VERSION)
    expect(sampleFloorPlanDocument.walls.length).toBe(4)
    expect(sampleFloorPlanDocument.rooms.length).toBe(1)
    expect(sampleFloorPlanDocument.furniture.length).toBe(2)
    expect(sampleFloorPlanDocument.project.name).toBe('Sample Apartment')
  })
})

describe('FloorPlan Store (Document-based)', () => {
  beforeEach(() => {
    useFloorPlanStore.setState({
      document: createEmptyDocument('test-project', 'Test'),
      workspace: { scale: 1, positionX: 0, positionY: 0 },
      selectedWallId: null,
      editorMode: 'select',
      error: null,
    })
  })

  it('should initialize with default document', () => {
    const state = useFloorPlanStore.getState()
    expect(state.document.version).toBe(DOCUMENT_VERSION)
    expect(state.document.walls).toEqual([])
    expect(state.workspace.scale).toBe(1)
    expect(state.error).toBeNull()
  })

  it('should create new project', () => {
    useFloorPlanStore.getState().createNewProject('new-001', 'New Project')
    const state = useFloorPlanStore.getState()
    expect(state.document.project.id).toBe('new-001')
    expect(state.document.project.name).toBe('New Project')
    expect(state.document.walls).toEqual([])
  })

  it('should load document', () => {
    useFloorPlanStore.getState().loadDocument(sampleFloorPlanDocument)
    const state = useFloorPlanStore.getState()
    expect(state.document.project.name).toBe('Sample Apartment')
    expect(state.document.walls.length).toBe(4)
  })

  it('should load from JSON', () => {
    const json = serializeDocument(sampleFloorPlanDocument)
    const success = useFloorPlanStore.getState().loadFromJson(json)
    expect(success).toBe(true)
    expect(useFloorPlanStore.getState().document.project.name).toBe('Sample Apartment')
  })

  it('should fail to load invalid JSON', () => {
    const success = useFloorPlanStore.getState().loadFromJson('invalid')
    expect(success).toBe(false)
    expect(useFloorPlanStore.getState().error).toBe('Failed to parse document')
  })

  it('should save to JSON', () => {
    useFloorPlanStore.getState().loadDocument(sampleFloorPlanDocument)
    const json = useFloorPlanStore.getState().saveToJson()
    expect(json).toContain('Sample Apartment')
    expect(json).toContain('"walls"')
  })

  it('should set source image', () => {
    const testImage: SourceImage = {
      id: 'test-001',
      name: 'test-floorplan.png',
      objectUrl: 'blob:test',
      width: 800,
      height: 600,
      uploadedAt: '2026-04-25T00:00:00Z',
    }
    
    useFloorPlanStore.getState().setSourceImage(testImage)
    
    const state = useFloorPlanStore.getState()
    expect(state.document.sourceImage).toEqual(testImage)
    expect(state.error).toBeNull()
  })

  it('should set workspace', () => {
    useFloorPlanStore.getState().setWorkspace({ scale: 2, positionX: 100, positionY: 50 })
    
    const state = useFloorPlanStore.getState()
    expect(state.workspace.scale).toBe(2)
    expect(state.workspace.positionX).toBe(100)
    expect(state.workspace.positionY).toBe(50)
  })

  it('should reset view', () => {
    useFloorPlanStore.getState().setWorkspace({ scale: 3, positionX: 200, positionY: 150 })
    useFloorPlanStore.getState().resetView()
    
    const state = useFloorPlanStore.getState()
    expect(state.workspace.scale).toBe(1)
    expect(state.workspace.positionX).toBe(0)
    expect(state.workspace.positionY).toBe(0)
  })

  it('should fit to screen', () => {
    const testImage: SourceImage = {
      id: 'test-001',
      name: 'test-floorplan.png',
      objectUrl: 'blob:test',
      width: 1000,
      height: 500,
      uploadedAt: '2026-04-25T00:00:00Z',
    }
    
    useFloorPlanStore.getState().setSourceImage(testImage)
    useFloorPlanStore.getState().fitToScreen(800, 400)
    
    const state = useFloorPlanStore.getState()
    expect(state.workspace.scale).toBeCloseTo(0.72, 1)
  })

  it('should clear image', () => {
    const testImage: SourceImage = {
      id: 'test-001',
      name: 'test-floorplan.png',
      objectUrl: 'blob:test',
      width: 800,
      height: 600,
      uploadedAt: '2026-04-25T00:00:00Z',
    }
    
    useFloorPlanStore.getState().setSourceImage(testImage)
    useFloorPlanStore.getState().setWorkspace({ scale: 2, positionX: 100, positionY: 50 })
    useFloorPlanStore.getState().setError('Some error')
    useFloorPlanStore.getState().clearImage()
    
    const state = useFloorPlanStore.getState()
    expect(state.document.sourceImage).toBeUndefined()
    expect(state.workspace.scale).toBe(1)
    expect(state.error).toBeNull()
    expect(state.document.walls).toEqual([])
  })
})

describe('Wall Operations (Document-based)', () => {
  beforeEach(() => {
    useFloorPlanStore.setState({
      document: createEmptyDocument('test-project', 'Test'),
      workspace: { scale: 1, positionX: 0, positionY: 0 },
      selectedWallId: null,
      editorMode: 'select',
      error: null,
    })
  })

  it('should add wall', () => {
    const start: Point2D = { x: 0, y: 0 }
    const end: Point2D = { x: 100, y: 100 }
    
    useFloorPlanStore.getState().addWall(start, end)
    
    const state = useFloorPlanStore.getState()
    expect(state.document.walls.length).toBe(1)
    const wall = state.document.walls[0]
    expect(wall).toBeDefined()
    expect(wall!.start).toEqual(start)
    expect(wall!.end).toEqual(end)
    expect(wall!.thickness).toBe(10)
    expect(wall!.isLoadBearing).toBe(false)
  })

  it('should add multiple walls', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 0 })
    useFloorPlanStore.getState().addWall({ x: 100, y: 0 }, { x: 100, y: 100 })
    
    expect(useFloorPlanStore.getState().document.walls.length).toBe(2)
  })

  it('should update wall', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 100 })
    const wallId = useFloorPlanStore.getState().document.walls[0]!.id
    
    useFloorPlanStore.getState().updateWall(wallId, { thickness: 20, isLoadBearing: true })
    
    const wall = useFloorPlanStore.getState().document.walls[0]
    expect(wall).toBeDefined()
    expect(wall!.thickness).toBe(20)
    expect(wall!.isLoadBearing).toBe(true)
  })

  it('should update wall endpoints', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 100 })
    const wallId = useFloorPlanStore.getState().document.walls[0]!.id
    
    useFloorPlanStore.getState().updateWall(wallId, { start: { x: 50, y: 50 } })
    
    const wall = useFloorPlanStore.getState().document.walls[0]
    expect(wall).toBeDefined()
    expect(wall!.start).toEqual({ x: 50, y: 50 })
    expect(wall!.end).toEqual({ x: 100, y: 100 })
  })

  it('should delete wall', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 100 })
    
    const wallsAfterAdd = useFloorPlanStore.getState().document.walls
    expect(wallsAfterAdd.length).toBe(1)
    
    const wall = wallsAfterAdd[0]
    expect(wall).toBeDefined()
    const wallId = wall!.id
    useFloorPlanStore.getState().deleteWall(wallId)
    
    expect(useFloorPlanStore.getState().document.walls.length).toBe(0)
  })

  it('should clear selected wall id when deleted', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 100 })
    const wallId = useFloorPlanStore.getState().document.walls[0]!.id
    
    useFloorPlanStore.getState().selectWall(wallId)
    expect(useFloorPlanStore.getState().selectedWallId).toBe(wallId)
    
    useFloorPlanStore.getState().deleteWall(wallId)
    expect(useFloorPlanStore.getState().selectedWallId).toBeNull()
  })

  it('should select wall', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 100 })
    const wallId = useFloorPlanStore.getState().document.walls[0]!.id
    
    useFloorPlanStore.getState().selectWall(wallId)
    expect(useFloorPlanStore.getState().selectedWallId).toBe(wallId)
    
    useFloorPlanStore.getState().selectWall(null)
    expect(useFloorPlanStore.getState().selectedWallId).toBeNull()
  })

  it('should set editor mode', () => {
    useFloorPlanStore.getState().setEditorMode('drawWall')
    expect(useFloorPlanStore.getState().editorMode).toBe('drawWall')
    
    useFloorPlanStore.getState().setEditorMode('select')
    expect(useFloorPlanStore.getState().editorMode).toBe('select')
  })

  it('should clear selection when entering draw mode', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 100 })
    const wallId = useFloorPlanStore.getState().document.walls[0]!.id
    useFloorPlanStore.getState().selectWall(wallId)
    
    useFloorPlanStore.getState().setEditorMode('drawWall')
    expect(useFloorPlanStore.getState().selectedWallId).toBeNull()
  })

  it('should update project settings', () => {
    useFloorPlanStore.getState().updateProjectSettings({ ceilingHeight: 3.5, defaultWallThickness: 15 })
    const state = useFloorPlanStore.getState()
    expect(state.document.settings.ceilingHeight).toBe(3.5)
    expect(state.document.settings.defaultWallThickness).toBe(15)
  })
})

describe('Undo/Redo Operations', () => {
  beforeEach(() => {
    useFloorPlanStore.setState({
      document: createEmptyDocument('test-project', 'Test'),
      workspace: { scale: 1, positionX: 0, positionY: 0 },
      selectedWallId: null,
      selectedFurnitureId: null,
      editorMode: 'select',
      pendingFurnitureCategory: null,
      error: null,
      history: { past: [], future: [] },
    })
  })

  it('should not allow undo initially', () => {
    expect(useFloorPlanStore.getState().canUndo()).toBe(false)
  })

  it('should not allow redo initially', () => {
    expect(useFloorPlanStore.getState().canRedo()).toBe(false)
  })

  it('should allow undo after adding wall', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 0 })
    expect(useFloorPlanStore.getState().canUndo()).toBe(true)
    expect(useFloorPlanStore.getState().canRedo()).toBe(false)
  })

  it('should undo wall addition', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 0 })
    expect(useFloorPlanStore.getState().document.walls.length).toBe(1)
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.walls.length).toBe(0)
    expect(useFloorPlanStore.getState().canUndo()).toBe(false)
    expect(useFloorPlanStore.getState().canRedo()).toBe(true)
  })

  it('should redo undone wall addition', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 0 })
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.walls.length).toBe(0)
    
    useFloorPlanStore.getState().redo()
    expect(useFloorPlanStore.getState().document.walls.length).toBe(1)
    expect(useFloorPlanStore.getState().canUndo()).toBe(true)
    expect(useFloorPlanStore.getState().canRedo()).toBe(false)
  })

  it('should allow undo after updating wall', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 0 })
    const wallId = useFloorPlanStore.getState().document.walls[0]!.id
    useFloorPlanStore.getState().updateWall(wallId, { thickness: 20 })
    
    expect(useFloorPlanStore.getState().canUndo()).toBe(true)
  })

  it('should undo wall update', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 0 })
    const wallId = useFloorPlanStore.getState().document.walls[0]!.id
    useFloorPlanStore.getState().updateWall(wallId, { thickness: 20 })
    expect(useFloorPlanStore.getState().document.walls[0]!.thickness).toBe(20)
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.walls[0]!.thickness).toBe(10)
  })

  it('should undo wall deletion', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 0 })
    const wallId = useFloorPlanStore.getState().document.walls[0]!.id
    useFloorPlanStore.getState().deleteWall(wallId)
    expect(useFloorPlanStore.getState().document.walls.length).toBe(0)
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.walls.length).toBe(1)
  })

  it('should allow undo after adding furniture', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    expect(useFloorPlanStore.getState().canUndo()).toBe(true)
  })

  it('should undo furniture addition', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    expect(useFloorPlanStore.getState().document.furniture.length).toBe(1)
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.furniture.length).toBe(0)
  })

  it('should undo furniture update', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    const furnitureId = useFloorPlanStore.getState().document.furniture[0]!.id
    useFloorPlanStore.getState().updateFurniture(furnitureId, { rotation: 90 })
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.furniture[0]!.rotation).toBe(0)
  })

  it('should undo furniture deletion', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    const furnitureId = useFloorPlanStore.getState().document.furniture[0]!.id
    useFloorPlanStore.getState().deleteFurniture(furnitureId)
    expect(useFloorPlanStore.getState().document.furniture.length).toBe(0)
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.furniture.length).toBe(1)
  })

  it('should clear future history on new action', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 0 })
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().canRedo()).toBe(true)
    
    // New action should clear future
    useFloorPlanStore.getState().addWall({ x: 200, y: 200 }, { x: 300, y: 300 })
    expect(useFloorPlanStore.getState().canRedo()).toBe(false)
  })

  it('should maintain multiple undo steps', () => {
    useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 0 })
    useFloorPlanStore.getState().addWall({ x: 100, y: 0 }, { x: 100, y: 100 })
    useFloorPlanStore.getState().addWall({ x: 100, y: 100 }, { x: 0, y: 100 })
    
    expect(useFloorPlanStore.getState().document.walls.length).toBe(3)
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.walls.length).toBe(2)
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.walls.length).toBe(1)
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.walls.length).toBe(0)
    
    expect(useFloorPlanStore.getState().canUndo()).toBe(false)
  })

  it('should undo source image change', () => {
    const testImage: SourceImage = {
      id: 'test-001',
      name: 'test-floorplan.png',
      objectUrl: 'blob:test',
      width: 800,
      height: 600,
      uploadedAt: '2026-04-25T00:00:00Z',
    }
    
    useFloorPlanStore.getState().setSourceImage(testImage)
    expect(useFloorPlanStore.getState().document.sourceImage).toBeDefined()
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.sourceImage).toBeUndefined()
  })

  it('should undo project settings change', () => {
    useFloorPlanStore.getState().updateProjectSettings({ ceilingHeight: 3.5 })
    expect(useFloorPlanStore.getState().document.settings.ceilingHeight).toBe(3.5)
    
    useFloorPlanStore.getState().undo()
    expect(useFloorPlanStore.getState().document.settings.ceilingHeight).toBe(2.8)
  })
})