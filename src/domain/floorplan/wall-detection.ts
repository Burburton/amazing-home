import { Point2D, Wall } from '@domain/floorplan/types'

interface DetectedLine {
  start: Point2D
  end: Point2D
  thickness: number
}

interface DetectionOptions {
  minLength?: number
  wallThickness?: number
  angleTolerance?: number
  maxWallThickness?: number
  wallDarkness?: number
  minWallDensity?: number
}

const DEFAULT_OPTIONS: Required<DetectionOptions> = {
  minLength: 20,
  wallThickness: 10,
  angleTolerance: 5,
  maxWallThickness: 30,
  wallDarkness: 80,
  minWallDensity: 0.3,
}

export function detectWallsFromImage(
  image: HTMLImageElement | HTMLCanvasElement,
  options: DetectionOptions = {}
): Wall[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  
  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  
  const darkMask = extractDarkPixels(imageData, opts.wallDarkness)
  
  const cleanedMask = morphologicalOpening(darkMask, canvas.width, canvas.height, 3)
  
  const skeleton = skeletonizeMask(cleanedMask, canvas.width, canvas.height)
  
  const lines = detectLinesFromSkeleton(skeleton, canvas.width, canvas.height, opts.minLength)
  
  const filteredLines = filterLines(lines, opts.minLength, opts.angleTolerance)
  
  const wallCandidates = filterByDensity(filteredLines, cleanedMask, canvas.width, canvas.height, opts.minWallDensity)
  
  const mergedParallelLines = mergeParallelLines(wallCandidates, opts.maxWallThickness)
  
  const finalLines = mergeNearbyLines(mergedParallelLines, 5)
  
  const timestamp = Date.now()
  
  return finalLines.map((line, index) => ({
    id: `wall-${timestamp}-${index}`,
    start: line.start,
    end: line.end,
    thickness: line.thickness || opts.wallThickness,
    isLoadBearing: false,
  }))
}

function extractDarkPixels(imageData: ImageData, darknessThreshold: number): Uint8Array {
  const data = imageData.data
  const mask = new Uint8Array(data.length / 4)
  
  for (let i = 0; i < mask.length; i++) {
    const r = data[i * 4] ?? 0
    const g = data[i * 4 + 1] ?? 0
    const b = data[i * 4 + 2] ?? 0
    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    
    mask[i] = gray < darknessThreshold ? 1 : 0
  }
  
  return mask
}

function morphologicalOpening(mask: Uint8Array, width: number, height: number, kernelSize: number): Uint8Array {
  const half = Math.floor(kernelSize / 2)
  
  const eroded = new Uint8Array(mask.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let allOnes = true
      for (let ky = -half; ky <= half && allOnes; ky++) {
        for (let kx = -half; kx <= half && allOnes; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1)
          const py = Math.min(Math.max(y + ky, 0), height - 1)
          if (mask[py * width + px] === 0) {
            allOnes = false
          }
        }
      }
      eroded[y * width + x] = allOnes ? 1 : 0
    }
  }
  
  const dilated = new Uint8Array(mask.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let anyOne = false
      for (let ky = -half; ky <= half && !anyOne; ky++) {
        for (let kx = -half; kx <= half && !anyOne; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1)
          const py = Math.min(Math.max(y + ky, 0), height - 1)
          if (eroded[py * width + px] === 1) {
            anyOne = true
          }
        }
      }
      dilated[y * width + x] = anyOne ? 1 : 0
    }
  }
  
  return dilated
}

function skeletonizeMask(mask: Uint8Array, width: number, height: number): Uint8Array {
  const skeleton = new Uint8Array(mask.length)
  const temp = new Uint8Array(mask.length)
  
  for (let i = 0; i < mask.length; i++) {
    skeleton[i] = mask[i] ?? 0
    temp[i] = mask[i] ?? 0
  }
  
  const neighbors: [number, number][] = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]
  
  for (let iteration = 0; iteration < 10; iteration++) {
    let changed = false
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (temp[y * width + x] === 0) continue
        
        let count = 0
        for (const [dy, dx] of neighbors) {
          if (temp[(y + dy) * width + (x + dx)] === 1) count++
        }
        
        if (count >= 2 && count <= 6) {
          let transitions = 0
          const order: [number, number][] = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]]
          for (let i = 0; i < order.length; i++) {
            const curr = order[i]!
            const next = order[(i + 1) % order.length]!
            const v1 = temp[(y + curr[0]) * width + (x + curr[1])] ?? 0
            const v2 = temp[(y + next[0]) * width + (x + next[1])] ?? 0
            if (v1 === 0 && v2 === 1) transitions++
          }
          
          if (transitions === 1) {
            skeleton[y * width + x] = 0
            changed = true
          }
        }
      }
    }
    
    for (let i = 0; i < skeleton.length; i++) {
      temp[i] = skeleton[i] ?? 0
    }
    
    if (!changed) break
  }
  
  return skeleton
}

