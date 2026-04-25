export type LayoutPriority = 
  | 'spaciousness'
  | 'storage'
  | 'work_from_home'
  | 'family_friendly'
  | 'minimal'

export interface LayoutSuggestion {
  id: string
  name: string
  summary: string
  priority: LayoutPriority
  changes: string[]
  bestFit: string
  tradeoffs: string[]
}

export interface SuggestionGeneratorInput {
  wallsCount: number
  furnitureCount: number
  roomArea: number
  furnitureCategories: string[]
}