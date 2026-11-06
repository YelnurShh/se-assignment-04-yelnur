import type { Room } from "../lib/types";

export function createInitialRoom(): Room {
  return {
  id: "room-101",
  name: "Room 101",
  building: "Engineering Block",
  capacity: 30,
  blocked: false,
  bookings: [
    { id: "b1", label: "Calculus 201", start: 600, end: 660 },
  ],
};
}

export const CURRENT_TIME = 540; // 09:00

