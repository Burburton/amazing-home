import { Wall, Point2D } from '@domain/floorplan/types'

export interface WallIssue {
  type: 'gap' | 'duplicate' | 'disconnected' | 'misaligned'
  wallIds: string[]
  description: string
  severity: 'high' | 'medium' | 'low'
  fixable: boolean
}

const GAP_THRESHOLD = 15
const DUPLICATE_THRESHOLD = 10
const ALIGN_THRESHOLD = 5

export function detectWallIssues(walls: Wall[]): WallIssue[] {
  const issues: WallIssue[] = []
  
  issues.push(...detectGaps(walls))
  issues.push(...detectDuplicates(walls))
  issues.push(...detectDisconnected(walls))
  issues.push(...detectMisaligned(walls))
  
  return issues
}

function detectGaps(walls: Wall[]): WallIssue[] {
  const issues: WallIssue[] = []
  
  for (const wallA of walls) {
    for (const wallB of walls) {
      if (wallA.id === wallB.id) continue
      
      const endpointsA = [wallA.start, wallA.end]
      const endpointsB = [wallB.start, wallB.end]
      
      for (const pa of endpointsA) {
        for (const pb of endpointsB) {
          const distance = distanceBetween(pa, pb)
          
          if (distance > 0 && distance <= GAP_THRESHOLD) {
            const existingIssue = issues.find(i => 
              i.type === 'gap' && 
              i.wallIds.includes(wallA.id) && 
              i.wallIds.includes(wallB.id)
            )
            if (!existingIssue) {
              issues.push({
                type: 'gap',
                wallIds: [wallA.id, wallB.id],
                description: `Gap of ${Math.round(distance)}px between wall endpoints`,
                severity: distance > GAP_THRESHOLD / 2 ? 'high' : 'medium',
                fixable: true,
              })
            }
          }
        }
      }
    }
  }
  
  return issues
}

function detectDuplicates(walls: Wall[]): WallIssue[] {
  const issues: WallIssue[] = []
  
  for (const wallA of walls) {
    for (const wallB of walls) {
      if (wallA.id === wallB.id) continue
      
      const sameStart = distanceBetween(wallA.start, wallB.start) < DUPLICATE_THRESHOLD
      const sameEnd = distanceBetween(wallA.end, wallB.end) < DUPLICATE_THRESHOLD
      
      if (sameStart && sameEnd) {
        const existingIssue = issues.find(i => 
          i.type === 'duplicate' && 
          i.wallIds.includes(wallA.id) && 
          i.wallIds.includes(wallB.id)
        )
        if (!existingIssue) {
          issues.push({
            type: 'duplicate',
            wallIds: [wallA.id, wallB.id],
            description: 'Duplicate walls with same start and end points',
            severity: 'high',
            fixable: true,
          })
        }
      }
    }
  }
  
  return issues
}

function detectDisconnected(walls: Wall[]): WallIssue[] {
  const issues: WallIssue[] = []
  
  const connectedWalls = new Set<string>()
  
  for (const wallA of walls) {
    for (const wallB of walls) {
      if (wallA.id === wallB.id) continue
      
      const connected = 
        distanceBetween(wallA.start, wallB.start) < GAP_THRESHOLD ||
        distanceBetween(wallA.start, wallB.end) < GAP_THRESHOLD ||
        distanceBetween(wallA.end, wallB.start) < GAP_THRESHOLD ||
        distanceBetween(wallA.end, wallB.end) < GAP_THRESHOLD
      
      if (connected) {
        connectedWalls.add(wallA.id)
        connectedWalls.add(wallB.id)
      }
    }
  }
  
  for (const wall of walls) {
    if (!connectedWalls.has(wall.id)) {
      issues.push({
        type: 'disconnected',
        wallIds: [wall.id],
        description: 'Wall not connected to any other wall',
        severity: 'medium',
        fixable: false,
      })
    }
  }
  
  return issues
}

function detectMisaligned(walls: Wall[]): WallIssue[] {
  const issues: WallIssue[] = []
  
  for (const wall of walls) {
    const dx = wall.end.x - wall.start.x
    const dy = wall.end.y - wall.start.y
    
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const normalizedAngle = Math.abs(angle) % 90
    
    if (normalizedAngle > ALIGN_THRESHOLD && normalizedAngle < 90 - ALIGN_THRESHOLD) {
      issues.push({
        type: 'misaligned',
        wallIds: [wall.id],
        description: `Wall not aligned to grid (angle: ${Math.round(angle)}°)`,
        severity: 'low',
        fixable: true,
      })
    }
  }
  
  return issues
}

function distanceBetween(a: Point2D, b: Point2D): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}

export function getFixAction(issue: WallIssue): { action: string; label: string } | null {
  if (!issue.fixable) return null
  
  switch (issue.type) {
    case 'gap':
      return { action: 'connect', label: 'Connect Endpoints' }
    case 'duplicate':
      return { action: 'delete_duplicate', label: 'Delete Duplicate' }
    case 'misaligned':
      return { action: 'align', label: 'Align to Grid' }
    default:
      return null
  }
}

export function getIssueIcon(issue: WallIssue): string {
  switch (issue.type) {
    case 'gap':
      return '⚡'
    case 'duplicate':
      return '📋'
    case 'disconnected':
      return '🔗'
    case 'misaligned':
      return '📐'
    default:
      return '⚠️'
  }
}

export function getIssueColor(issue: WallIssue): string {
  switch (issue.severity) {
    case 'high':
      return 'red'
    case 'medium':
      return 'orange'
    case 'low':
      return 'yellow'
    default:
      return 'gray'
  }
}