import { Point2D, Wall } from '@domain/floorplan/types'

interface DetectedLine {
  start: Point2D
  end: Point2D
  thickness: number
}

interface DetectionOptions {
  threshold?: number
  minLength?: number
  wallThickness?: number
  cannyLowThreshold?: number
  cannyHighThreshold?: number
  gaussianSigma?: number
  houghThreshold?: number
  minLineLength?: number
  maxLineGap?: number
  angleTolerance?: number
}

const DEFAULT_OPTIONS: Required<DetectionOptions> = {
  threshold: 100,
  minLength: 20,
  wallThickness: 10,
  cannyLowThreshold: 50,
  cannyHighThreshold: 150,
  gaussianSigma: 1,
  houghThreshold: 100,
  minLineLength: 50,
  maxLineGap: 10,
  angleTolerance: 5,
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
  
  const grayscale = toGrayscale(imageData)
  const blurred = applyGaussianBlur(grayscale, canvas.width, canvas.height, opts.gaussianSigma)
  const edges = applyCannyEdgeDetection(blurred, canvas.width, canvas.height, 
    opts.cannyLowThreshold, opts.cannyHighThreshold)
  const lines = applyHoughLinesP(edges, canvas.width, canvas.height,
    opts.houghThreshold, opts.minLineLength, opts.maxLineGap)
  
  const filteredLines = filterLines(lines, opts.minLength, opts.angleTolerance)
  const mergedLines = mergeNearbyLines(filteredLines, 5)
  
  return mergedLines.map((line, index) => ({
    id: `detected-wall-${index}`,
    start: line.start,
    end: line.end,
    thickness: opts.wallThickness,
    isLoadBearing: false,
  }))
}

function toGrayscale(imageData: ImageData): Uint8Array {
  const data = imageData.data
  const grayscale = new Uint8Array(data.length / 4)
  
  for (let i = 0; i < grayscale.length; i++) {
    const r = data[i * 4] ?? 0
    const g = data[i * 4 + 1] ?? 0
    const b = data[i * 4 + 2] ?? 0
    grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
  }
  
  return grayscale
}

function applyGaussianBlur(
  grayscale: Uint8Array,
  width: number,
  height: number,
  sigma: number
): Uint8Array {
  const kernelSize = 5
  const kernel = createGaussianKernel(kernelSize, sigma)
  const half = Math.floor(kernelSize / 2)
  
  const blurred = new Uint8Array(grayscale.length)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      let weightSum = 0
      
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = Math.min(Math.max(x + kx - half, 0), width - 1)
          const py = Math.min(Math.max(y + ky - half, 0), height - 1)
          const weight = kernel[ky * kernelSize + kx] ?? 0
          sum += (grayscale[py * width + px] ?? 0) * weight
          weightSum += weight
        }
      }
      
      blurred[y * width + x] = Math.round(sum / weightSum)
    }
  }
  
  return blurred
}

function createGaussianKernel(size: number, sigma: number): number[] {
  const kernel: number[] = []
  const half = size / 2
  const sigma2 = 2 * sigma * sigma
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - half
      const dy = y - half
      kernel.push(Math.exp(-(dx * dx + dy * dy) / sigma2))
    }
  }
  
  return kernel
}

function applyCannyEdgeDetection(
  grayscale: Uint8Array,
  width: number,
  height: number,
  lowThreshold: number,
  highThreshold: number
): Uint8Array {
  const { gradientX, gradientY, magnitude } = computeSobelGradient(grayscale, width, height)
  const suppressed = nonMaximumSuppression(magnitude, gradientX, gradientY, width, height)
  const edges = edgeTracking(suppressed, width, height, lowThreshold, highThreshold)
  return edges
}

function computeSobelGradient(
  grayscale: Uint8Array,
  width: number,
  height: number
): { gradientX: Float32Array, gradientY: Float32Array, magnitude: Float32Array } {
  const gradientX = new Float32Array(grayscale.length)
  const gradientY = new Float32Array(grayscale.length)
  const magnitude = new Float32Array(grayscale.length)
  
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0
      let gy = 0
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = grayscale[(y + ky) * width + (x + kx)] ?? 0
          const kernelIdx = (ky + 1) * 3 + (kx + 1)
          gx += pixel * (sobelX[kernelIdx] ?? 0)
          gy += pixel * (sobelY[kernelIdx] ?? 0)
        }
      }
      
      const idx = y * width + x
      gradientX[idx] = gx
      gradientY[idx] = gy
      magnitude[idx] = Math.sqrt(gx * gx + gy * gy)
    }
  }
  
  return { gradientX, gradientY, magnitude }
}

function nonMaximumSuppression(
  magnitude: Float32Array,
  gradientX: Float32Array,
  gradientY: Float32Array,
  width: number,
  height: number
): Uint8Array {
  const suppressed = new Uint8Array(magnitude.length)
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const mag = magnitude[idx] ?? 0
      
      if (mag === 0) continue
      
      const gx = gradientX[idx] ?? 0
      const gy = gradientY[idx] ?? 0
      const angle = Math.atan2(gy, gx) * 180 / Math.PI
      
      let neighbor1: number
      let neighbor2: number
      
      if ((angle >= -22.5 && angle < 22.5) || (angle >= 157.5 && angle < 180) || (angle >= -180 && angle < -157.5)) {
        neighbor1 = magnitude[idx - 1] ?? 0
        neighbor2 = magnitude[idx + 1] ?? 0
      } else if ((angle >= 22.5 && angle < 67.5) || (angle >= -157.5 && angle < -112.5)) {
        neighbor1 = magnitude[(y - 1) * width + (x + 1)] ?? 0
        neighbor2 = magnitude[(y + 1) * width + (x - 1)] ?? 0
      } else if ((angle >= 67.5 && angle < 112.5) || (angle >= -112.5 && angle < -67.5)) {
        neighbor1 = magnitude[(y - 1) * width + x] ?? 0
        neighbor2 = magnitude[(y + 1) * width + x] ?? 0
      } else {
        neighbor1 = magnitude[(y - 1) * width + (x - 1)] ?? 0
        neighbor2 = magnitude[(y + 1) * width + (x + 1)] ?? 0
      }
      
      if (mag >= neighbor1 && mag >= neighbor2) {
        suppressed[idx] = Math.round(mag)
      }
    }
  }
  
  return suppressed
}

