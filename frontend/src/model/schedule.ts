export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type SlotType = 'Free' | 'Class' | 'Busy' | 'Duty';

export interface AvailabilitySlot {
  id: string;
  day: DayOfWeek;
  time: string; // e.g. '08:00 AM', '09:00 AM'
  type: SlotType;
  courseCode?: string;
  dutyTitle?: string;
}

export interface IRASParseRequest {
  raw_text: string;
}

export interface IRASParseResponse {
  slots_parsed: number;
  slots: AvailabilitySlot[];
}
