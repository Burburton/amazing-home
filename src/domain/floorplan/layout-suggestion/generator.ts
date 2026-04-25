import { LayoutPriority, LayoutSuggestion, SuggestionGeneratorInput } from './types'

const SUGGESTION_TEMPLATES: Record<LayoutPriority, LayoutSuggestion[]> = {
  spaciousness: [
    {
      id: 'spacious-001',
      name: 'Open Flow Layout',
      summary: 'Maximizes open floor area with minimal furniture obstruction.',
      priority: 'spaciousness',
      changes: [
        'Reduce furniture count to essentials',
        'Position furniture against walls',
        'Use smaller coffee table',
        'Remove unnecessary cabinets'
      ],
      bestFit: 'Small apartments needing breathing room',
      tradeoffs: ['Less storage space', 'Minimal seating capacity']
    },
    {
      id: 'spacious-002',
      name: 'Central Gathering Layout',
      summary: 'Creates a central open area with furniture grouped around edges.',
      priority: 'spaciousness',
      changes: [
        'Move all seating to perimeter',
        'Keep center area clear',
        'Use wall-mounted storage',
        'Angle furniture for visual openness'
      ],
      bestFit: 'Living rooms with social focus',
      tradeoffs: ['Furniture feels distant', 'Less cozy intimacy']
    },
    {
      id: 'spacious-003',
      name: 'Minimalist Zen Layout',
      summary: 'Emphasizes empty space with only essential furniture pieces.',
      priority: 'spaciousness',
      changes: [
        'Remove decorative furniture',
        'Keep only primary seating',
        'Center key furniture pieces',
        'Maximize walkway width'
      ],
      bestFit: 'Modern minimalist homes',
      tradeoffs: ['May feel bare', 'Limited functionality']
    }
  ],
  storage: [
    {
      id: 'storage-001',
      name: 'Storage Wall Layout',
      summary: 'Dedicates one wall entirely to storage and organization.',
      priority: 'storage',
      changes: [
        'Add cabinet along longest wall',
        'Stack storage vertically',
        'Use under-furniture storage',
        'Position desk near storage wall'
      ],
      bestFit: 'Home offices needing organization',
      tradeoffs: ['Less open floor area', 'Wall appears heavy']
    },
    {
      id: 'storage-002',
      name: 'Corner Storage Layout',
      summary: 'Utilizes corner spaces for maximum storage efficiency.',
      priority: 'storage',
      changes: [
        'Add L-shaped cabinet in corners',
        'Use corner desk setup',
        'Position sofa away from corners',
        'Keep center area functional'
      ],
      bestFit: 'Rooms with unused corner space',
      tradeoffs: ['Corner access harder', 'More furniture clutter']
    },
    {
      id: 'storage-003',
      name: 'Multi-function Layout',
      summary: 'Combines furniture with built-in storage capabilities.',
      priority: 'storage',
      changes: [
        'Use storage ottoman instead of coffee table',
        'Add storage bench near entrance',
        'Select furniture with drawers',
        'Reduce visible clutter'
      ],
      bestFit: 'Small spaces needing efficiency',
      tradeoffs: ['Furniture may be bulkier', 'Limited style options']
    }
  ],
  work_from_home: [
    {
      id: 'wfh-001',
      name: 'Dedicated Work Zone',
      summary: 'Creates a focused work area separated from living space.',
      priority: 'work_from_home',
      changes: [
        'Position desk near window for natural light',
        'Separate desk from main seating area',
        'Add task lighting setup',
        'Use room divider if possible'
      ],
      bestFit: 'Remote workers needing focus',
      tradeoffs: ['Less social seating area', 'Work always visible']
    },
    {
      id: 'wfh-002',
      name: 'Corner Office Layout',
      summary: 'Utilizes a corner for compact but functional workspace.',
      priority: 'work_from_home',
      changes: [
        'Place desk in quiet corner',
        'Add monitor shelf above desk',
        'Keep work zone minimal',
        'Position seating away from work corner'
      ],
      bestFit: 'Small apartments with WFH needs',
      tradeoffs: ['Corner may feel cramped', 'Limited desk space']
    },
    {
      id: 'wfh-003',
      name: 'Convertible Work Layout',
      summary: 'Flexible setup that switches between work and relaxation.',
      priority: 'work_from_home',
      changes: [
        'Use foldable desk setup',
        'Position near power outlets',
        'Add ergonomic chair option',
        'Keep work items organized'
      ],
      bestFit: 'Part-time remote workers',
      tradeoffs: ['Setup time required', 'Less dedicated feel']
    }
  ],
  family_friendly: [
    {
      id: 'family-001',
      name: 'Play Zone Layout',
      summary: 'Designates safe open area for children with furniture on edges.',
      priority: 'family_friendly',
      changes: [
        'Create central play area',
        'Push furniture to walls',
        'Remove sharp-corner furniture',
        'Add storage for toys'
      ],
      bestFit: 'Homes with young children',
      tradeoffs: ['Less adult seating', 'Higher maintenance']
    },
    {
      id: 'family-002',
      name: 'Multi-age Layout',
      summary: 'Balances adult comfort with child accessibility.',
      priority: 'family_friendly',
      changes: [
        'Lower coffee table height',
        'Add child-sized seating',
        'Keep walkways wide',
        'Position fragile items high'
      ],
      bestFit: 'Mixed-age family homes',
      tradeoffs: ['Aesthetics compromised', 'More furniture']
    },
    {
      id: 'family-003',
      name: 'Safety-First Layout',
      summary: 'Prioritizes child safety with rounded corners and clear paths.',
      priority: 'family_friendly',
      changes: [
        'Use rounded furniture',
        'Remove trip hazards',
        'Anchor all furniture',
        'Add soft flooring zone'
      ],
      bestFit: 'Safety-conscious families',
      tradeoffs: ['Limited furniture choices', 'Higher cost']
    }
  ],
  minimal: [
    {
      id: 'minimal-001',
      name: 'Essentials Only',
      summary: 'Reduces furniture to absolute necessities.',
      priority: 'minimal',
      changes: [
        'Remove all decorative pieces',
        'Keep only primary seating',
        'Use multi-functional items',
        'Clear all surfaces'
      ],
      bestFit: 'Minimalist lifestyle',
      tradeoffs: ['May feel empty', 'Less functionality']
    },
    {
      id: 'minimal-002',
      name: 'Clean Lines Layout',
      summary: 'Emphasizes geometric simplicity and clean visual lines.',
      priority: 'minimal',
      changes: [
        'Align all furniture parallel',
        'Use rectangular shapes only',
        'Remove clutter items',
        'Keep color palette neutral'
      ],
      bestFit: 'Modern minimalist design',
      tradeoffs: ['Less visual interest', 'Strict discipline needed']
    },
    {
      id: 'minimal-003',
      name: 'Open Space Layout',
      summary: 'Maximum floor visibility with furniture pushed to perimeter.',
      priority: 'minimal',
      changes: [
        'Position everything against walls',
        'Remove center furniture',
        'Use wall storage only',
        'Keep walkways unobstructed'
      ],
      bestFit: 'Small spaces needing openness',
      tradeoffs: ['Walls may feel heavy', 'Limited social arrangement']
    }
  ]
}

