import { ViewMode } from '@store/useFloorPlanStore'

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('2d')}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          mode === '2d'
            ? 'bg-primary-500 text-white'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        2D Editor
      </button>
      <button
        onClick={() => onChange('3d')}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          mode === '3d'
            ? 'bg-primary-500 text-white'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        3D Preview
      </button>
    </div>
  )
}

export default ViewToggle