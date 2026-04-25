import {
  FloorPlanDocument,
  ProjectMeta,
  ProjectSettings,
  SourceImage,
  Wall,
  Point2D,
  Room,
  FurnitureItem,
  FurnitureCategory,
  DOCUMENT_VERSION,
  DEFAULT_SETTINGS,
} from './types'
import { getCatalogEntry } from './furniture-catalog'

export function createProjectMeta(id: string, name: string): ProjectMeta {
  const now = new Date().toISOString()
  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
  }
}

export function createEmptyDocument(projectId: string, projectName: string): FloorPlanDocument {
  return {
    version: DOCUMENT_VERSION,
    project: createProjectMeta(projectId, projectName),
    walls: [],
    rooms: [],
    doors: [],
    windows: [],
    furniture: [],
    settings: DEFAULT_SETTINGS,
  }
}

export function createDocumentWithImage(
  projectId: string,
  projectName: string,
  sourceImage: SourceImage
): FloorPlanDocument {
  return {
    ...createEmptyDocument(projectId, projectName),
    sourceImage,
  }
}

export function addWallToDocument(
  document: FloorPlanDocument,
  start: Point2D,
  end: Point2D,
  thickness?: number,
  isLoadBearing?: boolean
): FloorPlanDocument {
  const wall: Wall = {
    id: `wall-${Date.now()}`,
    start,
    end,
    thickness: thickness ?? document.settings.defaultWallThickness,
    isLoadBearing: isLoadBearing ?? false,
  }
  return {
    ...document,
    walls: [...document.walls, wall],
    project: { ...document.project, updatedAt: new Date().toISOString() },
  }
}

export function updateWallInDocument(
  document: FloorPlanDocument,
  wallId: string,
  updates: Partial<Wall>
): FloorPlanDocument {
  return {
    ...document,
    walls: document.walls.map(w => w.id === wallId ? { ...w, ...updates } : w),
    project: { ...document.project, updatedAt: new Date().toISOString() },
  }
}

export function deleteWallFromDocument(
  document: FloorPlanDocument,
  wallId: string
): FloorPlanDocument {
  return {
    ...document,
    walls: document.walls.filter(w => w.id !== wallId),
    project: { ...document.project, updatedAt: new Date().toISOString() },
  }
}

export function validateDocument(document: unknown): document is FloorPlanDocument {
  if (!document || typeof document !== 'object') return false
  
  const doc = document as Record<string, unknown>
  
  if (doc.version !== DOCUMENT_VERSION) return false
  if (!doc.project || typeof doc.project !== 'object') return false
  if (!Array.isArray(doc.walls)) return false
  if (!Array.isArray(doc.rooms)) return false
  if (!doc.settings || typeof doc.settings !== 'object') return false
  
  return true
}

export function serializeDocument(document: FloorPlanDocument): string {
  return JSON.stringify(document, null, 2)
}

export function deserializeDocument(json: string): FloorPlanDocument | null {
  try {
    const parsed = JSON.parse(json)
    if (!validateDocument(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

export function cloneDocument(document: FloorPlanDocument): FloorPlanDocument {
  return JSON.parse(JSON.stringify(document))
}

export function updateSettings(
  document: FloorPlanDocument,
  settings: Partial<ProjectSettings>
): FloorPlanDocument {
  return {
    ...document,
    settings: { ...document.settings, ...settings },
    project: { ...document.project, updatedAt: new Date().toISOString() },
  }
}

export function addRoomToDocument(
  document: FloorPlanDocument,
  name: string,
  wallIds: string[]
): FloorPlanDocument {
  const room: Room = {
    id: `room-${Date.now()}`,
    name,
    wallIds,
  }
  return {
    ...document,
    rooms: [...document.rooms, room],
    project: { ...document.project, updatedAt: new Date().toISOString() },
  }
}

export function addFurnitureToDocument(
  document: FloorPlanDocument,
  category: FurnitureCategory,
  position: Point2D,
): FloorPlanDocument {
  const catalogEntry = getCatalogEntry(category)
  if (!catalogEntry) return document

  const item: FurnitureItem = {
    id: `furniture-${Date.now()}`,
    category,
    name: catalogEntry.name,
    position,
    rotation: 0,
    width: catalogEntry.defaultWidth,
    height: catalogEntry.defaultHeight,
    elevation: catalogEntry.defaultElevation,
  }
  return {
    ...document,
    furniture: [...document.furniture, item],
    project: { ...document.project, updatedAt: new Date().toISOString() },
  }
}

export function updateFurnitureInDocument(
  document: FloorPlanDocument,
  furnitureId: string,
  updates: Partial<FurnitureItem>
): FloorPlanDocument {
  return {
    ...document,
    furniture: document.furniture.map(f => f.id === furnitureId ? { ...f, ...updates } : f),
    project: { ...document.project, updatedAt: new Date().toISOString() },
  }
}

export function deleteFurnitureFromDocument(
  document: FloorPlanDocument,
  furnitureId: string
): FloorPlanDocument {
  return {
    ...document,
    furniture: document.furniture.filter(f => f.id !== furnitureId),
    project: { ...document.project, updatedAt: new Date().toISOString() },
  }
}

export function getWallLength(wall: Wall): number {
  return Math.sqrt(
    Math.pow(wall.end.x - wall.start.x, 2) +
    Math.pow(wall.end.y - wall.start.y, 2)
  )
}