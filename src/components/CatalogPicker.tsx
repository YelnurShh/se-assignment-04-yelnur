import { EQUIPMENT, type CatalogRoom } from '@/config/catalog';

type Props = {
  rooms: readonly CatalogRoom[]; roomId: string; attendees: string; equipment: readonly string[];
  onRoom: (id: string) => void; onAttendees: (value: string) => void; onEquipment: (value: string) => void;
};

export function CatalogPicker({ rooms, roomId, attendees, equipment, onRoom, onAttendees, onEquipment }: Props) {
  return (
    <section className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold">Find a room</h2>
      <label className="block">Attendees
        <input className="ml-3 w-24 rounded border border-slate-300 p-1" type="number" min="1" step="1"
          value={attendees} onChange={e => onAttendees(e.target.value)} />
      </label>
      <fieldset className="flex flex-wrap gap-3">
        <legend>Required equipment</legend>
        {EQUIPMENT.map(item => <label key={item} className="inline-flex items-center gap-2">
          <input type="checkbox" checked={equipment.includes(item)} onChange={() => onEquipment(item)} />{item}
        </label>)}
      </fieldset>
      {rooms.length === 0 ? <p role="status">No rooms match. Reduce attendees or remove equipment requirements.</p> :
        <label className="block">Room
          <select className="mt-1 block w-full rounded border border-slate-300 p-2" value={roomId} onChange={e => onRoom(e.target.value)}>
            {rooms.map(room => <option key={room.id} value={room.id}>
              {room.name} · {room.capacity} seats{room.blocked ? ' · Blocked' : ''}
            </option>)}
          </select>
        </label>}
    </section>
  );
}
