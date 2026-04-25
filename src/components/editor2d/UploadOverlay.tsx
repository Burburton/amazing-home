import { useRef } from 'react'

interface UploadOverlayProps {
  onFileSelect: (file: File) => void
}

function UploadOverlay({ onFileSelect }: UploadOverlayProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    e.target.value = ''
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center cursor-pointer"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
        <div className="text-4xl text-gray-400 mb-3">+</div>
        <p className="text-lg font-medium text-gray-600 mb-1">
          Drop floor plan image here
        </p>
        <p className="text-sm text-gray-400">
          or click to upload JPG/PNG
        </p>
      </div>
    </div>
  )
}

export default UploadOverlay