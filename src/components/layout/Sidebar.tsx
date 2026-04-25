import FurnitureLibrary from '@components/furniture/FurnitureLibrary'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { FurnitureCategory } from '@domain/floorplan/types'

function Sidebar() {
  const { setPendingFurniture, document } = useFloorPlanStore()

  const handleFurnitureSelect = (category: FurnitureCategory) => {
    setPendingFurniture(category)
  }

  return (
    <aside className="bg-gray-50 border-r border-gray-200 overflow-auto">
      <div className="panel-header">Project</div>
      <div className="panel-content">
        <div className="text-sm text-gray-700">{document.project.name}</div>
        <div className="text-xs text-gray-400">{document.walls.length} walls, {document.furniture.length} furniture</div>
      </div>
      
      <FurnitureLibrary onSelect={handleFurnitureSelect} />
      
      <div className="panel-header">Tools</div>
      <div className="panel-content space-y-2">
        <div className="text-sm text-gray-600">2D Editor - Draw walls</div>
        <div className="text-sm text-gray-600">3D Preview - View model</div>
      </div>
    </aside>
  )
}

export default Sidebar