function detectLinesFromSkeleton(skeleton: Uint8Array, width: number, height: number, minLength: number): DetectedLine[] {
  const lines: DetectedLine[] = []
  const visited = new Uint8Array(skeleton.length)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (skeleton[idx] === 1 && visited[idx] === 0) {
        const segment = traceLineSegment(skeleton, visited, width, height, x, y, minLength)
        if (segment) {
          lines.push(segment)
        }
      }
    }
  }
  
  return lines
}

function traceLineSegment(
  skeleton: Uint8Array,
  visited: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number,
  minLength: number
): DetectedLine | null {
  const points: Point2D[] = []
  let x = startX
  let y = startY
  
  const directions: [number, number][] = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ]
  
  while (true) {
    const idx = y * width + x
    if (skeleton[idx] === 0 || visited[idx] === 1) break
    
    points.push({ x, y })
    visited[idx] = 1
    
    let found = false
    for (const [dy, dx] of directions) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx
        if (skeleton[nidx] === 1 && visited[nidx] === 0) {
          x = nx
          y = ny
          found = true
          break
        }
      }
    }
    
    if (!found) break
  }
  
  if (points.length < 2) return null
  
  const length = Math.sqrt(
    (points[points.length - 1]!.x - points[0]!.x) ** 2 +
    (points[points.length - 1]!.y - points[0]!.y) ** 2
  )
  
  if (length < minLength) return null
  
  return {
    start: points[0]!,
    end: points[points.length - 1]!,
    thickness: 10,
  }
}

function filterByDensity(
  lines: DetectedLine[],
  mask: Uint8Array,
  width: number,
  height: number,
  minDensity: number
): DetectedLine[] {
  return lines.filter(line => {
    const density = calculateLineDensity(line, mask, width, height)
    return density >= minDensity
  })
}

function calculateLineDensity(
  line: DetectedLine,
  mask: Uint8Array,
  width: number,
  height: number
): number {
  const dx = line.end.x - line.start.x
  const dy = line.end.y - line.start.y
  const length = Math.sqrt(dx * dx + dy * dy)
  
  if (length === 0) return 0
  
  const perpendicularSamples = 10
  const alongLineSamples = Math.ceil(length / 5)
  
  let totalPixels = 0
  let wallPixels = 0
  
  for (let i = 0; i <= alongLineSamples; i++) {
    const t = i / alongLineSamples
    const centerX = Math.round(line.start.x + dx * t)
    const centerY = Math.round(line.start.y + dy * t)
    
    const perpX = -dy / length
    const perpY = dx / length
    
    for (let j = -perpendicularSamples; j <= perpendicularSamples; j++) {
      const sampleX = Math.round(centerX + perpX * j)
      const sampleY = Math.round(centerY + perpY * j)
      
      if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
        totalPixels++
        if (mask[sampleY * width + sampleX] === 1) {
          wallPixels++
        }
      }
    }
  }
  
  return totalPixels > 0 ? wallPixels / totalPixels : 0
}

function filterLines(
  lines: DetectedLine[],
  minLength: number,
  angleTolerance: number
): DetectedLine[] {
  return lines.filter(line => {
    const dx = line.end.x - line.start.x
    const dy = line.end.y - line.start.y
    const length = Math.sqrt(dx * dx + dy * dy)
    
    if (length < minLength) return false
    
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const absAngle = Math.abs(angle)
    
    const isHorizontal = absAngle < angleTolerance || absAngle > 180 - angleTolerance
    const isVertical = Math.abs(absAngle - 90) < angleTolerance
    
    return isHorizontal || isVertical
  })
}

function getLineOverlapX(line1: DetectedLine, line2: DetectedLine): number {
  const min1 = Math.min(line1.start.x, line1.end.x)
  const max1 = Math.max(line1.start.x, line1.end.x)
  const min2 = Math.min(line2.start.x, line2.end.x)
  const max2 = Math.max(line2.start.x, line2.end.x)
  
  return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2))
}

function mergeParallelLines(lines: DetectedLine[], maxWallThickness: number): DetectedLine[] {
  const horizontal = lines.filter(l => Math.abs(l.start.y - l.end.y) < 3)
  const vertical = lines.filter(l => Math.abs(l.start.x - l.end.x) < 3)
  
  const mergedHorizontal = mergeHorizontalParallelPairs(horizontal, maxWallThickness)
  const mergedVertical = mergeVerticalParallelPairs(vertical, maxWallThickness)
  
  return [...mergedHorizontal, ...mergedVertical]
}

