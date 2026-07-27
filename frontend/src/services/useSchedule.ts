import { useState, useCallback, useEffect } from 'react';
import { DayOfWeek, AvailabilitySlot } from '../model/schedule';
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

const get24HourRange = (timeLabel: string): { start24: string; end24: string } => {
  const parts = timeLabel.split(' ');
  const time = parts[0];
  const ampm = parts[1];
  const hourPart = parseInt(time.split(':')[0], 10);
  const minutePart = time.split(':')[1];

  let hour24 = hourPart;
  if (ampm === 'PM' && hourPart !== 12) {
    hour24 += 12;
  } else if (ampm === 'AM' && hourPart === 12) {
    hour24 = 0;
  }

  const startHourStr = String(hour24).padStart(2, '0');
  const endHourStr = String(hour24 + 1).padStart(2, '0');

  return {
    start24: `${startHourStr}:${minutePart}`,
    end24: `${endHourStr}:${minutePart}`,
  };
};

export const useSchedule = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getEmptyGrid = useCallback(() => {
    const emptyGrid: AvailabilitySlot[] = [];
    DAYS.forEach((day) => {
      HOURS.forEach((time) => {
        emptyGrid.push({ id: `${day}-${time}`, day, time, type: 'Free' });
      });
    });
    return emptyGrid;
  }, []);

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/schedule/me');
      const dbSlots = res.data;

      const updatedGrid: AvailabilitySlot[] = [];
      DAYS.forEach((day) => {
        HOURS.forEach((time) => {
          const key = `${day}-${time}`;
          const { start24, end24 } = get24HourRange(time);

          const match = dbSlots.find(
            (dbSlot: any) =>
              dbSlot.day_of_week === day &&
              dbSlot.start_time < end24 &&
              dbSlot.end_time > start24
          );

          if (match) {
            updatedGrid.push({
              id: key,
              day,
              time,
              type: match.is_override ? 'Busy' : 'Class',
              courseCode: match.course_code || undefined,
            });
          } else {
            updatedGrid.push({
              id: key,
              day,
              time,
              type: 'Free',
            });
          }
        });
      });
      setSlots(updatedGrid);
    } catch (err) {
      console.error('Failed to fetch schedule, loading empty grid:', err);
      setSlots(getEmptyGrid());
    } finally {
      setIsLoading(false);
    }
  }, [getEmptyGrid]);

  useEffect(() => {
    const token = localStorage.getItem('sod_token');
    if (token) {
      fetchSchedule();
    } else {
      setSlots(getEmptyGrid());
    }
  }, [fetchSchedule, getEmptyGrid]);

  const toggleSlot = useCallback(
    async (day: DayOfWeek, time: string) => {
      const slot = slots.find((s) => s.day === day && s.time === time);
      if (!slot || slot.type === 'Class') return;

      const isBusy = slot.type === 'Free';
      const { start24, end24 } = get24HourRange(time);

      setSlots((prev) =>
        prev.map((s) => (s.day === day && s.time === time ? { ...s, type: isBusy ? 'Busy' : 'Free' } : s))
      );

      try {
        await api.post('/schedule/override', {
          day_of_week: day,
          start_time: start24,
          end_time: end24,
          is_busy: isBusy,
        });
      } catch (err) {
        console.error('Failed to save override:', err);
        setSlots((prev) =>
          prev.map((s) => (s.day === day && s.time === time ? { ...s, type: isBusy ? 'Free' : 'Busy' } : s))
        );
      }
    },
    [slots]
  );

  const parseIRASText = useCallback(
    async (rawText: string): Promise<number> => {
      setIsLoading(true);
      try {
        const res = await api.post('/schedule/parse', { raw_text: rawText });
        await fetchSchedule();
        return res.data.slots_parsed || 0;
      } catch (err: any) {
        const errMsg = err.response?.data?.detail || 'Failed to parse schedule.';
        throw new Error(errMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSchedule]
  );

  const loadDemoData = useCallback(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const resetGrid = useCallback(async () => {
    setSlots(getEmptyGrid());
  }, [getEmptyGrid]);

  return {
    slots,
    isLoading,
    toggleSlot,
    parseIRASText,
    fetchSchedule,
    loadDemoData,
    resetGrid,
  };
};
