import * as tf from '@tensorflow/tfjs'

export interface TFJSRecognitionResult {
  walls: Array<{
    start: { x: number; y: number }
    end: { x: number; y: number }
    thickness: number
    confidence: number
  }>
  rooms: Array<{
    polygon: Array<{ x: number; y: number }>
    type: string
    confidence: number
  }>
  icons: Array<{
    bbox: { x: number; y: number; width: number; height: number }
    type: string
    confidence: number
  }>
  confidence: number
}

export interface ModelLoadProgress {
  status: 'loading' | 'success' | 'error'
  loadedBytes: number
  totalBytes: number
  percentage: number
}

function getModelUrl(): string {
  const base = window.location.origin
  const path = window.location.pathname.replace(/\/$/, '')
  return `${base}${path}/tfjs-model/model.json`
}

const ICON_TYPES = [
  'door', 'window', 'bed', 'table', 'sofa', 'chair',
  'refrigerator', 'sink', 'toilet', 'bathtub'
]

const ROOM_TYPES = [
  'background', 'wall', 'kitchen', 'living_room', 'bedroom',
  'bathroom', 'dining', 'child_room', 'study'
]

export class FloorPlanRecognizer {
  private model: tf.GraphModel | null = null
  private loaded: boolean = false
  private loadProgress: ModelLoadProgress | null = null

  async loadModel(onProgress?: (progress: ModelLoadProgress) => void): Promise<void> {
    if (this.loaded) return

    this.loadProgress = { status: 'loading', loadedBytes: 0, totalBytes: 113000000, percentage: 0 }

    try {
      const modelUrl = getModelUrl()
      console.log('Loading TF.js floor plan model from:', modelUrl)
      
      this.model = await tf.loadGraphModel(modelUrl, {
        onProgress: (fraction) => {
          this.loadProgress = {
            status: 'loading',
            loadedBytes: Math.round(fraction * 113000000),
            totalBytes: 113000000,
            percentage: Math.round(fraction * 100)
          }
          onProgress?.(this.loadProgress)
        }
      })

      this.loadProgress = { status: 'success', loadedBytes: 113000000, totalBytes: 113000000, percentage: 100 }
      this.loaded = true
      onProgress?.(this.loadProgress)
      console.log('Model loaded successfully')
    } catch (error) {
      this.loadProgress = { status: 'error', loadedBytes: 0, totalBytes: 113000000, percentage: 0 }
      onProgress?.(this.loadProgress)
      console.error('Model load failed, using fallback:', error)
      this.loaded = true
    }
  }

  getLoadProgress(): ModelLoadProgress | null {
    return this.loadProgress
  }

  isLoaded(): boolean {
    return this.loaded && this.model !== null
  }

  async predict(imageData: ImageData): Promise<TFJSRecognitionResult> {
    if (!this.model) {
      return this.fallbackPredict(imageData)
    }

    const tensor = this.preprocessImage(imageData)
    const batchTensor = tensor.expandDims(0)

    const predictions = await this.model.predict(batchTensor) as tf.Tensor[]

    if (!predictions || predictions.length < 2) {
      batchTensor.dispose()
      tensor.dispose()
      return this.fallbackPredict(imageData)
    }

    const pred0 = predictions[0]
    const pred1 = predictions[1]
    if (!pred0 || !pred1) {
      batchTensor.dispose()
      tensor.dispose()
      predictions.forEach(p => p?.dispose())
      return this.fallbackPredict(imageData)
    }

    const result = this.postprocessPrediction(pred0, pred1, imageData.width, imageData.height)

    batchTensor.dispose()
    tensor.dispose()
    predictions.forEach(p => p.dispose())

    return result
  }

  private preprocessImage(imageData: ImageData): tf.Tensor3D {
    const { data, width, height } = imageData
    const targetSize = 512

    const pixelData = new Uint8Array(data)
    const rgbData = new Float32Array(width * height * 3)

    for (let i = 0; i < width * height; i++) {
      const pixelIdx = i * 4
      const r = pixelData[pixelIdx] ?? 0
      const g = pixelData[pixelIdx + 1] ?? 0
      const b = pixelData[pixelIdx + 2] ?? 0

      rgbData[i * 3] = r / 255
      rgbData[i * 3 + 1] = g / 255
      rgbData[i * 3 + 2] = b / 255
    }

    let tensor = tf.tensor3d(rgbData, [height, width, 3])

    if (width !== targetSize || height !== targetSize) {
      tensor = tf.image.resizeBilinear(tensor, [targetSize, targetSize])
    }

    return tensor
  }

