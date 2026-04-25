import { useState } from 'react'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { LayoutVersionSourceType } from '@domain/floorplan/types'

function VersionManager() {
  const { 
    document, 
    versions, 
    activeVersionId, 
    saveVersion, 
    duplicateVersion, 
    switchVersion, 
    deleteVersion 
  } = useFloorPlanStore()
  
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [versionName, setVersionName] = useState('')
  const [versionSummary, setVersionSummary] = useState('')
  const [versionSourceType, setVersionSourceType] = useState<LayoutVersionSourceType>('manual')
  
  const handleSaveVersion = () => {
    if (!versionName.trim()) return
    
    saveVersion(versionName.trim(), versionSourceType, versionSummary.trim() || undefined)
    setShowSaveDialog(false)
    setVersionName('')
    setVersionSummary('')
    setVersionSourceType('manual')
  }
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  const getSourceTypeLabel = (sourceType: LayoutVersionSourceType) => {
    const labels: Record<LayoutVersionSourceType, string> = {
      manual: '📝 Manual',
      suggestion: '💡 Suggestion',
      demo: '🎯 Demo',
      imported: '📥 Imported',
    }
    return labels[sourceType]
  }
  
  return (
    <div className="mt-4">
      <div className="panel-header">Layout Versions</div>
      
      <div className="panel-content">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">
            {versions.length} versions saved
          </span>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-500"
            disabled={document.walls.length === 0 && document.furniture.length === 0}
          >
            Save Version
          </button>
        </div>
        
        {showSaveDialog && (
          <div className="bg-white border border-gray-200 rounded p-3 mb-3">
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="Version name (e.g., 'Initial Layout')"
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded mb-2"
            />
            
            <textarea
              value={versionSummary}
              onChange={(e) => setVersionSummary(e.target.value)}
              placeholder="Optional summary..."
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded mb-2 resize-none"
              rows={2}
            />
            
            <select
              value={versionSourceType}
              onChange={(e) => setVersionSourceType(e.target.value as LayoutVersionSourceType)}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded mb-2"
            >
              <option value="manual">📝 Manual</option>
              <option value="suggestion">💡 From Suggestion</option>
              <option value="demo">🎯 From Demo</option>
              <option value="imported">📥 Imported</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveVersion}
                className="flex-1 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-500"
                disabled={!versionName.trim()}
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {versions.length === 0 && !showSaveDialog && (
          <p className="text-xs text-gray-400">
            No versions saved. Click "Save Version" to create one.
          </p>
        )}
        
        {versions.length > 0 && (
          <div className="space-y-2">
            {versions.map(version => (
              <div
                key={version.id}
                className={`p-2 rounded cursor-pointer ${
                  activeVersionId === version.id
                    ? 'bg-primary-100 border border-primary-300'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => switchVersion(version.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {version.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {getSourceTypeLabel(version.sourceType)}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(version.createdAt)}
                  {version.summary && (
                    <span className="ml-2 text-gray-400">• {version.summary}</span>
                  )}
                </div>
                
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateVersion(version.id)
                    }}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteVersion(version.id)
                    }}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-red-600 rounded hover:bg-gray-200"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="text-xs text-gray-400 mt-1">
                  {version.document.walls.length} walls, {version.document.furniture.length} furniture
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VersionManager