import { FurnitureItem } from '@domain/floorplan/types'
import { getCatalogEntry } from '@domain/floorplan/furniture-catalog'

interface FurnitureInspectorProps {
  furniture: FurnitureItem | null
  onUpdate: (updates: Partial<FurnitureItem>) => void
  onDelete: () => void
}

function FurnitureInspector({ furniture, onUpdate, onDelete }: FurnitureInspectorProps) {
  if (!furniture) {
    return (
      <div className="text-sm text-gray-400 p-4">
        No furniture selected
      </div>
    )
  }

  const catalogEntry = getCatalogEntry(furniture.category)
  const icon = catalogEntry?.icon || '📦'

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-sm font-medium text-gray-700">{furniture.name}</div>
          <div className="text-xs text-gray-400">{furniture.category}</div>
        </div>
      </div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">Position X</label>
        <input
          type="number"
          value={Math.round(furniture.position.x)}
          onChange={(e) => onUpdate({ position: { ...furniture.position, x: parseInt(e.target.value) || 0 } })}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
        />
      </div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">Position Y</label>
        <input
          type="number"
          value={Math.round(furniture.position.y)}
          onChange={(e) => onUpdate({ position: { ...furniture.position, y: parseInt(e.target.value) || 0 } })}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
        />
      </div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">Width</label>
        <input
          type="number"
          value={furniture.width}
          onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 10 })}
          min={10}
          max={500}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
        />
      </div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">Height (Depth)</label>
        <input
          type="number"
          value={furniture.height}
          onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 10 })}
          min={10}
          max={500}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
        />
      </div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">Rotation (degrees)</label>
        <input
          type="number"
          value={Math.round(furniture.rotation)}
          onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) || 0 })}
          min={0}
          max={360}
          step={15}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
        />
      </div>
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">Elevation (cm)</label>
        <input
          type="number"
          value={furniture.elevation}
          onChange={(e) => onUpdate({ elevation: parseInt(e.target.value) || 45 })}
          min={0}
          max={200}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
        />
      </div>
      
      {catalogEntry && (
        <button
          onClick={() => onUpdate({
            width: catalogEntry.defaultWidth,
            height: catalogEntry.defaultHeight,
            elevation: catalogEntry.defaultElevation,
          })}
          className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
        >
          Reset to Default Size
        </button>
      )}
      
      <button
        onClick={onDelete}
        className="w-full px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
      >
        Delete Furniture
      </button>
    </div>
  )
}

export default FurnitureInspector