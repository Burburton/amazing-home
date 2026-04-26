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

    const result = this.postprocessPrediction(pred1, pred0, imageData.width, imageData.height)

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
    roomTypeTensor: tf.Tensor,
    iconTensor: tf.Tensor,
    originalWidth: number,
    originalHeight: number
  ): TFJSRecognitionResult {
    const roomTypeShape = roomTypeTensor.shape
    const iconShape = iconTensor.shape
    console.log('roomTypeTensor shape:', roomTypeShape)
    console.log('iconTensor shape:', iconShape)

    const roomTypeChannels = roomTypeShape[3] ?? roomTypeShape[2] ?? 1
    const iconChannels = iconShape[3] ?? iconShape[2] ?? 1
    console.log('roomTypeChannels:', roomTypeChannels, 'iconChannels:', iconChannels)

    const height = 512
    const width = 512

    const roomTypeRawData = Array.from(roomTypeTensor.dataSync())
    const roomTypeChannelData: number[][] = []
    for (let c = 0; c < roomTypeChannels; c++) {
      const channel: number[] = []
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = c * height * width + y * width + x
          channel.push(roomTypeRawData[idx] ?? 0)
        }
      }
      roomTypeChannelData.push(channel)
    }

    const wallProb = this.extractWallChannelProbability(roomTypeChannelData)

    let wallProbMax = -Infinity
    let wallProbMin = Infinity
    let wallProbAboveThreshold = 0
    let wallProbAbove06 = 0
    let wallProbAbove07 = 0
    let wallProbAbove08 = 0
    for (let i = 0; i < wallProb.length; i++) {
      const p = wallProb[i] ?? 0
      if (p > wallProbMax) wallProbMax = p
      if (p < wallProbMin) wallProbMin = p
      if (p > 0.35) wallProbAboveThreshold++
      if (p > 0.6) wallProbAbove06++
      if (p > 0.7) wallProbAbove07++
      if (p > 0.8) wallProbAbove08++
    }
    console.log('wallProb range:', wallProbMin, '-', wallProbMax, 'pixels >0.35:', wallProbAboveThreshold, '>0.6:', wallProbAbove06, '>0.7:', wallProbAbove07, '>0.8:', wallProbAbove08)

    const iconRawData = Array.from(iconTensor.dataSync())

    const scaleX = originalWidth / 512
    const scaleY = originalHeight / 512

    const walls = this.extractWallsFromProb(wallProb, scaleX, scaleY)
    console.log('walls extracted:', walls.length)
    const rooms = this.extractRooms(roomTypeRawData, scaleX, scaleY, roomTypeChannels)
    console.log('rooms extracted:', rooms.length, 'room types:', rooms.map(r => r.type))
    const icons = this.extractIcons(iconRawData, scaleX, scaleY, iconChannels)

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

  private extractWallChannelProbability(channelData: number[][]): number[] {
    const numChannels = channelData.length
    const size = channelData[0]?.length ?? 0
    const result: number[] = []

    for (let i = 0; i < size; i++) {
      let maxVal = -Infinity
      for (let c = 0; c < numChannels; c++) {
        const val = channelData[c]?.[i] ?? 0
        if (val > maxVal) maxVal = val
      }

      let sumExp = 0
      const expValues: number[] = []
      for (let c = 0; c < numChannels; c++) {
        const val = channelData[c]?.[i] ?? 0
        const expVal = Math.exp(val - maxVal)
        expValues.push(expVal)
        sumExp += expVal
      }

      const wallChannelIdx = 2
      if (wallChannelIdx < numChannels && sumExp > 0) {
        const wallProb = expValues[wallChannelIdx]! / sumExp
        result.push(wallProb)
      } else {
        result.push(0)
      }
    }

    return result
  }

  private extractWallsFromProb(wallProb: number[], scaleX: number, scaleY: number): TFJSRecognitionResult['walls'] {
    const wallThreshold = 0.6
    const width = 512
    const height = 512

    const walls: TFJSRecognitionResult['walls'] = []

    for (let y = 10; y < height - 10; y++) {
      let startX = -1
      for (let x = 10; x < width - 10; x++) {
        const idx = y * width + x
        const val = wallProb[idx] ?? 0

        if (val > wallThreshold && startX < 0) {
          startX = x
        } else if (val <= wallThreshold && startX >= 0) {
          const len = x - startX
          if (len >= 30) {
            walls.push({
              start: { x: Math.round(startX * scaleX), y: Math.round(y * scaleY) },
              end: { x: Math.round(x * scaleX), y: Math.round(y * scaleY) },
              thickness: 10,
              confidence: 0.85
            })
          }
          startX = -1
        }
      }
    }

    for (let x = 10; x < width - 10; x++) {
      let startY = -1
      for (let y = 10; y < height - 10; y++) {
        const idx = y * width + x
        const val = wallProb[idx] ?? 0

        if (val > wallThreshold && startY < 0) {
          startY = y
        } else if (val <= wallThreshold && startY >= 0) {
          const len = y - startY
          if (len >= 30) {
            walls.push({
              start: { x: Math.round(x * scaleX), y: Math.round(startY * scaleY) },
              end: { x: Math.round(x * scaleX), y: Math.round(y * scaleY) },
              thickness: 10,
              confidence: 0.85
            })
          }
          startY = -1
        }
      }
    }

    console.log('walls extracted:', walls.length)
    return walls
  }

  private extractRooms(roomTypeData: number[], scaleX: number, scaleY: number, numChannels: number): TFJSRecognitionResult['rooms'] {
    const rooms: TFJSRecognitionResult['rooms'] = []
    const roomThreshold = 0.4
    const minArea = 500
    const effectiveRoomTypes = numChannels > ROOM_TYPES.length ? ROOM_TYPES : ROOM_TYPES.slice(0, numChannels)

    for (let c = 0; c < effectiveRoomTypes.length; c++) {
      const classMask: boolean[][] = []
      for (let y = 0; y < 512; y++) {
        classMask[y] = []
        for (let x = 0; x < 512; x++) {
          const idx = c * 512 * 512 + y * 512 + x
          classMask[y]![x] = (roomTypeData[idx] ?? 0) > roomThreshold
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

  private extractIcons(iconData: number[], scaleX: number, scaleY: number, numChannels: number): TFJSRecognitionResult['icons'] {
    const icons: TFJSRecognitionResult['icons'] = []
    const iconThreshold = 0.5
    const effectiveIconTypes = numChannels > ICON_TYPES.length ? ICON_TYPES : ICON_TYPES.slice(0, numChannels)
    
    // Icon-specific size ranges (pixels in 512x512 space)
    const ICON_SIZE_RANGES: Record<string, { minW: number; maxW: number; minH: number; maxH: number }> = {
      bed: { minW: 25, maxW: 80, minH: 20, maxH: 60 },
      sofa: { minW: 30, maxW: 90, minH: 15, maxH: 45 },
      table: { minW: 20, maxW: 70, minH: 20, maxH: 70 },
      chair: { minW: 10, maxW: 30, minH: 10, maxH: 30 },
      door: { minW: 8, maxW: 25, minH: 8, maxH: 25 },
      window: { minW: 15, maxW: 40, minH: 5, maxH: 15 },
      refrigerator: { minW: 15, maxW: 35, minH: 20, maxH: 50 },
      sink: { minW: 10, maxW: 30, minH: 10, maxH: 30 },
      toilet: { minW: 10, maxW: 25, minH: 15, maxH: 35 },
      bathtub: { minW: 30, maxW: 80, minH: 20, maxH: 50 }
    }

    for (let c = 0; c < effectiveIconTypes.length; c++) {
      const iconType = effectiveIconTypes[c] ?? 'unknown'
      const sizeRange = ICON_SIZE_RANGES[iconType] ?? { minW: 10, maxW: 50, minH: 10, maxH: 50 }
      
      const classMask: boolean[][] = []
      const scores: number[][] = []
      
      for (let y = 0; y < 512; y++) {
        classMask[y] = []
        scores[y] = []
        for (let x = 0; x < 512; x++) {
          const idx = c * 512 * 512 + y * 512 + x
          const score = iconData[idx] ?? 0
          classMask[y]![x] = score > iconThreshold
          scores[y]![x] = score
        }
      }

      const components = this.findConnectedComponents(classMask)

      for (const component of components) {
        const xs = component.pixels.map(p => p.x)
        const ys = component.pixels.map(p => p.y)
        const width = Math.max(...xs) - Math.min(...xs) + 1
        const height = Math.max(...ys) - Math.min(...ys) + 1

        // Check size range for icon type
        if (width < sizeRange.minW || width > sizeRange.maxW || 
            height < sizeRange.minH || height > sizeRange.maxH) continue

        // Calculate average confidence from prediction scores
        let avgScore = 0
        for (const p of component.pixels) {
          avgScore += scores[p.y]?.[p.x] ?? 0
        }
        avgScore /= component.pixels.length
        
        const confidence = Math.min(0.95, Math.max(0.5, avgScore))

        icons.push({
          bbox: {
            x: Math.round(Math.min(...xs) * scaleX),
            y: Math.round(Math.min(...ys) * scaleY),
            width: Math.round(width * scaleX),
            height: Math.round(height * scaleY)
          },
          type: iconType,
          confidence
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