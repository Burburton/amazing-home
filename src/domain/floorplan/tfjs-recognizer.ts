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

// Local TF.js model from TF2DeepFloorplan conversion
// Use relative path for GitHub Pages compatibility
const MODEL_URL = './tfjs-model/model.json'

const ICON_TYPES = [
  'door', 'window', 'bed', 'table', 'sofa', 'chair',
  'refrigerator', 'sink', 'toilet', 'bathtub'
]

export class FloorPlanRecognizer {
  private model: tf.GraphModel | null = null
  private loaded: boolean = false

  async loadModel(): Promise<void> {
    if (this.loaded) return

    try {
      console.log('Loading TF.js floor plan model from:', MODEL_URL)
      this.model = await tf.loadGraphModel(MODEL_URL)
      this.loaded = true
      console.log('Model loaded successfully')
    } catch (error) {
      console.error('Model load failed, using fallback:', error)
      this.loaded = true
    }
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
    const safeWidth = Math.max(1, width)
    const safeHeight = Math.max(1, height)

    const rgbData = new Float32Array(safeWidth * safeHeight * 3)
    const pixelData = new Uint8Array(data)

    for (let i = 0; i < safeWidth * safeHeight; i++) {
      const pixelIdx = i * 4
      const r = pixelData[pixelIdx] ?? 0
      const g = pixelData[pixelIdx + 1] ?? 0
      const b = pixelData[pixelIdx + 2] ?? 0

      rgbData[i * 3] = (r / 255 - 0.485) / 0.229
      rgbData[i * 3 + 1] = (g / 255 - 0.456) / 0.224
      rgbData[i * 3 + 2] = (b / 255 - 0.406) / 0.225
    }

    return tf.tensor3d(rgbData, [safeHeight, safeWidth, 3])
  }

  private postprocessPrediction(
    roomIconMask: tf.Tensor,
    wallMask: tf.Tensor,
    width: number,
    height: number
  ): TFJSRecognitionResult {
    const walls: TFJSRecognitionResult['walls'] = []
    const rooms: TFJSRecognitionResult['rooms'] = []
    const icons: TFJSRecognitionResult['icons'] = []

    const roomIconData = Array.from(roomIconMask.dataSync())
    const wallData = Array.from(wallMask.dataSync())

    const scale_x = width / 512
    const scale_y = height / 512

    const wallThreshold = 0.3
    for (let y = 0; y < 512; y += 4) {
      for (let x = 0; x < 512; x += 4) {
        const idx = y * 512 + x
        const wallValue = wallData[idx] ?? 0

        if (wallValue > wallThreshold) {
          walls.push({
            start: { x: Math.round(x * scale_x), y: Math.round(y * scale_y) },
            end: { x: Math.round((x + 4) * scale_x), y: Math.round((y + 4) * scale_y) },
            thickness: Math.round(4 * Math.max(scale_x, scale_y)),
            confidence: wallValue
          })
        }
      }
    }

    const iconChannels = 9
    for (let c = 0; c < iconChannels; c++) {
      for (let y = 0; y < 512; y += 8) {
        for (let x = 0; x < 512; x += 8) {
          const idx = c * 512 * 512 + y * 512 + x
          const iconValue = roomIconData[idx] ?? 0

          if (iconValue > 0.5) {
            const iconType = ICON_TYPES[c] ?? 'unknown'

            icons.push({
              bbox: {
                x: Math.round(x * scale_x),
                y: Math.round(y * scale_y),
                width: Math.round(8 * scale_x),
                height: Math.round(8 * scale_y)
              },
              type: iconType,
              confidence: iconValue
            })
          }
        }
      }
    }

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