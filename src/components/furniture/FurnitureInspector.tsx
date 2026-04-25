import { useState } from 'react'
import { FurnitureItem } from '@domain/floorplan/types'
import { getCatalogEntry } from '@domain/floorplan/furniture-catalog'
import { useFloorPlanStore } from '@store/useFloorPlanStore'

interface FurnitureInspectorProps {
  furniture: FurnitureItem | null
  onUpdate: (updates: Partial<FurnitureItem>) => void
  onDelete: () => void
}

function FurnitureInspector({ furniture, onUpdate, onDelete }: FurnitureInspectorProps) {
  const [showImageInput, setShowImageInput] = useState(false)
  const [showSaveAsAsset, setShowSaveAsAsset] = useState(false)
  const [assetName, setAssetName] = useState('')
  const { saveFurnitureAsAsset } = useFloorPlanStore()
  
  if (!furniture) {
    return (
      <div className="text-sm text-gray-400 p-4">
        No furniture selected
      </div>
    )
  }

  const catalogEntry = getCatalogEntry(furniture.category)
  const icon = catalogEntry?.icon || '📦'
  const displayName = furniture.customName || furniture.name

  const handleSaveAsAsset = () => {
    if (!assetName.trim()) return
    saveFurnitureAsAsset(furniture.id, assetName.trim())
    setAssetName('')
    setShowSaveAsAsset(false)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700">{displayName}</div>
          <div className="text-xs text-gray-400">{furniture.category}</div>
        </div>
      </div>
      
      {furniture.productImageUrl && (
        <div className="relative">
          <img 
            src={furniture.productImageUrl} 
            alt={displayName}
            className="w-full h-32 object-cover rounded border border-gray-200"
            onError={(e) => {
              e.currentTarget.src = ''
              e.currentTarget.style.display = 'none'
            }}
          />
          <button
            onClick={() => onUpdate({ productImageUrl: undefined })}
            className="absolute top-1 right-1 px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200"
          >
            Remove
          </button>
        </div>
      )}
      
      {furniture.productUrl && (
        <a 
          href={furniture.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-blue-600 hover:underline truncate"
        >
          View Product ↗
        </a>
      )}
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">Custom Name</label>
        <input
          type="text"
          value={furniture.customName || ''}
          onChange={(e) => onUpdate({ customName: e.target.value })}
          placeholder={furniture.name}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
        />
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
      
      <div className="border-t border-gray-200 pt-4">
        <div className="text-xs font-medium text-gray-600 mb-2">Save as Asset</div>
        
        {!showSaveAsAsset && (
          <button
            onClick={() => setShowSaveAsAsset(true)}
            className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Save Dimensions as Reusable Asset
          </button>
        )}
        
        {showSaveAsAsset && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Asset name (e.g., My IKEA Sofa)"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveAsAsset}
                disabled={!assetName.trim()}
                className="flex-1 px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
              >
                Save
              </button>
              <button
                onClick={() => { setShowSaveAsAsset(false); setAssetName('') }}
                className="flex-1 px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="text-xs font-medium text-gray-600 mb-2">Product Reference</div>
        
        {!furniture.productImageUrl && !showImageInput && (
          <button
            onClick={() => setShowImageInput(true)}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Add Product Image
          </button>
        )}
        
        {showImageInput && !furniture.productImageUrl && (
          <div className="space-y-2">
            <input
              type="url"
              placeholder="Product image URL"
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUpdate({ productImageUrl: e.currentTarget.value })
                  setShowImageInput(false)
                }
              }}
            />
            <button
              onClick={() => setShowImageInput(false)}
              className="w-full px-2 py-1 text-xs bg-gray-50 text-gray-500 rounded"
            >
              Cancel
            </button>
          </div>
        )}
        
        <div className="mt-2">
          <label className="block text-xs text-gray-500 mb-1">Product URL</label>
          <input
            type="url"
            value={furniture.productUrl || ''}
            onChange={(e) => onUpdate({ productUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
          />
        </div>
        
        <div className="mt-2">
          <label className="block text-xs text-gray-500 mb-1">Notes</label>
          <textarea
            value={furniture.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add notes about this item..."
            rows={2}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded resize-none"
          />
        </div>
      </div>
      
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