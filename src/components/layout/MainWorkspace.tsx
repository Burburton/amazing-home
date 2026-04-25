import Editor2D from '@components/editor2d/Editor2D'
import Preview3D from '@components/preview3d/Preview3D'
import ViewToggle from '@components/shared/ViewToggle'
import { useFloorPlanStore } from '@store/useFloorPlanStore'

function MainWorkspace() {
  const { viewMode, setViewMode } = useFloorPlanStore()

  return (
    <main className="bg-white overflow-auto flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="text-sm text-gray-600">
          {viewMode === '2d' ? '2D Editor - Draw and edit walls' : '3D Preview - View your floor plan'}
        </div>
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>
      
      <div className="flex-1 min-h-0">
        {viewMode === '2d' ? <Editor2D /> : <Preview3D />}
      </div>
    </main>
  )
}

export default MainWorkspace