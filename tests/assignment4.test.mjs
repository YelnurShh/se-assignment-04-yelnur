import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, EQUIPMENT } from '../src/config/catalog.ts';
import { filterRooms } from '../src/lib/roomFilters.ts';
import { checkAvailability } from '../src/lib/checkAvailability.ts';
const check = (room, start, end) => checkAvailability(room, start, end, 540);

const base = CATALOG[0];
const other = CATALOG.find(r => r.id === 'room-204');
const blocked = CATALOG.find(r => r.blocked);
test('F1 exact capacity is included', () => assert.ok(filterRooms(CATALOG, base.capacity, []).includes(base)));
test('F1 capacity one seat short is excluded', () => assert.ok(!filterRooms(CATALOG, base.capacity+1, []).includes(base)));
test('F2 all required items must be present', () => {
 const found = filterRooms(CATALOG, 1, [EQUIPMENT[0], EQUIPMENT[1]]);
 assert.ok(found.includes(base));
 assert.ok(!found.includes(other));
 assert.ok(found.every(r => r.equipment.includes(EQUIPMENT[0]) && r.equipment.includes(EQUIPMENT[1])));
});
test('F3 blocked match remains visible and cannot be available', () => {
 assert.ok(filterRooms(CATALOG, 1, []).includes(blocked));
 assert.equal(check(blocked, 900, 960).available, false);
});
test('F4 no eligible rooms yields an empty list', () => assert.deepEqual(filterRooms(CATALOG, 1000, []), []));
test('invalid attendees are not silently rounded or defaulted', () => {
 for (const count of [0, -1, 1.5, NaN, Infinity]) assert.deepEqual(filterRooms(CATALOG, count, []), []);
});
test('chosen room supplies the booking data', () => {
 assert.equal(check(base, 600, 660).available, false);
 assert.equal(check(other, 600, 660).available, true);
});
test('catalog booking lists survive repeated checks and filtering', () => {
 const saved = structuredClone(CATALOG);
 for (const room of filterRooms(CATALOG, 1, [])) { check(room, 600, 660); check(room, 900, 960); }
 assert.deepEqual(CATALOG, saved);
});
test('catalog has unique ids, complete equipment and distinct booking arrays', () => {
 assert.ok(CATALOG.length >= 4);
 assert.equal(new Set(CATALOG.map(r => r.id)).size, CATALOG.length);
 assert.equal(new Set(CATALOG.map(r => r.bookings)).size, CATALOG.length);
 for (const room of CATALOG) assert.ok(room.name && room.equipment.length && room.bookings.length);
});
test('120 is accepted and 121 rejected in a free evening slot', () => {
 assert.equal(check(base, 1080, 1200).available, true);
 assert.equal(check(base, 1080, 1201).available, false);
});
