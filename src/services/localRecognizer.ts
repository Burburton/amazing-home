import { FloorPlanRecognizer, ModelLoadProgress } from '@domain/floorplan/tfjs-recognizer'

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
  private loadProgress: ModelLoadProgress | null = null

  async loadModel(onProgress?: (progress: ModelLoadProgress) => void): Promise<void> {
    if (this.loaded || this.loading) return
    
    this.loading = true
    this.loadProgress = { status: 'loading', loadedBytes: 0, totalBytes: 113000000, percentage: 0 }
    
    try {
      this.recognizer = new FloorPlanRecognizer()
      await this.recognizer.loadModel((progress) => {
        this.loadProgress = progress
        onProgress?.(progress)
      })
      this.loaded = true
    } catch (error) {
      this.loadProgress = { status: 'error', loadedBytes: 0, totalBytes: 113000000, percentage: 0 }
      onProgress?.(this.loadProgress)
      console.error('Failed to load TF.js model:', error)
      throw error
    } finally {
      this.loading = false
    }
  }

  isLoaded(): boolean {
    return this.loaded && this.recognizer?.isLoaded() === true
  }

  isLoading(): boolean {
    return this.loading
  }

  getLoadProgress(): ModelLoadProgress | null {
    return this.loadProgress
  }

  async recognize(imageData: ImageData): Promise<LocalRecognitionResult> {
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
      model_version: 'tfjs-cubicasa5k-v1'
    }
  }

  unload(): void {
    if (this.recognizer) {
      this.recognizer.dispose()
      this.recognizer = null
      this.loaded = false
      this.loadProgress = null
    }
  }
}

export const localRecognizer = new LocalRecognizer()