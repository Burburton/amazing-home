import { useState } from 'react'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import {
  LayoutPriority,
  LayoutSuggestion,
  generateSuggestions,
  getPriorityLabel,
  getPriorityIcon
} from '@domain/floorplan/layout-suggestion'
import { computeBoundingBox } from '@domain/floorplan/geometry'

const PRIORITIES: LayoutPriority[] = [
  'spaciousness',
  'storage',
  'work_from_home',
  'family_friendly',
  'minimal'
]

function LayoutSuggestionPanel() {
  const { document, saveVersion } = useFloorPlanStore()
  const [selectedPriority, setSelectedPriority] = useState<LayoutPriority | null>(null)
  const [suggestions, setSuggestions] = useState<LayoutSuggestion[]>([])
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)
  
  const handlePrioritySelect = (priority: LayoutPriority) => {
    setSelectedPriority(priority)
    
    const boundingBox = computeBoundingBox(document.walls)
    const roomArea = boundingBox.width * boundingBox.height
    
    const newSuggestions = generateSuggestions(
      {
        wallsCount: document.walls.length,
        furnitureCount: document.furniture.length,
        roomArea,
        furnitureCategories: document.furniture.map(f => f.category)
      },
      priority
    )
    
    setSuggestions(newSuggestions)
    setExpandedSuggestion(null)
  }
  
  const handleToggleExpand = (suggestionId: string) => {
    setExpandedSuggestion(expandedSuggestion === suggestionId ? null : suggestionId)
  }
  
  const handleSaveSuggestionAsVersion = (suggestion: LayoutSuggestion) => {
    saveVersion(
      suggestion.name,
      'suggestion',
      `${suggestion.summary} (${getPriorityLabel(suggestion.priority)} priority)`
    )
  }
  
  return (
    <div className="mt-4">
      <div className="panel-header">Layout Suggestions</div>
      
      <div className="panel-content">
        <p className="text-xs text-gray-500 mb-3">
          Select a layout priority to see design suggestions
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {PRIORITIES.map(priority => (
            <button
              key={priority}
              onClick={() => handlePrioritySelect(priority)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedPriority === priority
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getPriorityIcon(priority)} {getPriorityLabel(priority)}
            </button>
          ))}
        </div>
        
        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map(suggestion => (
              <div
                key={suggestion.id}
                className="bg-white border border-gray-200 rounded p-2"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleToggleExpand(suggestion.id)}
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {suggestion.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({suggestion.id.split('-')[1]})
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {expandedSuggestion === suggestion.id ? '▼' : '▶'}
                  </span>
                </div>
                
                {expandedSuggestion === suggestion.id && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-600">
                      {suggestion.summary}
                    </p>
                    
                    <div>
                      <span className="text-xs font-medium text-gray-700">Changes:</span>
                      <ul className="text-xs text-gray-600 list-disc list-inside mt-1">
                        {suggestion.changes.map((change, idx) => (
                          <li key={idx}>{change}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-green-700">Best Fit:</span>
                        <p className="text-xs text-green-600 mt-1">{suggestion.bestFit}</p>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-orange-700">Tradeoffs:</span>
                        <ul className="text-xs text-orange-600 list-disc list-inside mt-1">
                          {suggestion.tradeoffs.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={() => handleSaveSuggestionAsVersion(suggestion)}
                        className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
                        title="Save current layout as a named version"
                      >
                        Save as Version
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded"
                        disabled
                      >
                        Feedback
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {selectedPriority && suggestions.length === 0 && (
          <p className="text-xs text-gray-400">No suggestions available</p>
        )}
        
        {!selectedPriority && (
          <p className="text-xs text-gray-400 italic">
            Click a priority to see suggestions
          </p>
        )}
      </div>
      
      <div className="panel-content bg-gray-50 rounded mt-2">
        <p className="text-xs text-gray-500">
          ℹ️ Suggestions are design references, not professional advice. 
          Results depend on your floor plan data.
        </p>
      </div>
    </div>
  )
}

export default LayoutSuggestionPanel