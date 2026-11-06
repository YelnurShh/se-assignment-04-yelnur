
import test from "node:test";
import assert from "node:assert/strict";
import { checkAvailability } from "../src/lib/checkAvailability.ts";

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

function assertAvailability(start, end, expected, overrides = {}) {
  const room = createRoom(overrides);
  const actual = checkAvailability(room, start, end, NOW).available;

  assert.strictEqual(actual, expected);
}

// AC4: Touching endpoints must not count as overlapping.
test("T01 - Starts exactly when existing booking ends", () => {
  assertAvailability(660, 720, true);
});

// AC1: Start must be strictly later than current time.
test("T02 - Start equals current time", () => {
  assertAvailability(540, 570, false);
});

// AC1: Empty intervals are invalid.
test("T03 - Start and end are equal", () => {
  assertAvailability(720, 720, false);
});

// AC1: End must be later than start.
test("T04 - End is earlier than start", () => {
  assertAvailability(750, 720, false);
});

// AC1: End cannot exceed 1440 minutes.
test("T05 - End exceeds end of day", () => {
  assertAvailability(1380, 1441, false);
});

// AC2: Exactly 120 minutes is allowed.
test("T06 - Duration equals 120 minutes", () => {
  assertAvailability(720, 840, true);
});

// AC2: More than 120 minutes is rejected.
test("T07 - Duration exceeds 120 minutes", () => {
  assertAvailability(720, 841, false);
});

// AC4: Ending at an existing booking's start is allowed.
test("T08 - Ends exactly when existing booking starts", () => {
  assertAvailability(570, 600, true);
});

// AC4: Partial overlap must be rejected.
test("T09 - Partially overlaps existing booking", () => {
  assertAvailability(630, 690, false);
});

// AC4: An interval containing an existing booking is invalid.
test("T10 - Contains the complete existing booking", () => {
  assertAvailability(570, 690, false);
});

// AC4: An interval inside an existing booking is invalid.
test("T11 - Lies inside existing booking", () => {
  assertAvailability(615, 645, false);
});

// AC4: Identical booking intervals overlap.
test("T12 - Identical interval conflicts", () => {
  assertAvailability(600, 660, false);
});

// AC3: Blocked rooms reject otherwise valid requests.
test("T13 - Blocked room rejects valid interval", () => {
  assertAvailability(660, 720, false, {
    blocked: true,
  });
});

// AC4: No bookings means no booking conflict.
test("T14 - Empty bookings allow valid interval", () => {
  assertAvailability(630, 690, true, {
    bookings: [],
  });
});

// AC5: Exact decisions and complete input data preservation.
test("T15 - Data preservation on available and unavailable paths", () => {
  const scenarios = [
    {
      name: "Available - endpoint touching",
      start: 660,
      end: 720,
      expected: true,
      overrides: {},
    },
    {
      name: "Unavailable - overlapping booking",
      start: 630,
      end: 690,
      expected: false,
      overrides: {},
    },
    {
      name: "Unavailable - blocked room",
      start: 660,
      end: 720,
      expected: false,
      overrides: { blocked: true },
    },
    {
      name: "Available - empty bookings",
      start: 630,
      end: 690,
      expected: true,
      overrides: { bookings: [] },
    },
    {
      name: "Unavailable - invalid duration",
      start: 720,
      end: 841,
      expected: false,
      overrides: {},
    },
  ];

  for (const scenario of scenarios) {
    const room = createRoom(scenario.overrides);

    // Deep snapshot of every room field and nested booking.
    const originalRoom = structuredClone(room);
    const originalStart = scenario.start;
    const originalEnd = scenario.end;
    const originalNow = NOW;

    const result = checkAvailability(
      room,
      scenario.start,
      scenario.end,
      NOW,
    );

    assert.strictEqual(
      result.available,
      scenario.expected,
      `${scenario.name}: incorrect availability decision`,
    );

    assert.deepStrictEqual(
      room,
      originalRoom,
      `${scenario.name}: room data was mutated`,
    );

    assert.deepStrictEqual(
      room.bookings,
      originalRoom.bookings,
      `${scenario.name}: bookings were mutated`,
    );

    assert.strictEqual(
      scenario.start,
      originalStart,
      `${scenario.name}: start changed`,
    );

    assert.strictEqual(
      scenario.end,
      originalEnd,
      `${scenario.name}: end changed`,
    );

    assert.strictEqual(
      NOW,
      originalNow,
      `${scenario.name}: current time changed`,
    );
  }
});
