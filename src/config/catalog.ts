import { createInitialRoom } from './room';
import type { Room } from '../lib/types';

export type CatalogRoom = Room & { equipment: readonly string[] };
export const EQUIPMENT = ['Projector', 'Whiteboard', 'Video conferencing'] as const;

export const CATALOG: readonly CatalogRoom[] = [
  { ...createInitialRoom(), equipment: ['Projector', 'Whiteboard'] },
  { id: 'room-204', name: 'Room 204', building: 'Engineering Block', capacity: 18,
    equipment: ['Whiteboard'], blocked: false,
    bookings: [{ id: 'b204', label: 'Circuits Workshop', start: 720, end: 780 }] },
  { id: 'studio-3', name: 'Studio 3', building: 'Media Centre', capacity: 42,
    equipment: ['Projector', 'Video conferencing'], blocked: false,
    bookings: [{ id: 'bs3', label: 'Media Seminar', start: 840, end: 900 }] },
  { id: 'room-307', name: 'Room 307', building: 'Science Block', capacity: 24,
    equipment: ['Projector', 'Whiteboard', 'Video conferencing'], blocked: true,
    bookings: [{ id: 'b307', label: 'Chemistry Tutorial', start: 660, end: 720 }] },
];
