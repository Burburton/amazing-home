import { useState } from 'react'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { detectWallsFromImage, createDetectionDebugCanvas } from '@domain/floorplan/wall-detection'

function WallDetectionPanel() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(100)
  const [minLength, setMinLength] = useState(20)
  
  const { document, addWall } = useFloorPlanStore()
  
  const hasImage = document.sourceImage?.objectUrl
  
  const handleDetect = async () => {
    if (!hasImage) return
    
    setIsDetecting(true)
    
    try {
      const img = new window.Image()
      img.src = document.sourceImage!.objectUrl
      
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.onerror = () => resolve()
      })
      
      const walls = detectWallsFromImage(img, { threshold, minLength })
      
      const debugCanvas = createDetectionDebugCanvas(img, walls)
      setPreviewUrl(debugCanvas.toDataURL())
      
      walls.forEach(wall => addWall(wall.start, wall.end))
    } finally {
      setIsDetecting(false)
    }
  }
  
  const handleClearPreview = () => {
    setPreviewUrl(null)
  }
  
  return (
    <div className="p-4 space-y-3">
      <div className="text-xs font-medium text-gray-600">
        Wall Detection (Experimental)
      </div>
      
      <div className="text-xs text-gray-400">
        Automatically detect walls from uploaded floor plan image. 
        Works best on clean floor plans with dark wall lines.
      </div>
      
      {!hasImage && (
        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
          Upload a floor plan image first to enable detection.
        </div>
      )}
      
      {hasImage && (
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Brightness Threshold ({threshold})
            </label>
            <input
              type="range"
              min={50}
              max={200}
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400">
              Lower = more walls detected (including noise)
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Minimum Line Length ({minLength}px)
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={minLength}
              onChange={(e) => setMinLength(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <button
            onClick={handleDetect}
            disabled={isDetecting}
            className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          >
            {isDetecting ? 'Detecting...' : 'Detect Walls'}
          </button>
          
          {previewUrl && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Preview (red = detected walls)</div>
              <img 
                src={previewUrl} 
                alt="Detection preview" 
                className="w-full border border-gray-200 rounded"
              />
              <button
                onClick={handleClearPreview}
                className="w-full mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                Clear Preview
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-400 border-t border-gray-200 pt-2 mt-2">
        Note: This is a spike feature. Only detects horizontal/vertical lines.
        Manual adjustment may be needed after detection.
      </div>
    </div>
  )
}

export default WallDetectionPanel