# 010 — AI Layout Suggestion Spike

## Feature Name
AI Layout Suggestion Spike

## Goal
Explore a constrained AI-assisted layout suggestion workflow after the manual MVP is usable.

## Product Context
The original PRD includes AI-assisted layout generation. This should not be part of V1, but it is a natural V2 direction once the floor plan and furniture model are stable.

## Scope

### In Scope
- Define prompt input for layout intent
- Generate text-based layout suggestions first
- Optionally generate structured furniture placement suggestions
- Add mock AI mode for local development
- Add constraints based on room size and load-bearing walls
- Save generated suggestions as layout variants

### Out of Scope
- Fully automatic architectural redesign
- Removing or modifying structural walls
- Construction-grade safety validation
- Photorealistic furnishing generation

## Suggested First AI Capability

Start with text + structured JSON suggestions, not image generation.

Example input:

```text
I want a work-from-home friendly layout with more storage and an open living room.
```

Example output:

```json
{
  "summary": "Prioritize a compact desk zone near the window and keep the central living area open.",
  "furnitureChanges": [
    { "category": "desk", "room": "bedroom", "placementIntent": "near window" },
    { "category": "cabinet", "room": "living_room", "placementIntent": "against long wall" }
  ],
  "tradeoffs": ["More storage reduces open wall space."]
}
```

## Implementation Tasks

1. Add layout suggestion panel.
2. Add user intent input.
3. Add mock suggestion provider.
4. Define `LayoutSuggestion` type.
5. Display generated suggestions.
6. Allow saving a suggestion as a layout note/version.
7. Optional: call real LLM API behind feature flag.
8. Add tests for suggestion parsing and validation.

## Acceptance Criteria

- User can enter layout intent.
- App can generate mock or real suggestion output.
- Suggestion includes summary, recommended changes, and tradeoffs.
- Suggestion can be saved to project state.
- Feature can run without real API key in mock mode.

## async-dev Execution Note

Treat this as a spike. The goal is to learn whether AI suggestions improve the workflow, not to build a perfect AI designer.
