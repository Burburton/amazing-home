import { FloorPlanDocument } from '../types'

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
    name: 'floorplan-sample.png',
    objectUrl: 'blob:sample',
    width: 800,
    height: 600,
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