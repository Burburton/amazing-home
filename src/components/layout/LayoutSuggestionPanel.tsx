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

type FeedbackType = 'useful' | 'not_useful' | 'too_generic' | 'unrealistic' | null

interface SuggestionFeedback {
  suggestionId: string
  feedback: FeedbackType
  timestamp: string
}

const FEEDBACK_LABELS: Record<string, string> = {
  useful: '👍 Useful',
  not_useful: '👎 Not Useful',
  too_generic: '📋 Too Generic',
  unrealistic: '❌ Unrealistic'
}

const PRIORITIES: LayoutPriority[] = [
  'spaciousness',
  'storage',
  'work_from_home',
  'family_friendly',
  'minimal'
]

const FEEDBACKS_STORAGE_KEY = 'amazing-home-suggestion-feedbacks'

function loadFeedbacksFromStorage(): Record<string, SuggestionFeedback> {
  try {
    const stored = localStorage.getItem(FEEDBACKS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore
  }
  return {}
}

function saveFeedbacksToStorage(feedbacks: Record<string, SuggestionFeedback>) {
  try {
    localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(feedbacks))
  } catch {
    // ignore
  }
}

function LayoutSuggestionPanel() {
  const { document, saveVersion } = useFloorPlanStore()
  const [selectedPriority, setSelectedPriority] = useState<LayoutPriority | null>(null)
  const [suggestions, setSuggestions] = useState<LayoutSuggestion[]>([])
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)
  const [feedbacks, setFeedbacks] = useState<Record<string, SuggestionFeedback>>(loadFeedbacksFromStorage())
  
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
  
  const handleApplyAsVersion = (suggestion: LayoutSuggestion) => {
    saveVersion(
      suggestion.name,
      'suggestion',
      `${suggestion.summary} (${getPriorityLabel(suggestion.priority)} priority)`
    )
  }
  
  const handleFeedback = (suggestionId: string, feedbackType: FeedbackType) => {
    const newFeedback: SuggestionFeedback = {
      suggestionId,
      feedback: feedbackType,
      timestamp: new Date().toISOString()
    }
    const newFeedbacks = { ...feedbacks, [suggestionId]: newFeedback }
    setFeedbacks(newFeedbacks)
    saveFeedbacksToStorage(newFeedbacks)
  }
  
  const getCurrentLayoutSummary = () => {
    const furnitureTypes = document.furniture.map(f => f.category)
    const uniqueTypes = [...new Set(furnitureTypes)]
    return `${document.furniture.length} furniture items (${uniqueTypes.join(', ') || 'none'})`
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
                     <div className="bg-gray-50 p-2 rounded">
                       <div className="text-xs font-medium text-gray-700 mb-1">Before/After Comparison</div>
                       <div className="flex gap-2">
                         <div className="flex-1">
                           <div className="text-xs text-gray-500 mb-1">Current:</div>
                           <div className="text-xs text-gray-700">{getCurrentLayoutSummary()}</div>
                         </div>
                         <div className="flex-1">
                           <div className="text-xs text-gray-500 mb-1">Suggested:</div>
                           <div className="text-xs text-green-700">{suggestion.summary}</div>
                         </div>
                       </div>
                     </div>
                     
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
                     
                     <div className="border-t border-gray-200 pt-2 mt-2">
                       <div className="text-xs font-medium text-gray-600 mb-2">Apply Suggestion</div>
                       <button
                         onClick={() => handleApplyAsVersion(suggestion)}
                         className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                       >
                         Apply as New Version
                       </button>
                       <div className="text-xs text-gray-400 mt-1">
                         Saves current layout as a version you can compare later
                       </div>
                     </div>
                     
                     <div className="border-t border-gray-200 pt-2 mt-2">
                       <div className="text-xs font-medium text-gray-600 mb-2">Was this helpful?</div>
                       <div className="flex flex-wrap gap-1">
                         {Object.entries(FEEDBACK_LABELS).map(([type, label]) => {
                           const isActive = feedbacks[suggestion.id]?.feedback === type
                           return (
                             <button
                               key={type}
                               onClick={() => handleFeedback(suggestion.id, type as FeedbackType)}
                               className={`px-2 py-1 text-xs rounded transition-colors ${
                                 isActive
                                   ? 'bg-primary-600 text-white'
                                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                               }`}
                             >
                               {label}
                             </button>
                           )
                         })}
                       </div>
                       {feedbacks[suggestion.id] && (
                         <div className="text-xs text-gray-400 mt-1">
                           Feedback recorded ✓
                         </div>
                       )}
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