import { describe, it, expect } from 'vitest'
import { wallToMeshData, computeBoundingBox, getWallAngleDegrees } from '@domain/floorplan/geometry'
import { getWallLength } from '@domain/floorplan/document'
import { Wall } from '@domain/floorplan/types'

describe('Geometry Utilities', () => {
  describe('wallToMeshData', () => {
    it('should convert horizontal wall to mesh data', () => {
      const wall: Wall = {
        id: 'w1',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 0 },
        thickness: 10,
        isLoadBearing: false,
      }
      const mesh = wallToMeshData(wall, 280)
      
      expect(mesh.args[0]).toBe(100)
      expect(mesh.args[1]).toBe(280)
      expect(mesh.args[2]).toBe(10)
      expect(mesh.position[0]).toBe(50)
      expect(mesh.position[1]).toBe(140)
      expect(mesh.position[2]).toBe(0)
      expect(mesh.rotation[1]).toBeCloseTo(0, 5)
    })

    it('should convert vertical wall to mesh data', () => {
      const wall: Wall = {
        id: 'w2',
        start: { x: 0, y: 0 },
        end: { x: 0, y: 100 },
        thickness: 10,
        isLoadBearing: false,
      }
      const mesh = wallToMeshData(wall, 280)
      
      expect(mesh.args[0]).toBe(100)
      expect(mesh.position[0]).toBe(0)
      expect(mesh.position[2]).toBe(50)
      expect(mesh.rotation[1]).toBeCloseTo(-Math.PI / 2, 5)
    })

    it('should convert diagonal wall to mesh data', () => {
      const wall: Wall = {
        id: 'w3',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 100 },
        thickness: 10,
        isLoadBearing: false,
      }
      const mesh = wallToMeshData(wall, 280)
      
      expect(mesh.args[0]).toBeCloseTo(141.42, 1)
      expect(mesh.position[0]).toBe(50)
      expect(mesh.position[2]).toBe(50)
    })
  })

  describe('computeBoundingBox', () => {
    it('should return empty bounds for empty walls', () => {
      const bounds = computeBoundingBox([])
      expect(bounds.width).toBe(0)
      expect(bounds.height).toBe(0)
      expect(bounds.centerX).toBe(0)
      expect(bounds.centerY).toBe(0)
    })

    it('should compute bounds for single wall', () => {
      const walls: Wall[] = [{
        id: 'w1',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 100 },
        thickness: 10,
        isLoadBearing: false,
      }]
      const bounds = computeBoundingBox(walls)
      
      expect(bounds.minX).toBe(0)
      expect(bounds.maxX).toBe(100)
      expect(bounds.minY).toBe(0)
      expect(bounds.maxY).toBe(100)
      expect(bounds.width).toBe(100)
      expect(bounds.height).toBe(100)
      expect(bounds.centerX).toBe(50)
      expect(bounds.centerY).toBe(50)
    })

    it('should compute bounds for multiple walls', () => {
      const walls: Wall[] = [
        { id: 'w1', start: { x: 0, y: 0 }, end: { x: 200, y: 0 }, thickness: 10, isLoadBearing: false },
        { id: 'w2', start: { x: 200, y: 0 }, end: { x: 200, y: 150 }, thickness: 10, isLoadBearing: false },
        { id: 'w3', start: { x: 0, y: 0 }, end: { x: 0, y: 150 }, thickness: 10, isLoadBearing: false },
        { id: 'w4', start: { x: 0, y: 150 }, end: { x: 200, y: 150 }, thickness: 10, isLoadBearing: false },
      ]
      const bounds = computeBoundingBox(walls)
      
      expect(bounds.minX).toBe(0)
      expect(bounds.maxX).toBe(200)
      expect(bounds.minY).toBe(0)
      expect(bounds.maxY).toBe(150)
      expect(bounds.width).toBe(200)
      expect(bounds.height).toBe(150)
      expect(bounds.centerX).toBe(100)
      expect(bounds.centerY).toBe(75)
    })
  })

  describe('getWallAngleDegrees', () => {
    it('should return 0 for horizontal wall', () => {
      const wall: Wall = {
        id: 'w1',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 0 },
        thickness: 10,
        isLoadBearing: false,
      }
      expect(getWallAngleDegrees(wall)).toBe(0)
    })

    it('should return 90 for vertical wall going down', () => {
      const wall: Wall = {
        id: 'w2',
        start: { x: 0, y: 0 },
        end: { x: 0, y: 100 },
        thickness: 10,
        isLoadBearing: false,
      }
      expect(getWallAngleDegrees(wall)).toBe(90)
    })

    it('should return 45 for diagonal wall', () => {
      const wall: Wall = {
        id: 'w3',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 100 },
        thickness: 10,
        isLoadBearing: false,
      }
      expect(getWallAngleDegrees(wall)).toBe(45)
    })
  })

  describe('getWallLength', () => {
    it('should return length for horizontal wall', () => {
      const wall = { id: 'w1', start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, thickness: 10, isLoadBearing: false }
      expect(getWallLength(wall)).toBe(100)
    })

    it('should return length for diagonal wall', () => {
      const wall = { id: 'w2', start: { x: 0, y: 0 }, end: { x: 100, y: 100 }, thickness: 10, isLoadBearing: false }
      expect(getWallLength(wall)).toBeCloseTo(141.42, 1)
    })
  })
})