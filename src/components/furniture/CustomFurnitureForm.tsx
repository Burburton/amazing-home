import { useState } from 'react'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { FurnitureCategory } from '@domain/floorplan/types'
import { FURNITURE_CATALOG } from '@domain/floorplan/furniture-catalog'

const CATEGORIES: FurnitureCategory[] = [
  'sofa',
  'bed',
  'dining_table',
  'chair',
  'desk',
  'cabinet',
  'coffee_table',
]

function CustomFurnitureForm() {
  const { createCustomFurniture } = useFloorPlanStore()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<FurnitureCategory>('sofa')
  const [width, setWidth] = useState(100)
  const [height, setHeight] = useState(60)
  const [elevation, setElevation] = useState(45)
  
  const handleCreate = () => {
    if (!name.trim()) return
    
    createCustomFurniture(name.trim(), category, width, height, elevation)
    setShowForm(false)
    setName('')
    setWidth(100)
    setHeight(60)
    setElevation(45)
  }
  
  const handleCancel = () => {
    setShowForm(false)
    setName('')
  }
  
  const categoryEntry = FURNITURE_CATALOG.find(e => e.category === category)
  
  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 mb-2">Custom Furniture</div>
      
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
        >
          + Create Custom
        </button>
      )}
      
      {showForm && (
        <div className="bg-white border border-gray-200 rounded p-3 space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g., 'My Desk')"
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
          />
          
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FurnitureCategory)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
          >
            {CATEGORIES.map(cat => {
              const entry = FURNITURE_CATALOG.find(e => e.category === cat)
              return (
                <option key={cat} value={cat}>
                  {entry?.icon} {entry?.name}
                </option>
              )
            })}
          </select>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value) || 50)}
                min={20}
                max={500}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Depth</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value) || 30)}
                min={20}
                max={500}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">Height (cm)</label>
            <input
              type="number"
              value={elevation}
              onChange={(e) => setElevation(Number(e.target.value) || 45)}
              min={20}
              max={200}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
            />
          </div>
          
          <div className="text-xs text-gray-400">
            Preview: {width}×{height} cm, {elevation}cm tall
            {categoryEntry && ` (${categoryEntry.icon})`}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className={`flex-1 px-2 py-1 text-xs rounded ${
                name.trim()
                  ? 'bg-primary-600 text-white hover:bg-primary-500'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Create
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomFurnitureForm