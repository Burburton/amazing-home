import { useState } from 'react'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { detectWallsFromImage, createDetectionDebugCanvas, createEdgeDebugCanvas } from '@domain/floorplan/wall-detection'
import { Wall } from '@domain/floorplan/types'

interface CandidateWall extends Wall {
  confidence: number
  accepted: boolean
  rejected: boolean
}

function WallDetectionPanel() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [edgePreviewUrl, setEdgePreviewUrl] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [minLineLength, setMinLineLength] = useState(50)
  const [angleTolerance, setAngleTolerance] = useState(5)
  const [cannyLow, setCannyLow] = useState(50)
  const [cannyHigh, setCannyHigh] = useState(150)
  const [houghThreshold, setHoughThreshold] = useState(100)
  const [maxLineGap, setMaxLineGap] = useState(10)
  
  const [candidateWalls, setCandidateWalls] = useState<CandidateWall[]>([])
  
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
      
      const options = {
        cannyLowThreshold: cannyLow,
        cannyHighThreshold: cannyHigh,
        houghThreshold,
        minLineLength,
        maxLineGap,
        angleTolerance,
        minLength: minLineLength,
      }
      
      const walls = detectWallsFromImage(img, options)
      
      const candidates: CandidateWall[] = walls.map((wall, index) => ({
        ...wall,
        id: `candidate-${index}`,
        confidence: Math.min(100, Math.max(50, 100 - index * 5)),
        accepted: false,
        rejected: false,
      }))
      
      setCandidateWalls(candidates)
      
      const debugCanvas = createDetectionDebugCanvas(img, walls)
      setPreviewUrl(debugCanvas.toDataURL())
      
      const edgeCanvas = createEdgeDebugCanvas(img, options)
      setEdgePreviewUrl(edgeCanvas.toDataURL())
    } finally {
      setIsDetecting(false)
    }
  }
  
  const handleAcceptCandidate = (candidateId: string) => {
    setCandidateWalls(prev => prev.map(c => 
      c.id === candidateId ? { ...c, accepted: true, rejected: false } : c
    ))
  }
  
  const handleRejectCandidate = (candidateId: string) => {
    setCandidateWalls(prev => prev.map(c => 
      c.id === candidateId ? { ...c, rejected: true, accepted: false } : c
    ))
  }
  
  const handleAcceptAll = () => {
    setCandidateWalls(prev => prev.map(c => ({ ...c, accepted: true, rejected: false })))
  }
  
  const handleRejectAll = () => {
    setCandidateWalls(prev => prev.map(c => ({ ...c, rejected: true, accepted: false })))
  }
  
  const handleApplyAccepted = () => {
    const accepted = candidateWalls.filter(c => c.accepted && !c.rejected)
    accepted.forEach(wall => {
      addWall(wall.start, wall.end)
    })
    setCandidateWalls([])
    setPreviewUrl(null)
    setEdgePreviewUrl(null)
  }
  
  const handleClearPreview = () => {
    setPreviewUrl(null)
    setEdgePreviewUrl(null)
    setCandidateWalls([])
  }
  
  const getWallLength = (wall: Wall) => {
    return Math.round(Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    ))
  }
  
  const getWallDirection = (wall: Wall) => {
    const dx = wall.end.x - wall.start.x
    const dy = wall.end.y - wall.start.y
    if (Math.abs(dx) > Math.abs(dy)) return 'Horizontal'
    return 'Vertical'
  }
  
  const acceptedCount = candidateWalls.filter(c => c.accepted).length
  const rejectedCount = candidateWalls.filter(c => c.rejected).length
  const pendingCount = candidateWalls.filter(c => !c.accepted && !c.rejected).length
  
  return (
    <div className="p-4 space-y-3">
      <div className="text-xs font-medium text-gray-600">
        Wall Detection (Canny + Hough)
      </div>
      
      <div className="text-xs text-gray-400">
        Industry-standard edge detection using Canny + Hough transform.
        Works on floor plans with walls at any angle.
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
              Min Line Length ({minLineLength}px)
            </label>
            <input
              type="range"
              min={20}
              max={200}
              value={minLineLength}
              onChange={(e) => setMinLineLength(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400">
              Higher = fewer, longer walls only
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Angle Tolerance ({angleTolerance}°)
            </label>
            <input
              type="range"
              min={1}
              max={15}
              value={angleTolerance}
              onChange={(e) => setAngleTolerance(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400">
              Higher = allow more diagonal walls
            </div>
          </div>
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced Settings'}
          </button>
          
          {showAdvanced && (
            <div className="space-y-2 p-2 bg-gray-50 rounded border border-gray-200">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Canny Low ({cannyLow})
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={cannyLow}
                  onChange={(e) => setCannyLow(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Canny High ({cannyHigh})
                </label>
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={cannyHigh}
                  onChange={(e) => setCannyHigh(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Hough Threshold ({houghThreshold})
                </label>
                <input
                  type="range"
                  min={20}
                  max={300}
                  value={houghThreshold}
                  onChange={(e) => setHoughThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400">
                  Higher = fewer, more prominent lines
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Max Line Gap ({maxLineGap}px)
                </label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={maxLineGap}
                  onChange={(e) => setMaxLineGap(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400">
                  Connects gaps within this distance
                </div>
              </div>
            </div>
          )
          }
          
          <button
            onClick={handleDetect}
            disabled={isDetecting}
            className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          >
            {isDetecting ? 'Detecting...' : 'Detect Walls'}
          </button>
          
          {previewUrl && (
            <div className="mt-3 space-y-2">
              <div>
                <div className="text-xs text-gray-500 mb-1">Edge Detection Preview</div>
                <img 
                  src={edgePreviewUrl ?? ''} 
                  alt="Edge detection preview" 
                  className="w-full border border-gray-200 rounded"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Wall Detection (red = detected walls)</div>
                <img 
                  src={previewUrl} 
                  alt="Detection preview" 
                  className="w-full border border-gray-200 rounded"
                />
              </div>
            </div>
          )}
          
          {candidateWalls.length > 0 && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <div className="text-xs font-medium text-gray-600 mb-2">
                Review Candidates ({candidateWalls.length} detected)
              </div>
              
              <div className="flex gap-1 mb-2">
                <button
                  onClick={handleAcceptAll}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Reject All
                </button>
              </div>
              
              <div className="text-xs text-gray-400 mb-2">
                Accepted: {acceptedCount} | Rejected: {rejectedCount} | Pending: {pendingCount}
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-1">
                {candidateWalls.map(candidate => (
                  <div 
                    key={candidate.id}
                    className={`flex items-center justify-between p-1 rounded text-xs ${
                      candidate.accepted 
                        ? 'bg-green-50 border border-green-200' 
                        : candidate.rejected 
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <span className="text-gray-700">
                        {getWallDirection(candidate)} wall
                      </span>
                      <span className="text-gray-400 ml-1">
                        ({getWallLength(candidate)}px)
                      </span>
                      <span className="text-gray-400 ml-1">
                        conf: {candidate.confidence}%
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAcceptCandidate(candidate.id)}
                        disabled={candidate.accepted}
                        className={`px-1.5 py-0.5 rounded ${
                          candidate.accepted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                        }`}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleRejectCandidate(candidate.id)}
                        disabled={candidate.rejected}
                        className={`px-1.5 py-0.5 rounded ${
                          candidate.rejected
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleApplyAccepted}
                  disabled={acceptedCount === 0}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
                >
                  Apply {acceptedCount} Accepted Walls
                </button>
                <button
                  onClick={handleClearPreview}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-400 border-t border-gray-200 pt-2 mt-2">
        Using Canny edge detection + Hough transform. Detects walls at any angle.
        Adjust parameters if detection is too sensitive or missing walls.
      </div>
    </div>
  )
}

export default WallDetectionPanel