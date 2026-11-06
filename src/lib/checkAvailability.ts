import type { Room, AvailabilityResult } from "./types";
import { intervalsOverlap, minutesToLabel } from "./time";

const MAX_DURATION = 120; // minutes
const DAY_END = 1440; // minutes in a day

export function checkAvailability(
  room: Room,
  start: number,
  end: number,
  currentTime: number,
): AvailabilityResult {
  if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(currentTime) || currentTime < 0 || currentTime >= DAY_END) {
    return { available: false, reason: "Use whole-minute times and a current time within the day." };
  }
  // AC1: 0 <= start < end <= 1440, and start strictly later than currentTime
  if (start < 0) {
    return {
      available: false,
      reason: "Start time must be between 00:00 and 23:59.",
    };
  }
  if (end > DAY_END) {
    return {
      available: false,
      reason: "End time cannot be later than 24:00 (end of day).",
    };
  }
  if (start >= end) {
    return {
      available: false,
      reason: `End time must be later than the start time (${minutesToLabel(start)}).`,
    };
  }
  if (start <= currentTime) {
    return {
      available: false,
      reason: `Start time must be after the current time (${minutesToLabel(currentTime)}). Please choose a start time later than ${minutesToLabel(currentTime)}.`,
    };
  }

  // AC2: reject requests longer than 120 minutes
  if (end - start > MAX_DURATION) {
    return {
      available: false,
      reason: `This booking is ${end - start} minutes, but the maximum is ${MAX_DURATION} minutes. Please choose a shorter interval.`,
    };
  }

  // AC3: reject when room is blocked
  if (room.blocked) {
    return {
      available: false,
      reason: "This room is currently blocked and unavailable for booking.",
    };
  }

  // AC4: reject intervals overlapping existing bookings (touching is allowed)
  for (const booking of room.bookings) {
    if (intervalsOverlap(start, end, booking.start, booking.end)) {
      return {
        available: false,
        reason: `This time overlaps with an existing booking: "${booking.label}" (${minutesToLabel(booking.start)}–${minutesToLabel(booking.end)}). Back-to-back times are allowed, so try starting at ${minutesToLabel(booking.end)} or later.`,
      };
    }
  }

  return {
    available: true,
    reason: `${room.name} is available from ${minutesToLabel(start)} to ${minutesToLabel(end)} (${end - start} min).`,
  };
}
