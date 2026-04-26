import { useState } from 'react'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import {
  recognizeFromImageUrl,
  checkApiHealth,
  RecognitionResult,
  DetectedWall,
  DetectedRoom,
  DetectedIcon,
} from '@services/recognitionApi'
import { localRecognizer, LocalRecognitionResult } from '@services/localRecognizer'

type DetectionMode = 'api' | 'local'

function AIRecognitionPanel() {
  const [mode, setMode] = useState<DetectionMode>('local')
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [result, setResult] = useState<RecognitionResult | LocalRecognitionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')
  const [tfjsLoaded, setTfjsLoaded] = useState(false)
  
  const [detectWalls, setDetectWalls] = useState(true)
  const [detectRooms, setDetectRooms] = useState(true)
  const [detectIcons, setDetectIcons] = useState(true)
  
  const { document, addWall } = useFloorPlanStore()
  const hasImage = document.sourceImage?.objectUrl
  
  const checkApi = async () => {
    const healthy = await checkApiHealth()
    setApiStatus(healthy ? 'ok' : 'error')
  }
  
  const loadTfjsModel = async () => {
    try {
      await localRecognizer.loadModel()
      setTfjsLoaded(true)
    } catch {
      setError('Failed to load TF.js model')
    }
  }
  
  const handleRecognize = async () => {
    if (!hasImage) return
    
    setIsRecognizing(true)
    setError(null)
    setResult(null)
    
    try {
      if (mode === 'local') {
        if (!tfjsLoaded) {
          await loadTfjsModel()
        }
        
        const img = new window.Image()
        img.src = document.sourceImage!.objectUrl
        
        await new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => resolve()
        })
        
        const canvas = window.document.createElement('canvas')
        canvas.width = img.width || 512
        canvas.height = img.height || 512
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas context unavailable')
        ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const recognitionResult = await localRecognizer.recognize(imageData)
        
        setResult(recognitionResult)
      } else {
        const imageUrl = document.sourceImage!.objectUrl
        const width = document.sourceImage!.width
        const height = document.sourceImage!.height
        
        const recognitionResult = await recognizeFromImageUrl(
          imageUrl,
          width,
          height,
          {
            detect_walls: detectWalls,
            detect_rooms: detectRooms,
            detect_icons: detectIcons,
          }
        )
        
        setResult(recognitionResult)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recognition failed')
    } finally {
      setIsRecognizing(false)
    }
  }
  
  const handleApplyWalls = () => {
    if (!result?.walls) return
    
    result.walls.forEach((wall: DetectedWall | { start: { x: number; y: number }; end: { x: number; y: number }; thickness: number; confidence: number }) => {
      addWall(wall.start, wall.end)
    })
    
    setResult(null)
  }
  
  const handleClearResult = () => {
    setResult(null)
    setError(null)
  }
  
  return (
    <div className="ai-recognition-panel">
      <div className="panel-header">
        <h3>AI Recognition</h3>
        <div className="mode-selector">
          <button
            className={mode === 'api' ? 'active' : ''}
            onClick={() => setMode('api')}
          >
            API
          </button>
          <button
            className={mode === 'local' ? 'active' : ''}
            onClick={() => setMode('local')}
          >
            Local
          </button>
        </div>
      </div>
      
      {mode === 'local' && (
        <div className="tfjs-status">
          {!tfjsLoaded ? (
            <button onClick={loadTfjsModel}>
              Load TF.js Model
            </button>
          ) : (
            <span className="status-badge ok">✓ TF.js Loaded</span>
          )}
        </div>
      )}
      
      {mode === 'api' && (
        <div className="api-status">
          <button onClick={checkApi} disabled={apiStatus !== 'unknown'}>
            Check API
          </button>
          <span className={`status-badge ${apiStatus}`}>
            {apiStatus === 'unknown' ? 'Unknown' : apiStatus === 'ok' ? '✓ OK' : '✗ Error'}
          </span>
        </div>
      )}
      
      <div className="detection-options">
        <label>
          <input
            type="checkbox"
            checked={detectWalls}
            onChange={e => setDetectWalls(e.target.checked)}
          />
          Walls
        </label>
        <label>
          <input
            type="checkbox"
            checked={detectRooms}
            onChange={e => setDetectRooms(e.target.checked)}
          />
          Rooms
        </label>
        <label>
          <input
            type="checkbox"
            checked={detectIcons}
            onChange={e => setDetectIcons(e.target.checked)}
          />
          Icons
        </label>
      </div>
      
      <button
        className="recognize-button"
        onClick={handleRecognize}
        disabled={!hasImage || isRecognizing}
      >
        {isRecognizing ? 'Recognizing...' : 'Recognize Floor Plan'}
      </button>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={handleClearResult}>Clear</button>
        </div>
      )}
      
      {result && (
        <div className="recognition-result">
          <div className="result-header">
            <span className="model-version">{result.model_version}</span>
            <span className="processing-time">{result.processing_time_ms}ms</span>
            <span className="confidence">Confidence: {Math.round(result.confidence * 100)}%</span>
          </div>
          
          {detectWalls && result.walls.length > 0 && (
            <div className="result-section">
              <h4>Walls ({result.walls.length})</h4>
              <button onClick={handleApplyWalls} className="apply-button">
                Apply All Walls
              </button>
            </div>
          )}
          
          {detectRooms && result.rooms.length > 0 && (
            <div className="result-section">
              <h4>Rooms ({result.rooms.length})</h4>
              <ul>
                {result.rooms.map((room: DetectedRoom, i: number) => (
                  <li key={i}>
                    <span className="room-type">{room.type}</span>
                    <span className="room-confidence">{Math.round(room.confidence * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {detectIcons && result.icons.length > 0 && (
            <div className="result-section">
              <h4>Icons ({result.icons.length})</h4>
              <ul>
                {result.icons.map((icon: DetectedIcon, i: number) => (
                  <li key={i}>
                    <span className="icon-type">{icon.type}</span>
                    <span className="icon-confidence">{Math.round(icon.confidence * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button onClick={handleClearResult} className="clear-button">
            Clear Results
          </button>
        </div>
      )}
      
      {!hasImage && (
        <p className="no-image-hint">
          Upload a floor plan image first
        </p>
      )}
    </div>
  )
}

export default AIRecognitionPanel