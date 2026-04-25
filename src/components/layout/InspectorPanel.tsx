import WallInspector from '@components/editor2d/WallInspector'
import FurnitureInspector from '@components/furniture/FurnitureInspector'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { getCatalogEntry } from '@domain/floorplan/furniture-catalog'

function InspectorPanel() {
  const { 
    document, selectedWallId, selectedFurnitureId,
    updateWall, deleteWall, updateFurniture, deleteFurniture,
    updateProjectSettings, selectFurniture
  } = useFloorPlanStore()
  const walls = document.walls
  const furniture = document.furniture
  const selectedWall = walls.find(w => w.id === selectedWallId) ?? null
  const selectedFurnitureItem = furniture.find(f => f.id === selectedFurnitureId) ?? null

  return (
    <aside className="bg-gray-50 border-l border-gray-200 overflow-auto">
      <div className="panel-header">Furniture</div>
      <FurnitureInspector 
        furniture={selectedFurnitureItem}
        onUpdate={(updates) => {
          if (selectedFurnitureId) updateFurniture(selectedFurnitureId, updates)
        }}
        onDelete={() => {
          if (selectedFurnitureId) deleteFurniture(selectedFurnitureId)
        }}
      />
      
      <div className="panel-header">Furniture List</div>
      <div className="panel-content">
        {furniture.length === 0 ? (
          <div className="text-sm text-gray-400">No furniture placed</div>
        ) : (
          <div className="space-y-1">
            {furniture.map(item => {
              const catalogEntry = getCatalogEntry(item.category)
              return (
                <div
                  key={item.id}
                  className={`text-sm p-2 rounded cursor-pointer ${
                    selectedFurnitureId === item.id ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => selectFurniture(item.id)}
                >
                  {catalogEntry?.icon} {item.name}
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      <div className="panel-header">Wall</div>
      <WallInspector 
        wall={selectedWall}
        onUpdate={(updates) => {
          if (selectedWallId) updateWall(selectedWallId, updates)
        }}
        onDelete={() => {
          if (selectedWallId) deleteWall(selectedWallId)
        }}
      />
      
      <div className="panel-header">Walls List</div>
      <div className="panel-content">
        {walls.length === 0 ? (
          <div className="text-sm text-gray-400">No walls drawn</div>
        ) : (
          <div className="space-y-1">
            {walls.map(wall => (
              <div
                key={wall.id}
                className={`text-sm p-2 rounded cursor-pointer ${
                  selectedWallId === wall.id ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => useFloorPlanStore.getState().selectWall(wall.id)}
              >
                Wall {wall.id.slice(-4)}
                {wall.isLoadBearing && ' (L)'}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="panel-header">Project Settings</div>
      <div className="panel-content space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Default Wall Thickness</label>
          <input
            type="number"
            value={document.settings.defaultWallThickness}
            onChange={(e) => updateProjectSettings({ defaultWallThickness: parseInt(e.target.value) || 10 })}
            min={1}
            max={50}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ceiling Height (m)</label>
          <input
            type="number"
            value={document.settings.ceilingHeight}
            onChange={(e) => updateProjectSettings({ ceilingHeight: parseFloat(e.target.value) || 2.8 })}
            min={2}
            max={5}
            step={0.1}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Unit</label>
          <select
            value={document.settings.unit}
            onChange={(e) => updateProjectSettings({ unit: e.target.value as 'px' | 'm' })}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
          >
            <option value="px">Pixels</option>
            <option value="m">Meters</option>
          </select>
        </div>
      </div>
    </aside>
  )
}

export default InspectorPanel