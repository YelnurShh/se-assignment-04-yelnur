import { useState } from "react";
import {
  Clock,
  DoorClosed,
  CheckCircle2,
  XCircle,
  Lock,
  LockOpen,
  CalendarDays,
} from "lucide-react";
import type { AvailabilityResult } from "@/lib/types";
import { checkAvailability } from "@/lib/checkAvailability";
import { labelToMinutes, minutesToLabel } from "@/lib/time";
import { CURRENT_TIME } from "@/config/room";
import { CATALOG } from "@/config/catalog";
import { filterRooms } from "@/lib/roomFilters";
import { CatalogPicker } from "@/components/CatalogPicker";
import { Timeline } from "@/components/Timeline";

function TimeInput({ id, label, value, example, onChange }: {
  id: string; label: string; value: string; example: string; onChange: (value: string) => void;
}) {
  return <div>
    <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
    <input id={id} type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={`e.g. ${example}`}
      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
  </div>;
}

export function RoomAvailabilityChecker() {
  const [roomId, setRoomId] = useState(CATALOG[0].id);
  const [attendees, setAttendees] = useState("1");
  const [equipment, setEquipment] = useState<string[]>([]);
  const matches = filterRooms(CATALOG, Number(attendees), equipment);
  const room = matches.find(item => item.id === roomId) ?? matches[0];
  const [startLabel, setStartLabel] = useState("10:00");
  const [endLabel, setEndLabel] = useState("11:00");
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const startMin = labelToMinutes(startLabel);
  const endMin = labelToMinutes(endLabel);

  function handleCheck() {
    if (!room) return;
    if (startMin === null || endMin === null) {
      setResult({
        available: false,
        reason:
          startMin === null
            ? `Start time "${startLabel}" is not a valid time. Use 24-hour HH:MM format (e.g. 09:00, 14:30).`
            : `End time "${endLabel}" is not a valid time. Use 24-hour HH:MM format (e.g. 09:00, 14:30).`,
      });
      return;
    }
    setResult(checkAvailability(room, startMin, endMin, CURRENT_TIME));
  }

  function formatDuration(min: number | null): string {
    if (min === null) return "—";
    return `${min} min`;
  }

  const duration =
    startMin !== null && endMin !== null ? endMin - startMin : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Smart Campus Room Availability
              </h1>
              <p className="text-sm text-slate-500">
                Check a room&apos;s availability before booking
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <CatalogPicker rooms={matches} roomId={room?.id ?? ""} attendees={attendees} equipment={equipment}
          onRoom={id => { setRoomId(id); setResult(null); }}
          onAttendees={value => { setAttendees(value); setResult(null); }}
          onEquipment={item => {
            setEquipment(items => items.includes(item) ? items.filter(value => value !== item) : [...items, item]);
            setResult(null);
          }} />
        {room && <div className="grid gap-6 md:grid-cols-5">
          {/* Left: room info + form */}
          <div className="md:col-span-3 space-y-6">
            {/* Room card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <DoorClosed className="mt-0.5 h-5 w-5 text-slate-400" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {room.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {room.building} · Capacity {room.capacity}
                    </p>
                    <p className="text-sm text-slate-600">{room.equipment.join(", ")}</p>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    room.blocked
                      ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
                >
                  {room.blocked ? (
                    <>
                      <Lock className="h-3.5 w-3.5" /> Blocked
                    </>
                  ) : (
                    <>
                      <LockOpen className="h-3.5 w-3.5" /> Open
                    </>
                  )}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <Clock className="h-4 w-4" />
                <span>
                  Current time:{" "}
                  <strong>{minutesToLabel(CURRENT_TIME)}</strong> (for testing)
                </span>
              </div>
            </section>

            {/* Booking form */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">
                Check a Time Interval
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <TimeInput id="start-time" label="Start time (HH:MM)" value={startLabel} example="10:00"
                  onChange={value => { setStartLabel(value); setResult(null); }} />
                <TimeInput id="end-time" label="End time (HH:MM)" value={endLabel} example="11:00"
                  onChange={value => { setEndLabel(value); setResult(null); }} />
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span>
                  Duration:{" "}
                  <strong className="text-slate-700">
                    {formatDuration(duration)}
                  </strong>
                </span>
                <span>Max: 120 min</span>
              </div>

              <button
                onClick={handleCheck}
                className="mt-4 w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 active:scale-[0.99]"
              >
                Check Availability
              </button>
            </section>

            {/* Result */}
            {result && (
              <section role="status" data-testid="availability-result"
                className={`rounded-2xl border p-5 shadow-sm transition ${
                  result.available
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.available ? (
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" />
                  )}
                  <div>
                    <p
                      className={`text-base font-bold ${
                        result.available ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {result.available ? "Available" : "Unavailable"}
                    </p>
                    {result.reason && (
                      <p
                        className={`mt-0.5 text-sm ${
                          result.available
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {result.reason}
                      </p>
                    )}
                    {!result.available && (
                      <p className="mt-1 text-xs text-slate-500">
                        No existing bookings were modified.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right: timeline + existing bookings */}
          <div className="md:col-span-2 space-y-6">
            <Timeline
              room={room}
              candidateStart={result ? startMin : null}
              candidateEnd={result ? endMin : null}
              currentTime={CURRENT_TIME}
              candidateAvailable={result ? result.available : null}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Existing Bookings
              </h3>
              {room.bookings.length === 0 ? (
                <p className="text-sm text-slate-400">No bookings today.</p>
              ) : (
                <ul className="space-y-2">
                  {room.bookings.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {b.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {minutesToLabel(b.start)}–{minutesToLabel(b.end)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>}
      </main>
    </div>
  );
}
