import { useState, useCallback } from 'react';
import { DayOfWeek, SlotType, AvailabilitySlot } from '../model/schedule';
import { api } from './api';

export const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const HOURS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
];

// Default pre-populated realistic dummy data schedule
const defaultDummySchedule: Record<string, { type: SlotType; courseCode?: string }> = {
  'Monday-10:00 AM': { type: 'Class', courseCode: 'CSE451' },
  'Monday-11:00 AM': { type: 'Class', courseCode: 'CSE451' },
  'Monday-03:00 PM': { type: 'Busy' },

  'Tuesday-02:00 PM': { type: 'Class', courseCode: 'MAT211' },
  'Tuesday-03:00 PM': { type: 'Class', courseCode: 'MAT211' },

  'Wednesday-10:00 AM': { type: 'Class', courseCode: 'CSE451' },
  'Wednesday-11:00 AM': { type: 'Class', courseCode: 'CSE451' },

  'Thursday-02:00 PM': { type: 'Class', courseCode: 'MAT211' },
  'Thursday-03:00 PM': { type: 'Class', courseCode: 'MAT211' },

  'Friday-09:00 AM': { type: 'Class', courseCode: 'PHY102' },
  'Friday-10:00 AM': { type: 'Class', courseCode: 'PHY102' },
  'Friday-01:00 PM': { type: 'Busy' },
};

// Helper to generate initial 6-day x 10-hour grid with pre-populated dummy data
const initializeGrid = (): AvailabilitySlot[] => {
  const grid: AvailabilitySlot[] = [];
  DAYS.forEach((day) => {
    HOURS.forEach((time) => {
      const key = `${day}-${time}`;
      const dummy = defaultDummySchedule[key];
      grid.push({
        id: key,
        day,
        time,
        type: dummy ? dummy.type : 'Free',
        courseCode: dummy?.courseCode,
      });
    });
  });
  return grid;
};

export const useSchedule = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initializeGrid);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Toggle Busy/Free manually for a student slot (Class slots remain locked)
  const toggleSlot = useCallback((day: DayOfWeek, time: string) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.day === day && slot.time === time) {
          if (slot.type === 'Class') return slot; // Non-editable class slot
          const newType: SlotType = slot.type === 'Busy' ? 'Free' : 'Busy';
          return { ...slot, type: newType };
        }
        return slot;
      })
    );
  }, []);

  // Parse raw text from IRAS Portal (Regex matching days & course codes)
  const parseIRASText = useCallback(async (rawText: string): Promise<number> => {
    setIsLoading(true);
    let parsedCount = 0;

    try {
      const res = await api.post('/schedule/parse', { raw_text: rawText });
      if (res.data && res.data.slots) {
        setSlots(res.data.slots);
        return res.data.slots_parsed || res.data.slots.length;
      }
    } catch {
      // Fallback regex parsing engine
      const updatedGrid = initializeGrid();
      const textLines = rawText.split('\n');

      const dayMap: Record<string, DayOfWeek> = {
        mon: 'Monday',
        monday: 'Monday',
        tue: 'Tuesday',
        tuesday: 'Tuesday',
        wed: 'Wednesday',
        wednesday: 'Wednesday',
        thu: 'Thursday',
        thursday: 'Thursday',
        fri: 'Friday',
        friday: 'Friday',
        sat: 'Saturday',
        saturday: 'Saturday',
      };

      textLines.forEach((line) => {
        const lower = line.toLowerCase().trim();
        if (!lower) return;

        Object.keys(dayMap).forEach((key) => {
          if (lower.includes(key)) {
            const targetDay = dayMap[key];
            const courseMatch = line.match(/([A-Z]{2,4}\s*\d{3})/i);
            const courseCode = courseMatch ? courseMatch[1].toUpperCase() : 'CLASS';

            HOURS.forEach((hour) => {
              const hourNum = parseInt(hour.split(':')[0], 10);
              const isPM = hour.includes('PM') && hourNum !== 12;
              const normalizedHour = isPM ? hourNum + 12 : hourNum;

              if (lower.includes(hour.slice(0, 5).toLowerCase()) || lower.includes(`${normalizedHour}:00`)) {
                const targetIdx = updatedGrid.findIndex((s) => s.day === targetDay && s.time === hour);
                if (targetIdx !== -1) {
                  updatedGrid[targetIdx] = {
                    ...updatedGrid[targetIdx],
                    type: 'Class',
                    courseCode,
                  };
                  parsedCount++;
                }
              }
            });
          }
        });
      });

      setSlots(updatedGrid);
    } finally {
      setIsLoading(false);
    }

    return parsedCount;
  }, []);

  const loadDemoData = useCallback(() => {
    setSlots(initializeGrid());
  }, []);

  const resetGrid = useCallback(() => {
    // Reset all to free
    const emptyGrid: AvailabilitySlot[] = [];
    DAYS.forEach((day) => {
      HOURS.forEach((time) => {
        emptyGrid.push({ id: `${day}-${time}`, day, time, type: 'Free' });
      });
    });
    setSlots(emptyGrid);
  }, []);

  return {
    slots,
    isLoading,
    toggleSlot,
    parseIRASText,
    loadDemoData,
    resetGrid,
  };
};
