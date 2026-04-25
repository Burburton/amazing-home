/**
 * Wall Detection Spike (Feature 018)
 * 
 * Experimental edge detection to identify walls from floor plan images.
 * This is a spike - not production-ready, just exploring the concept.
 * 
 * Approach:
 * 1. Convert image to grayscale
 * 2. Detect dark lines (walls are typically darker in floor plans)
 * 3. Find horizontal and vertical line segments
 * 4. Convert to Wall objects
 * 
 * Limitations:
 * - Only detects horizontal/vertical lines
 * - Threshold values hardcoded
 * - No noise filtering
 * - Works best on clean floor plan images with dark walls
 */

import { Point2D, Wall } from '@domain/floorplan/types'

interface DetectedLine {
  start: Point2D
  end: Point2D
  thickness: number
}

interface DetectionOptions {
  threshold?: number // grayscale threshold for wall detection
  minLength?: number // minimum line length in pixels
  wallThickness?: number // detected wall thickness
}

const DEFAULT_OPTIONS: DetectionOptions = {
  threshold: 100, // pixels darker than this considered walls
  minLength: 20, // minimum 20px line
  wallThickness: 10,
}

/**
 * Detect walls from an image source (canvas or image element)
 */
export function detectWallsFromImage(
  image: HTMLImageElement | HTMLCanvasElement,
  options: DetectionOptions = {}
): Wall[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Create canvas from image
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  
  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0)
  
  // Get grayscale data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const grayscale = toGrayscale(imageData)
  
  // Detect lines
  const lines = detectLines(grayscale, canvas.width, canvas.height, opts)
  
  // Convert to Wall objects
  return lines.map((line, index) => ({
    id: `detected-wall-${index}`,
    start: line.start,
    end: line.end,
    thickness: opts.wallThickness || 10,
    isLoadBearing: false,
  }))
}

/**
 * Convert RGBA image data to grayscale values
 */
function toGrayscale(imageData: ImageData): number[] {
  const data = imageData.data
  const grayscale: number[] = []
  
  for (let i = 0; i < data.length; i += 4) {
    // Standard grayscale formula
    const gray = 0.299 * (data[i] ?? 0) + 0.587 * (data[i + 1] ?? 0) + 0.114 * (data[i + 2] ?? 0)
    grayscale.push(gray)
  }
  
  return grayscale
}

/**
 * Detect horizontal and vertical lines from grayscale data
 */
function detectLines(
  grayscale: number[],
  width: number,
  height: number,
  options: DetectionOptions
): DetectedLine[] {
  const threshold = options.threshold || 100
  const minLength = options.minLength || 20
  const lines: DetectedLine[] = []
  
  // Create binary mask (wall pixels = 1, background = 0)
  const mask = grayscale.map(g => g < threshold ? 1 : 0)
  
  // Detect horizontal lines (scan rows)
  for (let y = 0; y < height; y++) {
    let startX = -1
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (mask[idx] === 1 && startX === -1) {
        startX = x
      } else if (mask[idx] === 0 && startX !== -1) {
        const length = x - startX
        if (length >= minLength) {
          lines.push({
            start: { x: startX, y },
            end: { x: x - 1, y },
            thickness: options.wallThickness || 10,
          })
        }
        startX = -1
      }
    }
    // Handle line at end of row
    if (startX !== -1 && width - startX >= minLength) {
      lines.push({
        start: { x: startX, y },
        end: { x: width - 1, y },
        thickness: options.wallThickness || 10,
      })
    }
  }
  
  // Detect vertical lines (scan columns)
  for (let x = 0; x < width; x++) {
    let startY = -1
    for (let y = 0; y < height; y++) {
      const idx = y * width + x
      if (mask[idx] === 1 && startY === -1) {
        startY = y
      } else if (mask[idx] === 0 && startY !== -1) {
        const length = y - startY
        if (length >= minLength) {
          lines.push({
            start: { x, y: startY },
            end: { x, y: y - 1 },
            thickness: options.wallThickness || 10,
          })
        }
        startY = -1
      }
    }
    // Handle line at end of column
    if (startY !== -1 && height - startY >= minLength) {
      lines.push({
        start: { x, y: startY },
        end: { x, y: height - 1 },
        thickness: options.wallThickness || 10,
      })
    }
  }
  
  // Merge nearby lines (simple consolidation)
  return mergeNearbyLines(lines, 5)
}

/**
 * Merge lines that are close together
 */
function mergeNearbyLines(lines: DetectedLine[], tolerance: number): DetectedLine[] {
  // Simple approach: just merge horizontal lines on same Y within tolerance
  // and vertical lines on same X within tolerance
  
  const horizontal = lines.filter(l => l.start.y === l.end.y)
  const vertical = lines.filter(l => l.start.x === l.end.x)
  
  const mergedHorizontal = mergeHorizontalLines(horizontal, tolerance)
  const mergedVertical = mergeVerticalLines(vertical, tolerance)
  
  return [...mergedHorizontal, ...mergedVertical]
}

function mergeHorizontalLines(lines: DetectedLine[], tolerance: number): DetectedLine[] {
  const result: DetectedLine[] = []
  const sorted = [...lines].sort((a, b) => a.start.y - b.start.y)
  
  for (const line of sorted) {
    const existing = result.find(r => 
      Math.abs(r.start.y - line.start.y) <= tolerance &&
      Math.abs(r.end.y - line.end.y) <= tolerance &&
      // Lines overlap or are adjacent
      !(line.end.x < r.start.x - tolerance || line.start.x > r.end.x + tolerance)
    )
    
    if (existing) {
      // Extend existing line
      existing.start.x = Math.min(existing.start.x, line.start.x)
      existing.end.x = Math.max(existing.end.x, line.end.x)
      existing.start.y = Math.round((existing.start.y + line.start.y) / 2)
      existing.end.y = existing.start.y
    } else {
      result.push({ ...line })
    }
  }
  
  return result
}

function mergeVerticalLines(lines: DetectedLine[], tolerance: number): DetectedLine[] {
  const result: DetectedLine[] = []
  const sorted = [...lines].sort((a, b) => a.start.x - b.start.x)
  
  for (const line of sorted) {
    const existing = result.find(r => 
      Math.abs(r.start.x - line.start.x) <= tolerance &&
      Math.abs(r.end.x - line.end.x) <= tolerance &&
      // Lines overlap or are adjacent
      !(line.end.y < r.start.y - tolerance || line.start.y > r.end.y + tolerance)
    )
    
    if (existing) {
      // Extend existing line
      existing.start.y = Math.min(existing.start.y, line.start.y)
      existing.end.y = Math.max(existing.end.y, line.end.y)
      existing.start.x = Math.round((existing.start.x + line.start.x) / 2)
      existing.end.x = existing.start.x
    } else {
      result.push({ ...line })
    }
  }
  
  return result
}

/**
 * Debug utility: create visualization canvas of detected walls
 */
export function createDetectionDebugCanvas(
  image: HTMLImageElement | HTMLCanvasElement,
  walls: Wall[]
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  
  canvas.width = image.width
  canvas.height = image.height
  
  // Draw original image
  ctx.drawImage(image, 0, 0)
  
  // Overlay detected walls in red
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 2
  
  for (const wall of walls) {
    ctx.beginPath()
    ctx.moveTo(wall.start.x, wall.start.y)
    ctx.lineTo(wall.end.x, wall.end.y)
    ctx.stroke()
  }
  
  return canvas
}