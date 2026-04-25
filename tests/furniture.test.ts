import { describe, it, expect, beforeEach } from 'vitest'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { createEmptyDocument } from '@domain/floorplan/document'
import { FURNITURE_CATALOG, getCatalogEntry, getCatalogCategories } from '@domain/floorplan/furniture-catalog'
import { FurnitureCategory } from '@domain/floorplan/types'

describe('Furniture Catalog', () => {
  it('should have 7 furniture categories', () => {
    expect(FURNITURE_CATALOG.length).toBe(7)
  })

  it('should have correct catalog entries', () => {
    const sofa = getCatalogEntry('sofa')
    expect(sofa).toBeDefined()
    expect(sofa!.name).toBe('Sofa')
    expect(sofa!.defaultWidth).toBe(180)
    expect(sofa!.defaultHeight).toBe(80)
    expect(sofa!.icon).toBe('🛋️')
  })

  it('should return undefined for unknown category', () => {
    const unknown = getCatalogEntry('unknown' as FurnitureCategory)
    expect(unknown).toBeUndefined()
  })

  it('should return all categories', () => {
    const categories = getCatalogCategories()
    expect(categories.length).toBe(7)
    expect(categories).toContain('sofa')
    expect(categories).toContain('bed')
    expect(categories).toContain('dining_table')
    expect(categories).toContain('chair')
    expect(categories).toContain('desk')
    expect(categories).toContain('cabinet')
    expect(categories).toContain('coffee_table')
  })

  it('should have reasonable default dimensions', () => {
    for (const entry of FURNITURE_CATALOG) {
      expect(entry.defaultWidth).toBeGreaterThan(0)
      expect(entry.defaultHeight).toBeGreaterThan(0)
      expect(entry.defaultElevation).toBeGreaterThan(0)
    }
  })
})

describe('Furniture Store Operations', () => {
  beforeEach(() => {
    useFloorPlanStore.setState({
      document: createEmptyDocument('test-project', 'Test'),
      workspace: { scale: 1, positionX: 0, positionY: 0 },
      selectedWallId: null,
      selectedFurnitureId: null,
      viewMode: '2d',
      editorMode: 'select',
      error: null,
    })
  })

  it('should add furniture from catalog', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    
    const state = useFloorPlanStore.getState()
    expect(state.document.furniture.length).toBe(1)
    const item = state.document.furniture[0]
    expect(item).toBeDefined()
    expect(item!.category).toBe('sofa')
    expect(item!.name).toBe('Sofa')
    expect(item!.width).toBe(180)
    expect(item!.height).toBe(80)
    expect(item!.position).toEqual({ x: 100, y: 100 })
  })

  it('should add multiple furniture items', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    useFloorPlanStore.getState().addFurniture('chair', { x: 200, y: 200 })
    
    const state = useFloorPlanStore.getState()
    expect(state.document.furniture.length).toBe(2)
    expect(state.document.furniture[0]!.category).toBe('sofa')
    expect(state.document.furniture[1]!.category).toBe('chair')
  })

  it('should select furniture', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    const furnitureId = useFloorPlanStore.getState().document.furniture[0]!.id
    
    useFloorPlanStore.getState().selectFurniture(furnitureId)
    expect(useFloorPlanStore.getState().selectedFurnitureId).toBe(furnitureId)
    expect(useFloorPlanStore.getState().selectedWallId).toBeNull()
    
    useFloorPlanStore.getState().selectFurniture(null)
    expect(useFloorPlanStore.getState().selectedFurnitureId).toBeNull()
  })

  it('should delete furniture', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    const furnitureId = useFloorPlanStore.getState().document.furniture[0]!.id
    
    useFloorPlanStore.getState().deleteFurniture(furnitureId)
    expect(useFloorPlanStore.getState().document.furniture.length).toBe(0)
  })

  it('should clear selected furniture when deleted', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    const furnitureId = useFloorPlanStore.getState().document.furniture[0]!.id
    
    useFloorPlanStore.getState().selectFurniture(furnitureId)
    expect(useFloorPlanStore.getState().selectedFurnitureId).toBe(furnitureId)
    
    useFloorPlanStore.getState().deleteFurniture(furnitureId)
    expect(useFloorPlanStore.getState().selectedFurnitureId).toBeNull()
  })

  it('should update furniture position', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    const furnitureId = useFloorPlanStore.getState().document.furniture[0]!.id
    
    useFloorPlanStore.getState().updateFurniture(furnitureId, { position: { x: 300, y: 300 } })
    
    const item = useFloorPlanStore.getState().document.furniture[0]
    expect(item!.position).toEqual({ x: 300, y: 300 })
  })

  it('should update furniture dimensions', () => {
    useFloorPlanStore.getState().addFurniture('sofa', { x: 100, y: 100 })
    const furnitureId = useFloorPlanStore.getState().document.furniture[0]!.id
    
    useFloorPlanStore.getState().updateFurniture(furnitureId, { width: 200, height: 90 })
    
    const item = useFloorPlanStore.getState().document.furniture[0]
    expect(item!.width).toBe(200)
    expect(item!.height).toBe(90)
  })
})