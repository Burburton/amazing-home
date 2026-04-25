import { create } from 'zustand'
import {
  FloorPlanDocument,
  Wall,
  WorkspaceState,
  SourceImage,
  Point2D,
  EditorMode,
  FurnitureItem,
  FurnitureCategory,
  LayoutVersion,
  LayoutVersionSourceType,
  CustomFurnitureAsset,
} from '@domain/floorplan/types'
import {
  createEmptyDocument,
  addWallToDocument,
  updateWallInDocument,
  deleteWallFromDocument,
  updateSettings,
  addFurnitureToDocument,
  updateFurnitureInDocument,
  deleteFurnitureFromDocument,
  cloneDocument,
} from '@domain/floorplan/document'

const DEFAULT_WORKSPACE: WorkspaceState = {
  scale: 1,
  positionX: 0,
  positionY: 0,
}

const MAX_HISTORY = 50

export type ViewMode = '2d' | '3d'

interface HistoryState {
  past: FloorPlanDocument[]
  future: FloorPlanDocument[]
}

export interface FloorPlanState {
  document: FloorPlanDocument
  workspace: WorkspaceState
  selectedWallId: string | null
  selectedFurnitureId: string | null
  editorMode: EditorMode
  pendingFurnitureCategory: FurnitureCategory | null
  viewMode: ViewMode
  error: string | null
  history: HistoryState
  versions: LayoutVersion[]
  activeVersionId: string | null
  customFurnitureAssets: CustomFurnitureAsset[]
  pendingCustomFurnitureId: string | null

  // Document-level actions
  createNewProject: (projectId: string, projectName: string) => void
  loadDocument: (document: FloorPlanDocument) => void
  loadFromJson: (json: string) => boolean
  saveToJson: () => string

  // Source image
  setSourceImage: (image: SourceImage) => void
  clearImage: () => void

  // Workspace
  setWorkspace: (workspace: WorkspaceState) => void
  resetView: () => void
  fitToScreen: (canvasWidth: number, canvasHeight: number) => void

  // Wall operations
  addWall: (start: Point2D, end: Point2D) => void
  updateWall: (id: string, updates: Partial<Wall>) => void
  deleteWall: (id: string) => void
  selectWall: (id: string | null) => void

  // Furniture operations
  addFurniture: (category: FurnitureCategory, position: Point2D) => void
  addFurnitureAtPosition: (position: Point2D) => void
  updateFurniture: (id: string, updates: Partial<FurnitureItem>) => void
  deleteFurniture: (id: string) => void
  selectFurniture: (id: string | null) => void
  setPendingFurniture: (category: FurnitureCategory | null) => void

  // Editor mode
  setEditorMode: (mode: EditorMode) => void

  // View mode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void

  // Settings
  updateProjectSettings: (settings: Partial<FloorPlanDocument['settings']>) => void

  // Undo/Redo
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Error handling
  setError: (error: string | null) => void

  // Layout versions
  saveVersion: (name: string, sourceType: LayoutVersionSourceType, summary?: string) => void
  duplicateVersion: (versionId: string) => void
  switchVersion: (versionId: string) => void
  deleteVersion: (versionId: string) => void
  getActiveVersion: () => LayoutVersion | null

  // Custom furniture assets
  createCustomFurniture: (name: string, category: FurnitureCategory, width: number, height: number, elevation: number) => void
  deleteCustomFurniture: (assetId: string) => void
  setPendingCustomFurniture: (assetId: string | null) => void
  addCustomFurnitureAtPosition: (position: Point2D) => void
}