export function generateSuggestions(
  input: SuggestionGeneratorInput,
  priority: LayoutPriority
): LayoutSuggestion[] {
  const templates = SUGGESTION_TEMPLATES[priority] || []
  
  return templates.map(template => ({
    ...template,
    changes: adaptChangesToContext(template.changes, input),
    bestFit: adaptBestFit(template.bestFit, input)
  }))
}

function adaptChangesToContext(changes: string[], input: SuggestionGeneratorInput): string[] {
  const adapted: string[] = []
  
  for (const change of changes) {
    if (change.includes('Remove') && input.furnitureCount < 2) {
      adapted.push(`Consider: ${change.toLowerCase()}`)
    } else if (change.includes('Add') && input.furnitureCount >= 5) {
      adapted.push(`Optional: ${change.toLowerCase()} (space may be limited)`)
    } else {
      adapted.push(change)
    }
  }
  
  return adapted
}

function adaptBestFit(bestFit: string, input: SuggestionGeneratorInput): string {
  if (input.roomArea < 100) {
    return `${bestFit} (optimized for small space)`
  }
  return bestFit
}

export function getPriorityLabel(priority: LayoutPriority): string {
  const labels: Record<LayoutPriority, string> = {
    spaciousness: 'Spaciousness',
    storage: 'Storage',
    work_from_home: 'Work from Home',
    family_friendly: 'Family Friendly',
    minimal: 'Minimal'
  }
  return labels[priority]
}

export function getPriorityIcon(priority: LayoutPriority): string {
  const icons: Record<LayoutPriority, string> = {
    spaciousness: '🏠',
    storage: '📦',
    work_from_home: '💻',
    family_friendly: '👨‍👩‍👧',
    minimal: '✨'
  }
  return icons[priority]
}