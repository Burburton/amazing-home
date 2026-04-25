import { FurnitureCategory, FurnitureCatalogEntry } from './types'

export const FURNITURE_CATALOG: FurnitureCatalogEntry[] = [
  {
    category: 'sofa',
    name: 'Sofa',
    defaultWidth: 180,
    defaultHeight: 80,
    defaultElevation: 45,
    icon: '🛋️',
  },
  {
    category: 'bed',
    name: 'Bed (Queen)',
    defaultWidth: 160,
    defaultHeight: 200,
    defaultElevation: 50,
    icon: '🛏️',
  },
  {
    category: 'dining_table',
    name: 'Dining Table',
    defaultWidth: 120,
    defaultHeight: 80,
    defaultElevation: 75,
    icon: '🍽️',
  },
  {
    category: 'chair',
    name: 'Chair',
    defaultWidth: 45,
    defaultHeight: 45,
    defaultElevation: 45,
    icon: '🪑',
  },
  {
    category: 'desk',
    name: 'Desk',
    defaultWidth: 120,
    defaultHeight: 60,
    defaultElevation: 75,
    icon: '🖥️',
  },
  {
    category: 'cabinet',
    name: 'Cabinet',
    defaultWidth: 80,
    defaultHeight: 40,
    defaultElevation: 180,
    icon: '🗄️',
  },
  {
    category: 'coffee_table',
    name: 'Coffee Table',
    defaultWidth: 80,
    defaultHeight: 50,
    defaultElevation: 45,
    icon: '☕',
  },
]

export function getCatalogEntry(category: FurnitureCategory): FurnitureCatalogEntry | undefined {
  return FURNITURE_CATALOG.find(entry => entry.category === category)
}

export function getCatalogCategories(): FurnitureCategory[] {
  return FURNITURE_CATALOG.map(entry => entry.category)
}