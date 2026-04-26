import { useState } from 'react'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { 
  detectWallIssues, 
  getFixAction, 
  getIssueIcon,
  WallIssue 
} from '@domain/floorplan/wall-correction'

function WallCorrectionPanel() {
  const [issues, setIssues] = useState<WallIssue[]>([])
  const [isScanning, setIsScanning] = useState(false)
  
  const { document, updateWall, deleteWall } = useFloorPlanStore()
  
  const handleScan = () => {
    setIsScanning(true)
    const detected = detectWallIssues(document.walls)
    setIssues(detected)
    setIsScanning(false)
  }
  
  const handleFixGap = (issue: WallIssue) => {
    const walls = document.walls.filter(w => issue.wallIds.includes(w.id))
    if (walls.length !== 2) return
    
    const wallA = walls[0]!
    const wallB = walls[1]!
    
    let closestPair: { 
      pa: { x: number; y: number }; 
      pb: { x: number; y: number }; 
      wallIdA: string; 
      wallIdB: string; 
      endpointA: 'start' | 'end'; 
      endpointB: 'start' | 'end' 
    } | null = null
    let minDistance = Infinity
    
    const combinations: Array<{
      pa: { x: number; y: number }
      pb: { x: number; y: number }
      endpointA: 'start' | 'end'
      endpointB: 'start' | 'end'
    }> = [
      { pa: wallA.start, pb: wallB.start, endpointA: 'start', endpointB: 'start' },
      { pa: wallA.start, pb: wallB.end, endpointA: 'start', endpointB: 'end' },
      { pa: wallA.end, pb: wallB.start, endpointA: 'end', endpointB: 'start' },
      { pa: wallA.end, pb: wallB.end, endpointA: 'end', endpointB: 'end' },
    ]
    
    for (const combo of combinations) {
      const distance = Math.sqrt(Math.pow(combo.pb.x - combo.pa.x, 2) + Math.pow(combo.pb.y - combo.pa.y, 2))
      
      if (distance > 0 && distance < minDistance) {
        minDistance = distance
        closestPair = {
          pa: { x: combo.pa.x, y: combo.pa.y },
          pb: { x: combo.pb.x, y: combo.pb.y },
          wallIdA: wallA.id,
          wallIdB: wallB.id,
          endpointA: combo.endpointA,
          endpointB: combo.endpointB,
        }
      }
    }
    
    if (closestPair) {
      const midpoint = {
        x: Math.round((closestPair.pa.x + closestPair.pb.x) / 2),
        y: Math.round((closestPair.pa.y + closestPair.pb.y) / 2),
      }
      
      updateWall(closestPair.wallIdA, { [closestPair.endpointA]: midpoint })
      updateWall(closestPair.wallIdB, { [closestPair.endpointB]: midpoint })
      
      setIssues(prev => prev.filter(i => i !== issue))
    }
  }
  
  const handleFixDuplicate = (issue: WallIssue) => {
    const walls = document.walls.filter(w => issue.wallIds.includes(w.id))
    if (walls.length < 2) return
    
    const wallToDelete = walls[1]!
    deleteWall(wallToDelete.id)
    setIssues(prev => prev.filter(i => i !== issue))
  }
  
  const handleFixAlign = (issue: WallIssue) => {
    const wall = document.walls.find(w => issue.wallIds.includes(w.id))
    if (!wall) return
    
    const dx = wall.end.x - wall.start.x
    const dy = wall.end.y - wall.start.y
    
    const isHorizontal = Math.abs(dx) > Math.abs(dy)
    
    if (isHorizontal) {
      const avgY = Math.round((wall.start.y + wall.end.y) / 2)
      updateWall(wall.id, { 
        start: { x: wall.start.x, y: avgY },
        end: { x: wall.end.x, y: avgY }
      })
    } else {
      const avgX = Math.round((wall.start.x + wall.end.x) / 2)
      updateWall(wall.id, { 
        start: { x: avgX, y: wall.start.y },
        end: { x: avgX, y: wall.end.y }
      })
    }
    
    setIssues(prev => prev.filter(i => i !== issue))
  }
  
  const handleFix = (issue: WallIssue) => {
    const fixAction = getFixAction(issue)
    if (!fixAction) return
    
    switch (fixAction.action) {
      case 'connect':
        handleFixGap(issue)
        break
      case 'delete_duplicate':
        handleFixDuplicate(issue)
        break
      case 'align':
        handleFixAlign(issue)
        break
    }
  }
  
  const handleDismiss = (issue: WallIssue) => {
    setIssues(prev => prev.filter(i => i !== issue))
  }
  
  const hasWalls = document.walls.length > 0
  const highSeverity = issues.filter(i => i.severity === 'high').length
  const mediumSeverity = issues.filter(i => i.severity === 'medium').length
  const lowSeverity = issues.filter(i => i.severity === 'low').length
  
  return (
    <div className="p-4 space-y-3">
      <div className="text-xs font-medium text-gray-600">
        Wall Correction Tools
      </div>
      
      <div className="text-xs text-gray-400">
        Detect and fix common wall problems like gaps, duplicates, and misalignment.
      </div>
      
      {!hasWalls && (
        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
          Draw some walls first to enable correction scan.
        </div>
      )}
      
      {hasWalls && (
        <div className="space-y-2">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          >
            {isScanning ? 'Scanning...' : 'Scan for Issues'}
          </button>
          
          {issues.length > 0 && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <div className="text-xs font-medium text-gray-600 mb-2">
                Found {issues.length} Issues
              </div>
              
              <div className="text-xs text-gray-400 mb-2">
                🔴 High: {highSeverity} | 🟠 Medium: {mediumSeverity} | 🟡 Low: {lowSeverity}
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-1">
                {issues.map((issue, index) => {
                  const fixAction = getFixAction(issue)
                  const severityColor = issue.severity === 'high' 
                    ? 'bg-red-50 border-red-200' 
                    : issue.severity === 'medium' 
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-yellow-50 border-yellow-200'
                  
                  return (
                    <div 
                      key={index}
                      className={`p-2 rounded border ${severityColor}`}
                    >
                      <div className="flex items-start gap-1">
                        <span>{getIssueIcon(issue)}</span>
                        <div className="flex-1">
                          <div className="text-xs text-gray-700">{issue.description}</div>
                          <div className="text-xs text-gray-400">
                            Walls: {issue.wallIds.join(', ')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 mt-2">
                        {fixAction && (
                          <button
                            onClick={() => handleFix(issue)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            {fixAction.label}
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(issue)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded hover:bg-gray-200"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <button
                onClick={() => setIssues([])}
                className="w-full mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                Clear All Issues
              </button>
            </div>
          )}
          
          {issues.length === 0 && !isScanning && (
            <div className="text-xs text-gray-400 text-center py-2">
              No issues detected or scan not run yet
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-400 border-t border-gray-200 pt-2 mt-2">
        Tip: Run scan after auto-detection to catch common errors.
      </div>
    </div>
  )
}

export default WallCorrectionPanel