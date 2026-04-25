export interface Point2D {
  x: number
  y: number
}

export interface ProjectMeta {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ProjectSettings {
  ceilingHeight: number
  defaultWallThickness: number
  unit: 'px' | 'm'
}

export interface SourceImage {
  id: string
  name: string
  objectUrl: string
  width: number
  height: number
  uploadedAt: string
}

export interface Wall {
  id: string
  start: Point2D
  end: Point2D
  thickness: number
  isLoadBearing: boolean
}

export interface Room {
  id: string
  name: string
  wallIds: string[]
  floorMaterial?: string
}

export type FurnitureCategory =
  | 'sofa'
  | 'bed'
  | 'dining_table'
  | 'chair'
  | 'desk'
  | 'cabinet'
  | 'coffee_table'

export interface FurnitureItem {
  id: string
  category: FurnitureCategory
  name: string
  position: Point2D
  rotation: number
  width: number
  height: number
  elevation: number
}

export interface FurnitureCatalogEntry {
  category: FurnitureCategory
  name: string
  defaultWidth: number
  defaultHeight: number
  defaultElevation: number
  icon: string
}

export interface FloorPlanDocument {
  version: string
  project: ProjectMeta
  sourceImage?: SourceImage
  scale?: ScaleCalibration
  walls: Wall[]
  rooms: Room[]
  doors: Door[]
  windows: Window[]
  furniture: FurnitureItem[]
  settings: ProjectSettings
}

export interface ScaleCalibration {
  pixelsPerUnit: number
  unit: 'px' | 'm' | 'ft'
}

export interface Door {
  id: string
  wallId: string
  position: number
  width: number
  height: number
}

export interface Window {
  id: string
  wallId: string
  position: number
  width: number
  height: number
}

export interface WorkspaceState {
  scale: number
  positionX: number
  positionY: number
}

export type EditorMode = 'select' | 'drawWall' | 'placeFurniture'

export const DOCUMENT_VERSION = '1.0.0'

export const DEFAULT_SETTINGS: ProjectSettings = {
  ceilingHeight: 2.8,
  defaultWallThickness: 10,
  unit: 'px',
}