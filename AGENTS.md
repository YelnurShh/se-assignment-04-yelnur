# Project
Smart Campus room availability checker with one visible room, fictional bookings and a fixed clock.

## Constraints
Preserve AC1 to AC6: reject invalid or past intervals, durations above 120 minutes, blocked rooms and overlaps. Allow touching endpoints. Never mutate bookings. Preserve desktop and mobile feedback.
Do not add login, backend, database, saved bookings or unrelated features.

## Structure
src/components contains the UI. src/lib contains booking logic and time helpers. tests contains executable Node regression tests.

## Engineering rules
Use pure functions and the smallest justified module boundary. Use at most two justified patterns. Do not add Strategy without multiple real policies, Adapter without multiple real formats, or unnecessary classes.
Keep public function signatures and existing messages stable. Never weaken existing assertions.

## Verification
Use Node 24 or later.
node --import ./tests/register.mjs --test --test-reporter=tap tests/improved.test.mjs tests/practice9.test.mjs
npm run typecheck
npm run build
Check the existing UI on desktop and at 390 pixels wide.
Report changed files, rationale, actual test counts and any unverified checks.
Explicitly read this file before editing; do not claim automatic loading.
