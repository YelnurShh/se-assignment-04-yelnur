import { minutesToLabel } from "@/lib/time";
import type { Room } from "@/lib/types";

interface TimelineProps {
  room: Room;
  candidateStart: number | null;
  candidateEnd: number | null;
  currentTime: number;
  candidateAvailable: boolean | null;
}

const HOUR_TICKS = Array.from({ length: 25 }, (_, i) => i * 60);

const BOOKING_COLORS = [
  "bg-slate-400",
  "bg-slate-500",
  "bg-slate-600",
];

export function Timeline({
  room,
  candidateStart,
  candidateEnd,
  currentTime,
  candidateAvailable,
}: TimelineProps) {
  const pct = (min: number) => (min / 1440) * 100;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Today&apos;s Schedule
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-400" />
            Booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />
            Current
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-sm ${
                candidateAvailable === true
                  ? "bg-emerald-400"
                  : candidateAvailable === false
                    ? "bg-rose-400"
                    : "bg-blue-300"
              }`}
            />
            Your request
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-14 w-full overflow-hidden rounded-lg bg-slate-100">
        {/* Blocked overlay */}
        {room.blocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-rose-100/80 text-xs font-semibold text-rose-600">
            Room Blocked
          </div>
        )}

        {/* Existing bookings */}
        {room.bookings.map((b, i) => (
          <div
            key={b.id}
            className={`absolute top-0 flex h-full items-center justify-center text-[10px] font-medium text-white ${
              BOOKING_COLORS[i % BOOKING_COLORS.length]
            }`}
            style={{ left: `${pct(b.start)}%`, width: `${pct(b.end - b.start)}%` }}
            title={`${b.label} ${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`}
          >
            {b.end - b.start >= 45 ? b.label : ""}
          </div>
        ))}

        {/* Current time marker */}
        <div
          className="absolute top-0 z-10 h-full w-0.5 bg-amber-400"
          style={{ left: `${pct(currentTime)}%` }}
        >
          <span className="absolute -top-0 -translate-y-full whitespace-nowrap text-[10px] font-semibold text-amber-600">
            Now {minutesToLabel(currentTime)}
          </span>
        </div>

        {/* Candidate interval */}
        {candidateStart !== null && candidateEnd !== null && (
          <div
            className={`absolute top-0 flex h-full items-center justify-center text-[10px] font-semibold text-white ${
              candidateAvailable === true
                ? "bg-emerald-400/80"
                : candidateAvailable === false
                  ? "bg-rose-400/80"
                  : "bg-blue-300/70"
            }`}
            style={{
              left: `${pct(candidateStart)}%`,
              width: `${pct(candidateEnd - candidateStart)}%`,
            }}
          >
            {candidateEnd - candidateStart >= 30 ? "Your request" : ""}
          </div>
        )}
      </div>

      {/* Hour ticks */}
      <div className="relative mt-1.5 h-5 w-full">
        {HOUR_TICKS.filter((t) => t % 360 === 0).map((t) => (
          <div
            key={t}
            className="absolute -translate-x-1/2 text-[10px] text-slate-400"
            style={{ left: `${pct(t)}%` }}
          >
            {t % 120 === 0 ? minutesToLabel(t) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
