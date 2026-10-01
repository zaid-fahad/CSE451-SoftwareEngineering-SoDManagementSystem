import React, { useState, useEffect } from 'react';
import { DAYS, HOURS } from '../../services/useSchedule';
import { AvailabilitySlot, DayOfWeek } from '../../model/schedule';
import { api } from '../../services/api';
import { Button } from '../UI/Button';
import { X, Clock, AlertCircle, Save, RotateCcw } from 'lucide-react';

interface ManagerScheduleOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | number;
  studentName: string;
  semesterName: string;
  existingSlots: AvailabilitySlot[];
  onOverridesSaved: () => void;
}

export const ManagerScheduleOverrideModal: React.FC<ManagerScheduleOverrideModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  semesterName,
  existingSlots,
  onOverridesSaved,
}) => {
  const [localSlots, setLocalSlots] = useState<AvailabilitySlot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalSlots(existingSlots);
      setErrorMsg(null);
    }
  }, [isOpen, existingSlots]);

  if (!isOpen) return null;

  const getSlot = (day: DayOfWeek, time: string): AvailabilitySlot | undefined => {
    return localSlots.find((s) => s.day === day && s.time === time);
  };

  const handleToggleSlot = (day: DayOfWeek, time: string) => {
    const existing = getSlot(day, time);
    if (existing?.type === 'Class') {
      // Classes from IRAS are fixed
      return;
    }

    setLocalSlots((prev) => {
      const idx = prev.findIndex((s) => s.day === day && s.time === time);
      if (idx !== -1) {
        // Toggle Busy <-> Free
        const currentType = prev[idx].type;
        const newType = currentType === 'Busy' ? 'Free' : 'Busy';
        const updated = [...prev];
        updated[idx] = { ...updated[idx], type: newType };
        return updated;
      } else {
        // Add new slot as Busy
        return [...prev, { id: `slot-${day}-${time}`, day, time, type: 'Busy' }];
      }
    });
  };

  // Determine which override slots changed compared to original existingSlots
  const changedOverrides = localSlots.filter((curr) => {
    if (curr.type === 'Class') return false;
    const orig = existingSlots.find((s) => s.day === curr.day && s.time === curr.time);
    const origType = orig ? orig.type : 'Free';
    return curr.type !== origType;
  });

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const overridesPayload = changedOverrides.map((s) => {
        const [h, m] = s.time.split(':').map(Number);
        const endHour = String(h + 1).padStart(2, '0');
        const endTime = `${endHour}:${String(m).padStart(2, '0')}`;

        return {
          day_of_week: s.day,
          start_time: s.time,
          end_time: endTime,
          is_busy: s.type === 'Busy',
        };
      });

      await api.post('/schedule/manager-override', {
        student_id: Number(studentId),
        semester: semesterName,
        overrides: overridesPayload,
      });

      onOverridesSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to save schedule overrides.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn text-left">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Manual Schedule Override: {studentName}
              </h2>
              <p className="text-xs text-slate-500">
                Semester: <strong className="text-blue-600 font-semibold">{semesterName}</strong> • Manager bypass mode overrides availability even when onboarding is closed.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Interactive Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300" />
                <span className="text-slate-600">Free Slot (Click to toggle Busy)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-200 border border-amber-400" />
                <span className="text-slate-600">Manual Busy Override</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-200 border border-rose-400" />
                <span className="text-slate-600">IRAS Class (Fixed)</span>
              </div>
            </div>

            {changedOverrides.length > 0 && (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                {changedOverrides.length} pending change(s)
              </span>
            )}
          </div>

          {/* Override Grid */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-2.5 font-bold border-r border-slate-200 w-20 text-center">Time</th>
                  {DAYS.map((day) => (
                    <th key={day} className="p-2.5 font-bold border-r border-slate-200 text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="p-2 border-r border-slate-200 text-[11px] font-mono font-medium text-slate-500 text-center bg-slate-50">
                      {hour}
                    </td>
                    {DAYS.map((day) => {
                      const slot = getSlot(day, hour);
                      const type = slot ? slot.type : 'Free';
                      const isClass = type === 'Class';
                      const isBusy = type === 'Busy';

                      return (
                        <td
                          key={`${day}-${hour}`}
                          onClick={() => !isClass && handleToggleSlot(day, hour)}
                          className={`p-2 border-r border-slate-200 text-center transition-all select-none ${
                            isClass
                              ? 'bg-rose-100 text-rose-800 font-bold cursor-not-allowed border-rose-200'
                              : isBusy
                              ? 'bg-amber-200 text-amber-900 font-bold hover:bg-amber-300 cursor-pointer shadow-inner'
                              : 'bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                          }`}
                          title={
                            isClass
                              ? `${slot?.courseCode || 'Class'} (Locked)`
                              : isBusy
                              ? 'Click to clear override and mark Free'
                              : 'Click to mark Busy override'
                          }
                        >
                          <div className="text-[10px] leading-tight">
                            {isClass ? slot?.courseCode || 'CLASS' : isBusy ? 'BUSY' : 'FREE'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocalSlots(existingSlots)}
            disabled={changedOverrides.length === 0 || isSaving}
            className="!py-1.5 !px-3 text-xs gap-1.5 text-slate-600"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Grid</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
              className="!py-1.5 !px-4 text-xs"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleSave}
              disabled={changedOverrides.length === 0 || isSaving}
              isLoading={isSaving}
              className="!py-1.5 !px-4 text-xs font-bold gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Overrides {changedOverrides.length > 0 ? `(${changedOverrides.length})` : ''}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
