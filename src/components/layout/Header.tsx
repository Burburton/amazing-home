import React, { useState, useEffect } from 'react'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { sampleFloorPlanDocument } from '@domain/floorplan/fixtures/sample-document'

const STORAGE_KEY = 'amazing-home-project'

function Header() {
  const { document, loadDocument, saveToJson, loadFromJson, createNewProject, setError, error, undo, redo, canUndo, canRedo } = useFloorPlanStore()
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(document.project.name)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [undoFlash, setUndoFlash] = useState(false)
  const [redoFlash, setRedoFlash] = useState(false)
  
  const handleSaveToStorage = React.useCallback(() => {
    try {
      const json = saveToJson()
      localStorage.setItem(STORAGE_KEY, json)
      setError(null)
      setSaveMessage('Saved!')
      setTimeout(() => setSaveMessage(null), 2000)
    } catch {
      setError('Failed to save to browser')
    }
  }, [saveToJson, setError])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault()
          if (e.shiftKey) {
            redo()
            setRedoFlash(true)
            setTimeout(() => setRedoFlash(false), 300)
          } else {
            undo()
            setUndoFlash(true)
            setTimeout(() => setUndoFlash(false), 300)
          }
        } else if (e.key === 'y') {
          e.preventDefault()
          redo()
          setRedoFlash(true)
          setTimeout(() => setRedoFlash(false), 300)
        } else if (e.key === 's') {
          e.preventDefault()
          handleSaveToStorage()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, handleSaveToStorage])
  
  const handleSaveName = () => {
    if (tempName.trim()) {
      loadDocument({ ...document, project: { ...document.project, name: tempName.trim() } })
    }
    setEditingName(false)
  }
  
  const handleLoadDemo = () => {
    loadDocument(sampleFloorPlanDocument)
    setError(null)
  }
  
  const handleLoadFromStorage = () => {
    try {
      const json = localStorage.getItem(STORAGE_KEY)
      if (json) {
        const success = loadFromJson(json)
        if (!success) {
          setError('Invalid saved project')
        }
      } else {
        setError('No saved project found')
      }
    } catch {
      setError('Failed to load from browser')
    }
  }
  
  const handleExportJson = () => {
    const json = saveToJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${document.project.name.replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const json = e.target?.result as string
        const success = loadFromJson(json)
        if (!success) {
          setError('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
    event.target.value = ''
  }
  
  const handleNewProject = () => {
    const newId = `project-${Date.now()}`
    createNewProject(newId, 'New Project')
  }
  
  return (
    <header className="col-span-3 h-14 bg-primary-600 text-white flex items-center justify-between px-4 border-b border-primary-700">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Amazing Home</h1>
        
        {editingName ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            onBlur={handleSaveName}
            className="px-2 py-1 text-sm bg-primary-700 rounded border border-primary-400 focus:outline-none"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setTempName(document.project.name); setEditingName(true) }}
            className="text-sm text-primary-200 hover:text-white cursor-pointer"
          >
            {document.project.name}
          </button>
        )}
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              undo()
              setUndoFlash(true)
              setTimeout(() => setUndoFlash(false), 300)
            }}
            disabled={!canUndo()}
            className={`px-2 py-1 text-xs rounded transition-all ${
              undoFlash ? 'bg-yellow-400 scale-110' :
              canUndo() ? 'bg-primary-500 hover:bg-primary-400' : 'bg-primary-700 opacity-50 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={() => {
              redo()
              setRedoFlash(true)
              setTimeout(() => setRedoFlash(false), 300)
            }}
            disabled={!canRedo()}
            className={`px-2 py-1 text-xs rounded transition-all ${
              redoFlash ? 'bg-yellow-400 scale-110' :
              canRedo() ? 'bg-primary-500 hover:bg-primary-400' : 'bg-primary-700 opacity-50 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
          >
            ↷
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {saveMessage && (
          <span className="text-xs text-green-200 bg-green-700/50 px-2 py-1 rounded animate-pulse">
            {saveMessage}
          </span>
        )}
        
        {error && (
          <span className="text-xs text-red-300 bg-red-900/50 px-2 py-1 rounded">
            {error}
          </span>
        )}
        
        <button
          onClick={handleNewProject}
          className="px-3 py-1.5 text-xs bg-primary-500 hover:bg-primary-400 rounded transition-colors"
        >
          New
        </button>
        
        <button
          onClick={handleLoadDemo}
          className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 rounded transition-colors"
          title="Load demo project with sample walls and furniture"
        >
          Demo
        </button>
        
        <button
          onClick={handleSaveToStorage}
          className="px-3 py-1.5 text-xs bg-primary-500 hover:bg-primary-400 rounded transition-colors"
          title="Save (Ctrl+S)"
        >
          Save
        </button>
        
        <button
          onClick={handleLoadFromStorage}
          className="px-3 py-1.5 text-xs bg-primary-500 hover:bg-primary-400 rounded transition-colors"
        >
          Load
        </button>
        
        <button
          onClick={handleExportJson}
          className="px-3 py-1.5 text-xs bg-primary-500 hover:bg-primary-400 rounded transition-colors"
        >
          Export
        </button>
        
        <label className="px-3 py-1.5 text-xs bg-primary-500 hover:bg-primary-400 rounded transition-colors cursor-pointer">
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />
        </label>
        
        <span className="text-xs text-primary-300 ml-2">
          {document.walls.length} walls, {document.furniture.length} furniture
        </span>
      </div>
    </header>
  )
}

export default Header