function mergeHorizontalParallelPairs(lines: DetectedLine[], maxThickness: number): DetectedLine[] {
  const result: DetectedLine[] = []
  const used = new Set<number>()
  
  const sorted = [...lines].sort((a, b) => a.start.y - b.start.y)
  
  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue
    
    const line1 = sorted[i]!
    
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue
      
      const line2 = sorted[j]!
      
      const yDistance = Math.abs(line2.start.y - line1.start.y)
      
      if (yDistance <= maxThickness && yDistance >= 2) {
        const overlapX = getLineOverlapX(line1, line2)
        const line1Len = getLineLength(line1)
        const line2Len = getLineLength(line2)
        
        if (overlapX >= line1Len * 0.5 && overlapX >= line2Len * 0.5) {
          const avgY = Math.round((line1.start.y + line2.start.y) / 2)
          const minX = Math.min(line1.start.x, line1.end.x, line2.start.x, line2.end.x)
          const maxX = Math.max(line1.start.x, line1.end.x, line2.start.x, line2.end.x)
          
          result.push({
            start: { x: minX, y: avgY },
            end: { x: maxX, y: avgY },
            thickness: yDistance,
          })
          
          used.add(i)
          used.add(j)
          break
        }
      }
    }
    
    if (!used.has(i)) {
      result.push({ ...line1 })
    }
  }
  
  return result
}

function mergeVerticalParallelPairs(lines: DetectedLine[], maxThickness: number): DetectedLine[] {
  const result: DetectedLine[] = []
  const used = new Set<number>()
  
  const sorted = [...lines].sort((a, b) => a.start.x - b.start.x)
  
  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue
    
    const line1 = sorted[i]!
    
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue
      
      const line2 = sorted[j]!
      
      const xDistance = Math.abs(line2.start.x - line1.start.x)
      
      if (xDistance <= maxThickness && xDistance >= 2) {
        const overlapY = getLineOverlapY(line1, line2)
        const line1Len = getLineLength(line1)
        const line2Len = getLineLength(line2)
        
        if (overlapY >= line1Len * 0.5 && overlapY >= line2Len * 0.5) {
          const avgX = Math.round((line1.start.x + line2.start.x) / 2)
          const minY = Math.min(line1.start.y, line1.end.y, line2.start.y, line2.end.y)
          const maxY = Math.max(line1.start.y, line1.end.y, line2.start.y, line2.end.y)
          
          result.push({
            start: { x: avgX, y: minY },
            end: { x: avgX, y: maxY },
            thickness: xDistance,
          })
          
          used.add(i)
          used.add(j)
          break
        }
      }
    }
    
    if (!used.has(i)) {
      result.push({ ...line1 })
    }
  }
  
  return result
}

function getLineOverlapY(line1: DetectedLine, line2: DetectedLine): number {
  const min1 = Math.min(line1.start.y, line1.end.y)
  const max1 = Math.max(line1.start.y, line1.end.y)
  const min2 = Math.min(line2.start.y, line2.end.y)
  const max2 = Math.max(line2.start.y, line2.end.y)
  
  return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2))
}

function getLineLength(line: DetectedLine): number {
  return Math.sqrt(
    (line.end.x - line.start.x) ** 2 + 
    (line.end.y - line.start.y) ** 2
  )
}

function mergeNearbyLines(lines: DetectedLine[], tolerance: number): DetectedLine[] {
  const horizontal = lines.filter(l => Math.abs(l.start.y - l.end.y) < tolerance)
  const vertical = lines.filter(l => Math.abs(l.start.x - l.end.x) < tolerance)
  
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
      !(line.end.x < r.start.x - tolerance || line.start.x > r.end.x + tolerance)
    )
    
    if (existing) {
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
      !(line.end.y < r.start.y - tolerance || line.start.y > r.end.y + tolerance)
    )
    
    if (existing) {
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

export function createDetectionDebugCanvas(
  image: HTMLImageElement | HTMLCanvasElement,
  walls: Wall[]
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  
  canvas.width = image.width
  canvas.height = image.height
  
  ctx.drawImage(image, 0, 0)
  
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

export function createEdgeDebugCanvas(
  image: HTMLImageElement | HTMLCanvasElement,
  options: DetectionOptions = {}
): HTMLCanvasElement {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  
  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const darkMask = extractDarkPixels(imageData, opts.wallDarkness)
  const cleanedMask = morphologicalOpening(darkMask, canvas.width, canvas.height, 3)
  
  const maskData = new Uint8ClampedArray(cleanedMask.length * 4)
  for (let i = 0; i < cleanedMask.length; i++) {
    const value = (cleanedMask[i] ?? 0) * 255
    maskData[i * 4] = value
    maskData[i * 4 + 1] = value
    maskData[i * 4 + 2] = value
    maskData[i * 4 + 3] = 255
  }
  
  const maskImageData = new ImageData(maskData, canvas.width, canvas.height)
  ctx.putImageData(maskImageData, 0, 0)
  
  return canvas
}