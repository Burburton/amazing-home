import { useState } from 'react'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { detectWallsFromImage, createDetectionDebugCanvas } from '@domain/floorplan/wall-detection'
import { Wall } from '@domain/floorplan/types'

interface CandidateWall extends Wall {
  confidence: number
  accepted: boolean
  rejected: boolean
}

function WallDetectionPanel() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(100)
  const [minLength, setMinLength] = useState(20)
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
      
      const walls = detectWallsFromImage(img, { threshold, minLength })
      
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
  }
  
  const handleClearPreview = () => {
    setPreviewUrl(null)
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
        Note: This is a spike feature. Only detects horizontal/vertical lines.
        Manual adjustment may be needed after detection.
      </div>
    </div>
  )
}

export default WallDetectionPanel