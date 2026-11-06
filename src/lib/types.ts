export interface Booking {
  id: string;
  label: string;
  start: number; // minutes from midnight
  end: number;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  bookings: Booking[];
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
}
