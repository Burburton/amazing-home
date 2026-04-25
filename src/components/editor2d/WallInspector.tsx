import { Wall } from '@domain/floorplan/types'

interface WallInspectorProps {
  wall: Wall | null
  onUpdate: (updates: Partial<Wall>) => void
  onDelete: () => void
}

function WallInspector({ wall, onUpdate, onDelete }: WallInspectorProps) {
  if (!wall) {
    return (
      <div className="text-sm text-gray-400 p-4">
        No wall selected
      </div>
    )
  }

  const length = Math.sqrt(
    Math.pow(wall.end.x - wall.start.x, 2) + 
    Math.pow(wall.end.y - wall.start.y, 2)
  )

  return (
    <div className="space-y-4 p-4">
      <div className="text-sm font-medium text-gray-700">Wall Properties</div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">Length</label>
        <div className="text-sm text-gray-700">{Math.round(length)} px</div>
      </div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">Thickness</label>
        <input
          type="number"
          value={wall.thickness}
          onChange={(e) => onUpdate({ thickness: parseInt(e.target.value) || 10 })}
          min={1}
          max={50}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={wall.isLoadBearing}
          onChange={(e) => onUpdate({ isLoadBearing: e.target.checked })}
          className="rounded"
        />
        <label className="text-sm text-gray-700">Load-bearing</label>
      </div>
      
      <button
        onClick={onDelete}
        className="w-full px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
      >
        Delete Wall
      </button>
    </div>
  )
}

export default WallInspector