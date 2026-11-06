
import test from "node:test";
import assert from "node:assert/strict";

import { checkAvailability } from "../src/lib/checkAvailability.ts";
import { labelToMinutes } from "../src/lib/time.ts";

const NOW = 540;

function createRoom(overrides = {}) {
  return {
    id: "room-101",
    name: "Room 101",
    building: "Engineering",
    capacity: 30,
    blocked: false,
    bookings: [
      {
        id: "b1",
        label: "Calculus",
        start: 600,
        end: 660,
      },
    ],
    ...overrides,
  };
}

function getAvailability(room, start, end) {
  return checkAvailability(room, start, end, NOW).available;
}

function deepFreeze(value) {
  if (value !== null && typeof value === "object") {
    for (const key of Object.keys(value)) {
      deepFreeze(value[key]);
    }
    Object.freeze(value);
  }
  return value;
}

// AC1: 1440 is a valid exclusive end-of-day boundary.
test("T16 - End exactly at 1440 is valid", () => {
  const room = createRoom();

  assert.strictEqual(
    getAvailability(room, 1320, 1440),
    true,
    "22:00–24:00 is valid and lasts exactly 120 minutes",
  );
});

// AC1: Time values must be integer minutes.
test("T17 - Fractional start minute must be rejected", () => {
  const room = createRoom();

  assert.strictEqual(
    getAvailability(room, 660.5, 720),
    false,
    "Fractional start values violate the integer-minute contract",
  );
});

// AC1 / UI boundary consistency:
// 24:00 is a valid end boundary, but 24:01 is not.
test("T18 - Parser accepts 24:00 but rejects 24:01", () => {
  assert.strictEqual(
    labelToMinutes("24:00"),
    1440,
    "24:00 must parse to the end-of-day boundary",
  );

  assert.strictEqual(
    labelToMinutes("24:01"),
    null,
    "Times beyond 24:00 must be rejected",
  );
});

// AC4 / AC5: Multiple bookings must be checked.
// Frozen objects protect the entire fixture against mutation.
test("T19 - Frozen multiple-booking data is preserved", () => {
  const room = createRoom({
    bookings: [
      {
        id: "b1",
        label: "Calculus",
        start: 600,
        end: 660,
      },
      {
        id: "b2",
        label: "Physics",
        start: 780,
        end: 840,
      },
    ],
  });

  const snapshot = structuredClone(room);
  deepFreeze(room);

  // Available: begins exactly when the first booking ends.
  assert.strictEqual(
    getAvailability(room, 660, 720),
    true,
    "Non-overlapping interval must be available",
  );

  assert.deepStrictEqual(
    room,
    snapshot,
    "Available path must preserve all room and booking data",
  );

  // Unavailable: overlaps the SECOND existing booking.
  assert.strictEqual(
    getAvailability(room, 800, 850),
    false,
    "Overlap with the second booking must be rejected",
  );

  assert.deepStrictEqual(
    room,
    snapshot,
    "Unavailable path must preserve all room and booking data",
  );

  // Available: begins exactly when the second booking ends.
  assert.strictEqual(
    getAvailability(room, 840, 900),
    true,
    "Touching the second booking endpoint must be allowed",
  );

  assert.deepStrictEqual(
    room,
    snapshot,
    "All booking records must remain completely unchanged",
  );

  assert.strictEqual(Object.isFrozen(room), true);
  assert.strictEqual(Object.isFrozen(room.bookings), true);

  for (const booking of room.bookings) {
    assert.strictEqual(
      Object.isFrozen(booking),
      true,
      `${booking.id} must remain frozen`,
    );
  }
});