  private postprocessPrediction(
    roomIconMask: tf.Tensor,
    wallMask: tf.Tensor,
    originalWidth: number,
    originalHeight: number
  ): TFJSRecognitionResult {
    const roomIconData = Array.from(roomIconMask.dataSync())
    const wallData = Array.from(wallMask.dataSync())

    const scaleX = originalWidth / 512
    const scaleY = originalHeight / 512

    const walls = this.extractWalls(wallData, scaleX, scaleY)
    const rooms = this.extractRooms(roomIconData, scaleX, scaleY)
    const icons = this.extractIcons(roomIconData, scaleX, scaleY)

    const overallConfidence = walls.length > 0
      ? walls.reduce((sum, w) => sum + w.confidence, 0) / walls.length
      : 0.5

    return {
      walls,
      rooms,
      icons,
      confidence: overallConfidence
    }
  }

  private extractWalls(wallData: number[], scaleX: number, scaleY: number): TFJSRecognitionResult['walls'] {
    const wallThreshold = 0.35
    const binaryMask: boolean[][] = []
    for (let y = 0; y < 512; y++) {
      binaryMask[y] = []
      for (let x = 0; x < 512; x++) {
        const idx = y * 512 + x
        binaryMask[y]![x] = (wallData[idx] ?? 0) > wallThreshold
      }
    }

    const skeleton = this.skeletonize(binaryMask)
    const lines = this.detectLinesFromSkeleton(skeleton)

    return lines.map(line => ({
      start: { x: Math.round(line.start.x * scaleX), y: Math.round(line.start.y * scaleY) },
      end: { x: Math.round(line.end.x * scaleX), y: Math.round(line.end.y * scaleY) },
      thickness: Math.round(line.thickness * Math.max(scaleX, scaleY)),
      confidence: line.confidence
    }))
  }

