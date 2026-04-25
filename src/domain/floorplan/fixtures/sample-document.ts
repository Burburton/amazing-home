import { FloorPlanDocument } from '../types'

const DEMO_FLOORPLAN_DATA_URI = 'data:image/svg+xml;base64,' + Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <rect x="50" y="50" width="300" height="200" fill="#f5f5f5" stroke="#374151" stroke-width="2"/>
  <line x1="50" y1="50" x2="350" y2="50" stroke="#374151" stroke-width="8"/>
  <line x1="350" y1="50" x2="350" y2="250" stroke="#374151" stroke-width="8"/>
  <line x1="50" y1="250" x2="350" y2="250" stroke="#374151" stroke-width="8"/>
  <line x1="50" y1="50" x2="50" y2="250" stroke="#374151" stroke-width="8"/>
  <rect x="150" y="245" width="60" height="10" fill="#f5f5f5"/>
  <line x1="150" y1="250" x2="210" y2="250" stroke="#374151" stroke-width="2"/>
  <rect x="120" y="45" width="80" height="10" fill="#87CEEB"/>
  <line x1="120" y1="50" x2="200" y2="50" stroke="#87CEEB" stroke-width="2"/>
  <line x1="200" y1="50" x2="200" y2="180" stroke="#374151" stroke-width="6"/>
  <text x="120" y="140" font-family="Arial" font-size="14" fill="#6b7280">Living Room</text>
  <text x="260" y="140" font-family="Arial" font-size="14" fill="#6b7280">Bedroom</text>
</svg>
`).toString('base64')

export const sampleFloorPlanDocument: FloorPlanDocument = {
  version: '1.0.0',
  project: {
    id: 'sample-project-001',
    name: 'Sample Apartment',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-04-25T00:00:00.000Z',
  },
  sourceImage: {
    id: 'sample-image-001',
    name: 'demo-floorplan.svg',
    objectUrl: DEMO_FLOORPLAN_DATA_URI,
    width: 400,
    height: 300,
    uploadedAt: '2026-01-01T00:00:00.000Z',
  },
  walls: [
    {
      id: 'wall-001',
      start: { x: 100, y: 100 },
      end: { x: 300, y: 100 },
      thickness: 10,
      isLoadBearing: true,
    },
    {
      id: 'wall-002',
      start: { x: 300, y: 100 },
      end: { x: 300, y: 250 },
      thickness: 10,
      isLoadBearing: true,
    },
    {
      id: 'wall-003',
      start: { x: 100, y: 100 },
      end: { x: 100, y: 250 },
      thickness: 10,
      isLoadBearing: true,
    },
    {
      id: 'wall-004',
      start: { x: 100, y: 250 },
      end: { x: 300, y: 250 },
      thickness: 10,
      isLoadBearing: true,
    },
  ],
  rooms: [
    {
      id: 'room-001',
      name: 'Living Room',
      wallIds: ['wall-001', 'wall-002', 'wall-003', 'wall-004'],
      floorMaterial: 'hardwood',
    },
  ],
  doors: [
    {
      id: 'door-001',
      wallId: 'wall-004',
      position: 0.5,
      width: 80,
      height: 200,
    },
  ],
  windows: [
    {
      id: 'window-001',
      wallId: 'wall-001',
      position: 0.3,
      width: 100,
      height: 120,
    },
  ],
  furniture: [
    {
      id: 'furniture-001',
      category: 'sofa',
      name: 'Sofa',
      position: { x: 150, y: 180 },
      rotation: 0,
      width: 180,
      height: 80,
      elevation: 45,
    },
    {
      id: 'furniture-002',
      category: 'coffee_table',
      name: 'Coffee Table',
      position: { x: 220, y: 180 },
      rotation: 0,
      width: 60,
      height: 60,
      elevation: 45,
    },
  ],
  settings: {
    ceilingHeight: 2.8,
    defaultWallThickness: 10,
    unit: 'px',
  },
}