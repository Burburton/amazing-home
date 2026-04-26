import FurnitureLibrary from '@components/furniture/FurnitureLibrary'
import LayoutSuggestionPanel from '@components/layout/LayoutSuggestionPanel'
import VersionManager from '@components/layout/VersionManager'
import WallDetectionPanel from '@components/shared/WallDetectionPanel'
import WallCorrectionPanel from '@components/shared/WallCorrectionPanel'
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
      
      <WallDetectionPanel />
      
      <WallCorrectionPanel />
      
      <FurnitureLibrary onSelect={handleFurnitureSelect} />
      
      <VersionManager />
      
      <LayoutSuggestionPanel />
      
      <div className="panel-header">Keyboard Shortcuts</div>
      <div className="panel-content space-y-1 text-xs text-gray-500">
        <div><kbd className="px-1 bg-gray-200 rounded">Ctrl+Z</kbd> Undo</div>
        <div><kbd className="px-1 bg-gray-200 rounded">Ctrl+Y</kbd> Redo</div>
        <div><kbd className="px-1 bg-gray-200 rounded">Ctrl+S</kbd> Save</div>
        <div><kbd className="px-1 bg-gray-200 rounded">Scroll</kbd> Zoom</div>
        <div><kbd className="px-1 bg-gray-200 rounded">Drag</kbd> Pan (Select mode)</div>
      </div>
    </aside>
  )
}

export default Sidebar