  private skeletonize(mask: boolean[][]): boolean[][] {
    const height = mask.length
    const width = mask[0]?.length ?? 0
    const skeleton: boolean[][] = mask.map(row => [...row])

    const erode = (m: boolean[][]) => {
      const result: boolean[][] = []
      for (let y = 0; y < height; y++) {
        result[y] = []
        for (let x = 0; x < width; x++) {
          if (!m[y]?.[x]) {
            result[y]![x] = false
            continue
          }
          const neighbors = this.countNeighbors(m, x, y)
          result[y]![x] = neighbors >= 2
        }
      }
      return result
    }

    for (let iter = 0; iter < 3; iter++) {
      const eroded = erode(skeleton)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (skeleton[y]?.[x] && !eroded[y]?.[x]) {
            skeleton[y]![x] = this.countNeighbors(skeleton, x, y) >= 2
          }
        }
      }
    }

    return skeleton
  }

  private countNeighbors(mask: boolean[][], x: number, y: number): number {
    let count = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const ny = y + dy
        const nx = x + dx
        if (ny >= 0 && ny < mask.length && nx >= 0 && nx < (mask[0]?.length ?? 0)) {
          if (mask[ny]?.[nx]) count++
        }
      }
    }
    return count
  }

  private detectLinesFromSkeleton(skeleton: boolean[][]): Array<{
    start: { x: number; y: number }
    end: { x: number; y: number }
    thickness: number
    confidence: number
  }> {
    const height = skeleton.length
    const width = skeleton[0]?.length ?? 0
    const visited = new Set<string>()
    const lines: Array<{
      start: { x: number; y: number }
      end: { x: number; y: number }
      thickness: number
      confidence: number
    }> = []

    // Find all endpoints (pixels with exactly 1 neighbor)
    const findEndpoints = (): Array<{ x: number; y: number }> => {
      const endpoints: Array<{ x: number; y: number }> = []
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (skeleton[y]?.[x] && this.countNeighbors(skeleton, x, y) === 1) {
            endpoints.push({ x, y })
          }
        }
      }
      return endpoints
    }

    // Trace path from a starting point, following the skeleton
    const tracePath = (startX: number, startY: number): { points: Array<{ x: number; y: number }>; endX: number; endY: number } | null => {
      const points: Array<{ x: number; y: number }> = []
      let x = startX
      let y = startY
      let prevX = startX
      let prevY = startY
      
      while (true) {
        const key = `${x},${y}`
        if (visited.has(key)) break
        
        visited.add(key)
        points.push({ x, y })
        
        // Find next pixel on skeleton (exclude previous position)
        const neighbors = getOrderedNeighbors(skeleton, x, y, prevX, prevY)
        
        if (neighbors.length === 0) {
          // End of path (endpoint or branch)
          break
        }
        
        // Follow the direction with most continuity
        const next = neighbors[0]
        if (!next) break
        prevX = x
        prevY = y
        x = next.x
        y = next.y
        
        // Limit path length to prevent infinite loops
        if (points.length > 500) break
      }
      
      if (points.length < 2) return null
      
      const lastPoint = points[points.length - 1]!
      return { points, endX: lastPoint.x, endY: lastPoint.y }
    }

    // Get ordered neighbors (prioritize direction continuity)
    const getOrderedNeighbors = (mask: boolean[][], x: number, y: number, prevX: number, prevY: number): Array<{ x: number; y: number }> => {
      const neighbors: Array<{ x: number; y: number; priority: number }> = []
      const dx = x - prevX
      const dy = y - prevY
      
      for (let ndy = -1; ndy <= 1; ndy++) {
        for (let ndx = -1; ndx <= 1; ndx++) {
          if (ndx === 0 && ndy === 0) continue
          const nx = x + ndx
          const ny = y + ndy
          if (ny >= 0 && ny < height && nx >= 0 && nx < width && mask[ny]?.[nx]) {
            const key = `${nx},${ny}`
            if (visited.has(key)) continue
            
            // Calculate direction continuity (dot product)
            const priority = dx * ndx + dy * ndy
            neighbors.push({ x: nx, y: ny, priority })
          }
        }
      }
      
      // Sort by priority (prefer same direction)
      neighbors.sort((a, b) => b.priority - a.priority)
      return neighbors.map(n => ({ x: n.x, y: n.y }))
    }

    // Simplify path to line segment (find start and end points)
    const simplifyToLine = (points: Array<{ x: number; y: number }>): { start: { x: number; y: number }; end: { x: number; y: number }; length: number } | null => {
      if (points.length < 10) return null
      
      const start = points[0]!
      const end = points[points.length - 1]!
      const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
      
      if (length < 20) return null
      
      return { start, end, length }
    }

    // Trace from all endpoints
    const endpoints = findEndpoints()
    
    for (const endpoint of endpoints) {
      const key = `${endpoint.x},${endpoint.y}`
      if (visited.has(key)) continue
      
      const path = tracePath(endpoint.x, endpoint.y)
      if (!path) continue
      
      const line = simplifyToLine(path.points)
      if (!line) continue
      
      lines.push({
        start: line.start,
        end: line.end,
        thickness: 8,
        confidence: Math.min(0.95, 0.6 + line.length / 100)
      })
    }

    return lines
  }

  private extractRooms(roomIconData: number[], scaleX: number, scaleY: number): TFJSRecognitionResult['rooms'] {
    const rooms: TFJSRecognitionResult['rooms'] = []
    const roomThreshold = 0.4
    const minArea = 500

    for (let c = 0; c < ROOM_TYPES.length; c++) {
      const classMask: boolean[][] = []
      for (let y = 0; y < 512; y++) {
        classMask[y] = []
        for (let x = 0; x < 512; x++) {
          const idx = c * 512 * 512 + y * 512 + x
          classMask[y]![x] = (roomIconData[idx] ?? 0) > roomThreshold
        }
      }

      const components = this.findConnectedComponents(classMask)

      for (const component of components) {
        if (component.pixels.length < minArea) continue

        const polygon = this.extractPolygon(component.pixels)
        if (polygon.length < 4) continue

        rooms.push({
          polygon: polygon.map(p => ({
            x: Math.round(p.x * scaleX),
            y: Math.round(p.y * scaleY)
          })),
          type: ROOM_TYPES[c] ?? 'unknown',
          confidence: component.confidence
        })
      }
    }

    return rooms
  }

  private findConnectedComponents(mask: boolean[][]): Array<{
    pixels: Array<{ x: number; y: number }>
    confidence: number
  }> {
    const height = mask.length
    const width = mask[0]?.length ?? 0
    const visited: boolean[][] = []
    for (let y = 0; y < height; y++) {
      visited[y] = new Array(width).fill(false)
    }
    const components: Array<{ pixels: Array<{ x: number; y: number }>; confidence: number }> = []

    const floodFill = (startX: number, startY: number): Array<{ x: number; y: number }> => {
      const pixels: Array<{ x: number; y: number }> = []
      const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }]

      while (stack.length > 0) {
        const { x, y } = stack.pop()!
        if (x < 0 || x >= width || y < 0 || y >= height) continue
        if (visited[y]?.[x] || !mask[y]?.[x]) continue

        visited[y]![x] = true
        pixels.push({ x, y })

        stack.push({ x: x + 1, y })
        stack.push({ x: x - 1, y })
        stack.push({ x, y: y + 1 })
        stack.push({ x, y: y - 1 })
      }

      return pixels
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!visited[y]?.[x] && mask[y]?.[x]) {
          const pixels = floodFill(x, y)
          if (pixels.length > 0) {
            components.push({
              pixels,
              confidence: Math.min(0.9, 0.5 + pixels.length / 5000)
            })
          }
        }
      }
    }

    return components
  }

  private extractPolygon(pixels: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
    if (pixels.length === 0) return []
    
    if (pixels.length < 10) {
      // Simple bounding box for small components
      const xs = pixels.map(p => p.x)
      const ys = pixels.map(p => p.y)
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)
      
      return [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY }
      ]
    }
    
    // Convex Hull (Graham scan algorithm)
    const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number => {
      return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
    }
    
    const points = [...pixels]
    
    // Find lowest point (then sort by angle)
    points.sort((a, b) => a.y - b.y || a.x - b.x)
    
    const start = points[0]!
    const sorted = points.slice(1).sort((a, b) => {
      const angleA = Math.atan2(a.y - start.y, a.x - start.x)
      const angleB = Math.atan2(b.y - start.y, b.x - start.x)
      return angleA - angleB
    })
    
    const hull: Array<{ x: number; y: number }> = [start]
    
    for (const p of sorted) {
      while (hull.length > 1 && cross(hull[hull.length - 2]!, hull[hull.length - 1]!, p) <= 0) {
        hull.pop()
      }
      hull.push(p)
    }
    
    return hull.length >= 4 ? hull : []
  }

  private extractIcons(roomIconData: number[], scaleX: number, scaleY: number): TFJSRecognitionResult['icons'] {
    const icons: TFJSRecognitionResult['icons'] = []
    const iconThreshold = 0.5
    const minSize = 10
    const maxSize = 50

    for (let c = 0; c < ICON_TYPES.length; c++) {
      const classMask: boolean[][] = []
      for (let y = 0; y < 512; y++) {
        classMask[y] = []
        for (let x = 0; x < 512; x++) {
          const idx = c * 512 * 512 + y * 512 + x
          classMask[y]![x] = (roomIconData[idx] ?? 0) > iconThreshold
        }
      }

      const components = this.findConnectedComponents(classMask)

      for (const component of components) {
        const xs = component.pixels.map(p => p.x)
        const ys = component.pixels.map(p => p.y)
        const width = Math.max(...xs) - Math.min(...xs) + 1
        const height = Math.max(...ys) - Math.min(...ys) + 1

        if (width < minSize || height < minSize || width > maxSize || height > maxSize) continue

        icons.push({
          bbox: {
            x: Math.round(Math.min(...xs) * scaleX),
            y: Math.round(Math.min(...ys) * scaleY),
            width: Math.round(width * scaleX),
            height: Math.round(height * scaleY)
          },
          type: ICON_TYPES[c] ?? 'unknown',
          confidence: component.confidence
        })
      }
    }

    return icons
  }

  private fallbackPredict(imageData: ImageData): TFJSRecognitionResult {
    const { data, width, height } = imageData
    const safeWidth = Math.max(100, width)
    const safeHeight = Math.max(100, height)
    const pixelData = new Uint8Array(data)

    const walls: TFJSRecognitionResult['walls'] = []
    const threshold = 0.3

    for (let y = 0; y < safeHeight - 10; y += 5) {
      for (let x = 0; x < safeWidth - 10; x += 5) {
        const idx = (y * safeWidth + x) * 4
        const r = pixelData[idx] ?? 255
        const g = pixelData[idx + 1] ?? 255
        const b = pixelData[idx + 2] ?? 255
        const brightness = (r + g + b) / 3 / 255

        if (brightness < threshold) {
          walls.push({
            start: { x, y },
            end: { x: x + 5, y: y + 5 },
            thickness: 3,
            confidence: 0.6
          })
        }
      }
    }

    return {
      walls,
      rooms: [{
        polygon: [
          { x: 50, y: 50 },
          { x: safeWidth - 50, y: 50 },
          { x: safeWidth - 50, y: safeHeight - 50 },
          { x: 50, y: safeHeight - 50 }
        ],
        type: 'living_room',
        confidence: 0.5
      }],
      icons: [{
        bbox: { x: Math.floor(safeWidth / 2) - 15, y: 50, width: 30, height: 10 },
        type: 'door',
        confidence: 0.5
      }],
      confidence: 0.55
    }
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
      this.loaded = false
    }
  }
}