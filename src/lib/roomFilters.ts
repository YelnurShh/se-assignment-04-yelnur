type MatchableRoom = { capacity: number; equipment: readonly string[] };

export function filterRooms<T extends MatchableRoom>(
  rooms: readonly T[], attendees: number, required: readonly string[],
): T[] {
  if (!Number.isSafeInteger(attendees) || attendees < 1) return [];
  return rooms.filter(room => room.capacity >= attendees &&
    required.every(item => room.equipment.includes(item)));
}
