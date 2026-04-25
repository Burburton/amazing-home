import { FURNITURE_CATALOG } from '@domain/floorplan/furniture-catalog'
import { FurnitureCategory } from '@domain/floorplan/types'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import CustomFurnitureForm from './CustomFurnitureForm'

interface FurnitureLibraryProps {
  onSelect: (category: FurnitureCategory) => void
}

function FurnitureLibrary({ onSelect }: FurnitureLibraryProps) {
  const { customFurnitureAssets, setPendingCustomFurniture } = useFloorPlanStore()
  
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
          <div className="text-xs text-gray-500 mb-2">Custom Assets</div>
          <div className="grid grid-cols-2 gap-2">
            {customFurnitureAssets.map(asset => {
              const categoryEntry = FURNITURE_CATALOG.find(e => e.category === asset.category)
              return (
                <button
                  key={asset.id}
                  onClick={() => setPendingCustomFurniture(asset.id)}
                  className="flex flex-col items-center p-2 bg-green-50 rounded hover:bg-green-100 border border-green-200 transition-colors"
                >
                  <span className="text-2xl">{categoryEntry?.icon || '📦'}</span>
                  <span className="text-xs text-gray-700 mt-1">{asset.name}</span>
                  <span className="text-xs text-gray-400">{asset.customWidth}×{asset.customHeight}</span>
                </button>
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