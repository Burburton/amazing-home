import { describe, it, expect, beforeEach } from 'vitest'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { createEmptyDocument, serializeDocument, deserializeDocument, validateDocument } from '@domain/floorplan/document'

const STORAGE_KEY = 'amazing-home-project'

describe('Serialization and Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    useFloorPlanStore.setState({
      document: createEmptyDocument('test-project', 'Test Project'),
      workspace: { scale: 1, positionX: 0, positionY: 0 },
      selectedWallId: null,
      selectedFurnitureId: null,
      viewMode: '2d',
      editorMode: 'select',
      error: null,
    })
  })

  describe('JSON Serialization', () => {
    it('should serialize document to JSON', () => {
      const doc = createEmptyDocument('test-001', 'Serialize Test')
      const json = serializeDocument(doc)
      expect(json).toContain('"version": "1.0.0"')
      expect(json).toContain('Serialize Test')
    })

    it('should deserialize valid JSON', () => {
      const doc = createEmptyDocument('test-002', 'Deserialize Test')
      const json = serializeDocument(doc)
      const restored = deserializeDocument(json)
      expect(restored).not.toBeNull()
      expect(restored!.project.name).toBe('Deserialize Test')
    })

    it('should reject invalid JSON', () => {
      const result = deserializeDocument('not valid json')
      expect(result).toBeNull()
    })

    it('should reject wrong version', () => {
      const invalidDoc = JSON.stringify({ version: '0.0.1', project: { id: 'x', name: 'x', createdAt: '', updatedAt: '' }, walls: [], rooms: [], furniture: [], settings: {} })
      const result = deserializeDocument(invalidDoc)
      expect(result).toBeNull()
    })

    it('should validate correct document', () => {
      const doc = createEmptyDocument('test-003', 'Valid Doc')
      expect(validateDocument(doc)).toBe(true)
    })

    it('should reject null document', () => {
      expect(validateDocument(null)).toBe(false)
    })

    it('should reject empty object', () => {
      expect(validateDocument({})).toBe(false)
    })
  })

  describe('Store Save/Load', () => {
    it('should save to JSON via store', () => {
      useFloorPlanStore.getState().createNewProject('store-001', 'Store Test')
      const json = useFloorPlanStore.getState().saveToJson()
      expect(json).toContain('Store Test')
    })

    it('should load from valid JSON', () => {
      const doc = createEmptyDocument('load-001', 'Load Test')
      const json = serializeDocument(doc)
      const success = useFloorPlanStore.getState().loadFromJson(json)
      expect(success).toBe(true)
      expect(useFloorPlanStore.getState().document.project.name).toBe('Load Test')
    })

    it('should fail to load invalid JSON', () => {
      const success = useFloorPlanStore.getState().loadFromJson('invalid')
      expect(success).toBe(false)
      expect(useFloorPlanStore.getState().error).toBe('Failed to parse document')
    })

    it('should fail to load wrong version', () => {
      const invalidJson = JSON.stringify({ version: '0.5.0', project: {}, walls: [] })
      const success = useFloorPlanStore.getState().loadFromJson(invalidJson)
      expect(success).toBe(false)
      expect(useFloorPlanStore.getState().error).toBe('Invalid document version')
    })
  })

  describe('localStorage Persistence', () => {
    it('should save to localStorage', () => {
      useFloorPlanStore.getState().createNewProject('persist-001', 'Persist Test')
      const json = useFloorPlanStore.getState().saveToJson()
      localStorage.setItem(STORAGE_KEY, json)
      
      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).toContain('Persist Test')
    })

    it('should load from localStorage', () => {
      const doc = createEmptyDocument('persist-002', 'Load Persist')
      localStorage.setItem(STORAGE_KEY, serializeDocument(doc))
      
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const success = useFloorPlanStore.getState().loadFromJson(stored)
        expect(success).toBe(true)
        expect(useFloorPlanStore.getState().document.project.name).toBe('Load Persist')
      }
    })

    it('should handle missing localStorage data', () => {
      localStorage.removeItem(STORAGE_KEY)
      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).toBeNull()
    })
  })

  describe('Project Name Editing', () => {
    it('should update project name', () => {
      useFloorPlanStore.getState().createNewProject('name-001', 'Original Name')
      useFloorPlanStore.getState().loadDocument({
        ...useFloorPlanStore.getState().document,
        project: { ...useFloorPlanStore.getState().document.project, name: 'New Name' }
      })
      expect(useFloorPlanStore.getState().document.project.name).toBe('New Name')
    })

    it('should preserve other project data when renaming', () => {
      useFloorPlanStore.getState().createNewProject('name-002', 'Original')
      useFloorPlanStore.getState().addWall({ x: 0, y: 0 }, { x: 100, y: 100 })
      const wallCountBefore = useFloorPlanStore.getState().document.walls.length
      
      useFloorPlanStore.getState().loadDocument({
        ...useFloorPlanStore.getState().document,
        project: { ...useFloorPlanStore.getState().document.project, name: 'Renamed' }
      })
      
      expect(useFloorPlanStore.getState().document.project.name).toBe('Renamed')
      expect(useFloorPlanStore.getState().document.walls.length).toBe(wallCountBefore)
    })
  })
})