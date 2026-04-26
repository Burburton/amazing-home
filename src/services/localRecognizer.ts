import { FloorPlanRecognizer } from '@domain/floorplan/tfjs-recognizer'

export interface LocalRecognitionResult {
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
  processing_time_ms: number
  model_version: string
}

export class LocalRecognizer {
  private recognizer: FloorPlanRecognizer | null = null
  private loading: boolean = false
  private loaded: boolean = false

  async loadModel(): Promise<void> {
    if (this.loaded || this.loading) return
    
    this.loading = true
    
    try {
      this.recognizer = new FloorPlanRecognizer()
      await this.recognizer.loadModel()
      this.loaded = true
    } catch (error) {
      console.error('Failed to load TF.js model:', error)
      throw error
    } finally {
      this.loading = false
    }
  }

  isLoaded(): boolean {
    return this.loaded
  }

  isLoading(): boolean {
    return this.loading
  }

  async recognize(
    imageData: ImageData
  ): Promise<LocalRecognitionResult> {
    if (!this.loaded || !this.recognizer) {
      throw new Error('Model not loaded. Call loadModel() first.')
    }

    const startTime = performance.now()

    const result = await this.recognizer.predict(imageData)

    const elapsedMs = Math.round(performance.now() - startTime)

    return {
      walls: result.walls || [],
      rooms: result.rooms || [],
      icons: result.icons || [],
      confidence: result.confidence || 0.75,
      processing_time_ms: elapsedMs,
      model_version: 'tfjs-browser-v1'
    }
  }

  unload(): void {
    if (this.recognizer) {
      this.recognizer.dispose()
      this.recognizer = null
      this.loaded = false
    }
  }
}

export const localRecognizer = new LocalRecognizer()