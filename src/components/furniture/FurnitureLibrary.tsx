import { useState } from 'react'
import { FURNITURE_CATALOG } from '@domain/floorplan/furniture-catalog'
import { FurnitureCategory, CustomFurnitureAsset } from '@domain/floorplan/types'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import CustomFurnitureForm from './CustomFurnitureForm'

interface FurnitureLibraryProps {
  onSelect: (category: FurnitureCategory) => void
}

function FurnitureLibrary({ onSelect }: FurnitureLibraryProps) {
  const { customFurnitureAssets, setPendingCustomFurniture, renameCustomFurniture, deleteCustomFurniture } = useFloorPlanStore()
  const [editingAsset, setEditingAsset] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  
  const handleRename = (assetId: string) => {
    if (!editName.trim()) return
    renameCustomFurniture(assetId, editName.trim())
    setEditingAsset(null)
    setEditName('')
  }
  
  const startEdit = (asset: CustomFurnitureAsset) => {
    setEditingAsset(asset.id)
    setEditName(asset.name)
  }
  
  return (
    <div className="p-2">
      <div className="text-xs text-gray-500 mb-2">Furniture Library</div>
      <div className="grid grid-cols-2 gap-2">
        {FURNITURE_CATALOG.map(entry => (
          <button
            key={entry.category}
            onClick={() => onSelect(entry.category)}
            className="flex flex-col items-center p-2 bg-gray-50 rounded hover:bg-primary-50 hover:border-primary-200 border border-gray-200 transition-colors"
          >
            <span className="text-2xl">{entry.icon}</span>
            <span className="text-xs text-gray-700 mt-1">{entry.name}</span>
            <span className="text-xs text-gray-400">{entry.defaultWidth}×{entry.defaultHeight}</span>
          </button>
        ))}
      </div>
      
      {customFurnitureAssets.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-2">Custom Assets ({customFurnitureAssets.length})</div>
          <div className="grid grid-cols-2 gap-2">
            {customFurnitureAssets.map(asset => {
              const categoryEntry = FURNITURE_CATALOG.find(e => e.category === asset.category)
              const isEditing = editingAsset === asset.id
              
              return (
                <div
                  key={asset.id}
                  className="flex flex-col items-center p-2 bg-green-50 rounded border border-green-200"
                >
                  <span className="text-2xl">{categoryEntry?.icon || '📦'}</span>
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(asset.id)
                        if (e.key === 'Escape') { setEditingAsset(null); setEditName('') }
                      }}
                      className="w-full px-1 py-0.5 text-xs border border-green-300 rounded mt-1"
                      autoFocus
                    />
                  ) : (
                    <span className="text-xs text-gray-700 mt-1">{asset.name}</span>
                  )}
                  
                  <span className="text-xs text-gray-400">{asset.customWidth}×{asset.customHeight}</span>
                  
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => setPendingCustomFurniture(asset.id)}
                      className="px-1.5 py-0.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      title="Place"
                    >
                      Place
                    </button>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(asset)}
                        className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                        title="Rename"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => deleteCustomFurniture(asset.id)}
                      className="px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      <CustomFurnitureForm />
    </div>
  )
}

export default FurnitureLibrary