export const useFloorPlanStore = create<FloorPlanState>((set, get) => ({
  document: createEmptyDocument('default-project', 'Untitled Project'),
  workspace: DEFAULT_WORKSPACE,
  selectedWallId: null,
  selectedFurnitureId: null,
  editorMode: 'select',
  pendingFurnitureCategory: null,
  viewMode: '2d',
  error: null,
  history: { past: [], future: [] },
  versions: [],
  activeVersionId: null,
  customFurnitureAssets: [],
  pendingCustomFurnitureId: null,

  createNewProject: (projectId, projectName) => {
    set({
      document: createEmptyDocument(projectId, projectName),
      workspace: DEFAULT_WORKSPACE,
      selectedWallId: null,
      selectedFurnitureId: null,
      pendingFurnitureCategory: null,
      viewMode: '2d',
      error: null,
      history: { past: [], future: [] },
      versions: [],
      activeVersionId: null,
      customFurnitureAssets: [],
      pendingCustomFurnitureId: null,
    })
  },

  loadDocument: (document) => {
    set({
      document,
      workspace: DEFAULT_WORKSPACE,
      selectedWallId: null,
      selectedFurnitureId: null,
      pendingFurnitureCategory: null,
      viewMode: '2d',
      error: null,
      history: { past: [], future: [] },
    })
  },

  loadFromJson: (json) => {
    const { loadDocument, setError } = get()
    try {
      const parsed = JSON.parse(json)
      if (parsed.version !== '1.0.0') {
        setError('Invalid document version')
        return false
      }
      loadDocument(parsed)
      return true
    } catch {
      setError('Failed to parse document')
      return false
    }
  },

  saveToJson: () => {
    const { document } = get()
    return JSON.stringify(document, null, 2)
  },

  setSourceImage: (image) => {
    const { document, history } = get()
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    set({
      document: { ...document, sourceImage: image },
      history: { past: newPast, future: [] },
      error: null,
    })
  },

  clearImage: () => {
    const { document, history } = get()
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    set({
      document: { ...document, sourceImage: undefined, walls: [], furniture: [] },
      workspace: DEFAULT_WORKSPACE,
      selectedWallId: null,
      selectedFurnitureId: null,
      pendingFurnitureCategory: null,
      viewMode: '2d',
      error: null,
      history: { past: newPast, future: [] },
    })
  },

  setWorkspace: (workspace) => set({ workspace }),

  resetView: () => set({ workspace: DEFAULT_WORKSPACE }),

  fitToScreen: (canvasWidth, canvasHeight) => {
    const { document } = get()
    if (!document.sourceImage) return

    const scaleX = canvasWidth / document.sourceImage.width
    const scaleY = canvasHeight / document.sourceImage.height
    const scale = Math.min(scaleX, scaleY) * 0.9

    const positionX = (canvasWidth - document.sourceImage.width * scale) / 2
    const positionY = (canvasHeight - document.sourceImage.height * scale) / 2

    set({ workspace: { scale, positionX, positionY } })
  },

  addWall: (start, end) => {
    const { document, history } = get()
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    set({ 
      document: addWallToDocument(document, start, end),
      history: { past: newPast, future: [] },
    })
  },

  updateWall: (id, updates) => {
    const { document, history } = get()
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    set({ 
      document: updateWallInDocument(document, id, updates),
      history: { past: newPast, future: [] },
    })
  },

  deleteWall: (id) => {
    const { document, selectedWallId, history } = get()
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    set({
      document: deleteWallFromDocument(document, id),
      selectedWallId: selectedWallId === id ? null : selectedWallId,
      history: { past: newPast, future: [] },
    })
  },

  selectWall: (id) => set({ selectedWallId: id, selectedFurnitureId: null }),

  addFurniture: (category, position) => {
    const { document, history } = get()
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    set({ 
      document: addFurnitureToDocument(document, category, position),
      history: { past: newPast, future: [] },
    })
  },

  addFurnitureAtPosition: (position) => {
    const { document, pendingFurnitureCategory, history } = get()
    if (!pendingFurnitureCategory) return
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    set({
      document: addFurnitureToDocument(document, pendingFurnitureCategory, position),
      pendingFurnitureCategory: null,
      editorMode: 'select',
      history: { past: newPast, future: [] },
    })
  },

  setPendingFurniture: (category) => {
    set({
      pendingFurnitureCategory: category,
      editorMode: category ? 'placeFurniture' : 'select',
      selectedWallId: null,
      selectedFurnitureId: null,
    })
  },

  updateFurniture: (id, updates) => {
    const { document, history } = get()
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    set({ 
      document: updateFurnitureInDocument(document, id, updates),
      history: { past: newPast, future: [] },
    })
  },

  deleteFurniture: (id) => {
    const { document, selectedFurnitureId, history } = get()
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    set({
      document: deleteFurnitureFromDocument(document, id),
      selectedFurnitureId: selectedFurnitureId === id ? null : selectedFurnitureId,
      history: { past: newPast, future: [] },
    })
  },

  selectFurniture: (id) => set({ selectedFurnitureId: id, selectedWallId: null, pendingFurnitureCategory: null }),

  setEditorMode: (mode) => {
    const { selectedWallId, selectedFurnitureId } = get()
    set({
      editorMode: mode,
      selectedWallId: mode === 'drawWall' || mode === 'placeFurniture' ? null : selectedWallId,
      selectedFurnitureId: mode === 'drawWall' || mode === 'placeFurniture' ? null : selectedFurnitureId,
      pendingFurnitureCategory: mode !== 'placeFurniture' ? null : get().pendingFurnitureCategory,
    })
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleViewMode: () => {
    const { viewMode } = get()
    set({ viewMode: viewMode === '2d' ? '3d' : '2d' })
  },

  updateProjectSettings: (settings) => {
    const { document, history } = get()
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    set({ 
      document: updateSettings(document, settings),
      history: { past: newPast, future: [] },
    })
  },

  undo: () => {
    const { document, history } = get()
    if (history.past.length === 0) return
    
    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, -1)
    const newFuture = [cloneDocument(document), ...history.future]
    
    set({
      document: previous,
      history: { past: newPast, future: newFuture.slice(0, MAX_HISTORY) },
      selectedWallId: null,
      selectedFurnitureId: null,
    })
  },

  redo: () => {
    const { document, history } = get()
    if (history.future.length === 0) return
    
    const next = history.future[0]
    const newFuture = history.future.slice(1)
    const newPast = [...history.past, cloneDocument(document)]
    
    set({
      document: next,
      history: { past: newPast.slice(-MAX_HISTORY), future: newFuture },
      selectedWallId: null,
      selectedFurnitureId: null,
    })
  },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  setError: (error) => set({ error }),

  saveVersion: (name, sourceType, summary) => {
    const { document, versions } = get()
    const now = new Date().toISOString()
    const versionId = `version-${Date.now()}`
    
    const newVersion: LayoutVersion = {
      id: versionId,
      name,
      sourceType,
      summary,
      document: cloneDocument(document),
      createdAt: now,
      updatedAt: now,
    }
    
    set({
      versions: [...versions, newVersion],
      activeVersionId: versionId,
    })
  },

  duplicateVersion: (versionId) => {
    const { versions } = get()
    const sourceVersion = versions.find(v => v.id === versionId)
    if (!sourceVersion) return
    
    const now = new Date().toISOString()
    const newVersionId = `version-${Date.now()}`
    
    const newVersion: LayoutVersion = {
      id: newVersionId,
      name: `${sourceVersion.name} (copy)`,
      sourceType: 'manual',
      document: cloneDocument(sourceVersion.document),
      createdAt: now,
      updatedAt: now,
    }
    
    set({
      versions: [...versions, newVersion],
    })
  },

  switchVersion: (versionId) => {
    const { versions } = get()
    const version = versions.find(v => v.id === versionId)
    if (!version) return
    
    set({
      document: cloneDocument(version.document),
      activeVersionId: versionId,
      selectedWallId: null,
      selectedFurnitureId: null,
      history: { past: [], future: [] },
    })
  },

  deleteVersion: (versionId) => {
    const { versions, activeVersionId } = get()
    const newVersions = versions.filter(v => v.id !== versionId)
    
    set({
      versions: newVersions,
      activeVersionId: activeVersionId === versionId ? null : activeVersionId,
    })
  },

  getActiveVersion: () => {
    const { versions, activeVersionId } = get()
    if (!activeVersionId) return null
    return versions.find(v => v.id === activeVersionId) || null
  },

  createCustomFurniture: (name, category, width, height, elevation) => {
    const { customFurnitureAssets } = get()
    const assetId = `custom-${Date.now()}`
    const newAsset: CustomFurnitureAsset = {
      id: assetId,
      name,
      category,
      customWidth: width,
      customHeight: height,
      customElevation: elevation,
      createdAt: new Date().toISOString(),
    }
    set({
      customFurnitureAssets: [...customFurnitureAssets, newAsset],
    })
  },

  deleteCustomFurniture: (assetId) => {
    const { customFurnitureAssets, pendingCustomFurnitureId } = get()
    set({
      customFurnitureAssets: customFurnitureAssets.filter(a => a.id !== assetId),
      pendingCustomFurnitureId: pendingCustomFurnitureId === assetId ? null : pendingCustomFurnitureId,
    })
  },

  setPendingCustomFurniture: (assetId) => {
    set({
      pendingCustomFurnitureId: assetId,
      editorMode: assetId ? 'placeFurniture' : 'select',
      pendingFurnitureCategory: null,
      selectedWallId: null,
      selectedFurnitureId: null,
    })
  },

  addCustomFurnitureAtPosition: (position) => {
    const { document, pendingCustomFurnitureId, customFurnitureAssets, history } = get()
    if (!pendingCustomFurnitureId) return
    
    const asset = customFurnitureAssets.find(a => a.id === pendingCustomFurnitureId)
    if (!asset) return
    
    const newPast = [...history.past, cloneDocument(document)].slice(-MAX_HISTORY)
    
    const newFurnitureItem: FurnitureItem = {
      id: `furniture-${Date.now()}`,
      category: asset.category,
      name: asset.name,
      position,
      rotation: 0,
      width: asset.customWidth,
      height: asset.customHeight,
      elevation: asset.customElevation,
    }
    
    set({
      document: {
        ...document,
        furniture: [...document.furniture, newFurnitureItem],
        project: {
          ...document.project,
          updatedAt: new Date().toISOString(),
        },
      },
      history: { past: newPast, future: [] },
      pendingCustomFurnitureId: null,
      editorMode: 'select',
    })
  },
}))