import React from 'react';
import { DayOfWeek, AvailabilitySlot } from '../../model/schedule';
import { DAYS, HOURS } from '../../services/useSchedule';
import { BookOpen, Clock, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../UI/Button';

interface AvailabilityGridProps {
  slots: AvailabilitySlot[];
  onToggleSlot: (day: DayOfWeek, time: string) => void;
  onResetGrid?: () => void;
  onLoadDemoData?: () => void;
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  slots,
  onToggleSlot,
  onResetGrid,
  onLoadDemoData,
}) => {
  // Metric calculations
  const classCount = slots.filter((s) => s.type === 'Class').length;
  const busyCount = slots.filter((s) => s.type === 'Busy').length;
  const freeCount = slots.filter((s) => s.type === 'Free').length;

  const getSlot = (day: DayOfWeek, time: string): AvailabilitySlot | undefined => {
    return slots.find((s) => s.day === day && s.time === time);
  };

  return (
    <div className="space-y-4 text-left">
      {/* Grid Summary Header */}
      <div className="card-enterprise p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Weekly Availability Matrix</span>
          </h2>
          <p className="text-xs text-slate-500">
            Click on any free slot to toggle manual busy overrides. Class slots are parsed from IRAS and locked.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{freeCount} Free Slots</span>
          </div>

          <div className="px-3 py-1.5 rounded-md bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-rose-600" />
            <span>{classCount} Class Slots</span>
          </div>

          <div className="px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{busyCount} Manual Overrides</span>
          </div>

          {onLoadDemoData && (
            <Button variant="secondary" onClick={onLoadDemoData} className="!py-1 !px-2 text-xs">
              <span>Demo Schedule</span>
            </Button>
          )}

          {onResetGrid && (
            <Button variant="outline" onClick={onResetGrid} className="!py-1 !px-2 text-xs gap-1">
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </Button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-1 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-white inline-block shadow-2xs" />
          <span>Available (Free)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-rose-300 bg-rose-100 inline-block" />
          <span>IRAS Class (Locked)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-amber-300 bg-amber-100 inline-block" />
          <span>Manual Override (Busy)</span>
        </div>
      </div>

      {/* Responsive Timetable Grid Table */}
      <div className="card-enterprise overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
              <th className="p-3 border-r border-slate-200 w-24 text-center">Time Slot</th>
              {DAYS.map((day) => (
                <th key={day} className="p-3 border-r border-slate-200 last:border-r-0 text-center font-bold">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className="border-b border-slate-200 last:border-b-0">
                <td className="p-2.5 bg-slate-50 border-r border-slate-200 font-mono text-[11px] font-semibold text-slate-600 text-center">
                  {hour}
                </td>
                {DAYS.map((day) => {
                  const slot = getSlot(day, hour);
                  const isClass = slot?.type === 'Class';
                  const isBusy = slot?.type === 'Busy';

                  return (
                    <td
                      key={`${day}-${hour}`}
                      onClick={() => !isClass && onToggleSlot(day, hour)}
                      className={`p-2 border-r border-slate-200 last:border-r-0 text-center transition-colors duration-150 select-none ${
                        isClass
                          ? 'bg-rose-50 border-rose-200 text-rose-800 cursor-not-allowed'
                          : isBusy
                          ? 'bg-amber-50 border-amber-200 text-amber-900 cursor-pointer hover:bg-amber-100'
                          : 'bg-white hover:bg-slate-100 cursor-pointer text-slate-400'
                      }`}
                    >
                      {isClass ? (
                        <div className="font-bold text-[11px] flex flex-col items-center justify-center">
                          <span>{slot?.courseCode || 'CLASS'}</span>
                          <span className="text-[9px] font-medium text-rose-600">Locked</span>
                        </div>
                      ) : isBusy ? (
                        <div className="font-semibold text-[11px] text-amber-800 flex flex-col items-center">
                          <span>BUSY</span>
                          <span className="text-[9px] text-amber-600 font-normal">User Override</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-normal">Available</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
