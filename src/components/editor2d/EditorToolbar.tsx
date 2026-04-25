import { useRef } from 'react'

interface EditorToolbarProps {
  hasImage: boolean
  onFit: () => void
  onReset: () => void
  onClear: () => void
  onUpload: (file: File) => void
}

function EditorToolbar({ hasImage, onFit, onReset, onClear, onUpload }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        onClick={handleUploadClick}
        className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
      >
        Upload
      </button>
      
      {hasImage && (
        <>
          <button
            onClick={onFit}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Fit
          </button>
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Clear
          </button>
        </>
      )}
      
      <div className="ml-auto text-xs text-gray-400">
        {hasImage ? 'Scroll to zoom, drag to pan' : 'Upload a floor plan to start'}
      </div>
    </div>
  )
}

export default EditorToolbar