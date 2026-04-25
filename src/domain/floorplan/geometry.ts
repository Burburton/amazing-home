import { Wall } from '@domain/floorplan/types'

export interface WallMeshData {
  position: [number, number, number]
  rotation: [number, number, number]
  args: [number, number, number]
}

export interface BoundingBox {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export function wallToMeshData(wall: Wall, ceilingHeight: number): WallMeshData {
  const length = Math.sqrt(
    Math.pow(wall.end.x - wall.start.x, 2) +
    Math.pow(wall.end.y - wall.start.y, 2)
  )

  const centerX = (wall.start.x + wall.end.x) / 2
  const centerY = (wall.start.y + wall.end.y) / 2

  const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x)

  return {
    position: [centerX, ceilingHeight / 2, centerY],
    rotation: [0, -angle, 0],
    args: [length, ceilingHeight, wall.thickness],
  }
}

export function computeBoundingBox(walls: Wall[]): BoundingBox {
  if (walls.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const wall of walls) {
    minX = Math.min(minX, wall.start.x, wall.end.x)
    maxX = Math.max(maxX, wall.start.x, wall.end.x)
    minY = Math.min(minY, wall.start.y, wall.end.y)
    maxY = Math.max(maxY, wall.start.y, wall.end.y)
  }

  const width = maxX - minX
  const height = maxY - minY
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  return { minX, maxX, minY, maxY, width, height, centerX, centerY }
}

export function scaleToPixelsPerMeter(pixelsPerUnit: number, unit: 'px' | 'm'): number {
  if (unit === 'm') return pixelsPerUnit
  return pixelsPerUnit
}

export function getWallAngleDegrees(wall: Wall): number {
  const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x)
  return angle * (180 / Math.PI)
}