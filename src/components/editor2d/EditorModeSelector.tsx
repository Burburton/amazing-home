import { EditorMode } from '@domain/floorplan/types'

interface EditorModeSelectorProps {
  mode: EditorMode
  onChange: (mode: EditorMode) => void
}

function EditorModeSelector({ mode, onChange }: EditorModeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange('select')}
        className={`px-3 py-1.5 text-sm rounded transition-colors ${
          mode === 'select' 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Select
      </button>
      <button
        onClick={() => onChange('drawWall')}
        className={`px-3 py-1.5 text-sm rounded transition-colors ${
          mode === 'drawWall' 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Draw Wall
      </button>
    </div>
  )
}

export default EditorModeSelector