function edgeTracking(
  suppressed: Uint8Array,
  width: number,
  height: number,
  lowThreshold: number,
  highThreshold: number
): Uint8Array {
  const edges = new Uint8Array(suppressed.length)
  const strong = 255
  const weak = 50
  
  for (let i = 0; i < suppressed.length; i++) {
    const val = suppressed[i] ?? 0
    if (val >= highThreshold) {
      edges[i] = strong
    } else if (val >= lowThreshold) {
      edges[i] = weak
    }
  }
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      
      if (edges[idx] === weak) {
        let hasStrongNeighbor = false
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (edges[(y + dy) * width + (x + dx)] === strong) {
              hasStrongNeighbor = true
              break
            }
          }
          if (hasStrongNeighbor) break
        }
        
        edges[idx] = hasStrongNeighbor ? strong : 0
      }
    }
  }
  
  return edges
}

function applyHoughLinesP(
  edges: Uint8Array,
  width: number,
  height: number,
  threshold: number,
  minLineLength: number,
  maxLineGap: number
): DetectedLine[] {
  const lines: DetectedLine[] = []
  
  const rhoMax = Math.sqrt(width * width + height * height)
  const rhoSteps = Math.round(rhoMax)
  const thetaSteps = 180
  const accumulator = new Uint32Array(rhoSteps * thetaSteps)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (edges[y * width + x] === 255) {
        for (let theta = 0; theta < thetaSteps; theta++) {
          const thetaRad = theta * Math.PI / 180
          const rho = Math.round(x * Math.cos(thetaRad) + y * Math.sin(thetaRad))
          if (rho >= 0 && rho < rhoSteps) {
            const accIdx = rho * thetaSteps + theta
            if (accIdx >= 0 && accIdx < accumulator.length) {
              accumulator[accIdx] = (accumulator[accIdx] ?? 0) + 1
            }
          }
        }
      }
    }
  }
  
  const peaks: { rho: number, theta: number }[] = []
  for (let rho = 0; rho < rhoSteps; rho++) {
    for (let theta = 0; theta < thetaSteps; theta++) {
      const votes = accumulator[rho * thetaSteps + theta] ?? 0
      if (votes >= threshold) {
        peaks.push({ rho, theta })
      }
    }
  }
  
  for (const peak of peaks) {
    const thetaRad = peak.theta * Math.PI / 180
    const cosT = Math.cos(thetaRad)
    const sinT = Math.sin(thetaRad)
    
    const points: Point2D[] = []
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (edges[y * width + x] === 255) {
          const r = x * cosT + y * sinT
          if (Math.abs(r - peak.rho) < 2) {
            points.push({ x, y })
          }
        }
      }
    }
    
    if (points.length < 2) continue
    
    const lineAngleDeg = peak.theta < 90 ? peak.theta + 90 : peak.theta - 90
    const lineDirX = Math.cos(lineAngleDeg * Math.PI / 180)
    const lineDirY = Math.sin(lineAngleDeg * Math.PI / 180)
    
    points.sort((a, b) => {
      const projA = a.x * lineDirX + a.y * lineDirY
      const projB = b.x * lineDirX + b.y * lineDirY
      return projA - projB
    })
    
    let segmentStart = points[0]!
    let lastPoint = points[0]!
    
    for (let i = 1; i < points.length; i++) {
      const point = points[i]!
      const gap = Math.sqrt((point.x - lastPoint.x) ** 2 + (point.y - lastPoint.y) ** 2)
      
      if (gap <= maxLineGap) {
        lastPoint = point
      } else {
        const segmentLength = Math.sqrt(
          (lastPoint.x - segmentStart.x) ** 2 + 
          (lastPoint.y - segmentStart.y) ** 2
        )
        
        if (segmentLength >= minLineLength) {
          lines.push({
            start: segmentStart,
            end: lastPoint,
            thickness: 10,
          })
        }
        
        segmentStart = point
        lastPoint = point
      }
    }
    
    const segmentLength = Math.sqrt(
      (lastPoint.x - segmentStart.x) ** 2 + 
      (lastPoint.y - segmentStart.y) ** 2
    )
    
    if (segmentLength >= minLineLength) {
      lines.push({
        start: segmentStart,
        end: lastPoint,
        thickness: 10,
      })
    }
  }
  
  return lines
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
  const grayscale = toGrayscale(imageData)
  const blurred = applyGaussianBlur(grayscale, canvas.width, canvas.height, opts.gaussianSigma)
  const edges = applyCannyEdgeDetection(blurred, canvas.width, canvas.height,
    opts.cannyLowThreshold, opts.cannyHighThreshold)
  
  const edgeData = new Uint8ClampedArray(edges.length * 4)
  for (let i = 0; i < edges.length; i++) {
    const value = edges[i] ?? 0
    edgeData[i * 4] = value
    edgeData[i * 4 + 1] = value
    edgeData[i * 4 + 2] = value
    edgeData[i * 4 + 3] = 255
  }
  
  const edgeImageData = new ImageData(edgeData, canvas.width, canvas.height)
  ctx.putImageData(edgeImageData, 0, 0)
  
  return canvas
}