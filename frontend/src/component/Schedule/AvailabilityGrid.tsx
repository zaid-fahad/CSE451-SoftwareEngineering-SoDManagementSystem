import React, { useState } from 'react';
import { DayOfWeek, AvailabilitySlot } from '../../model/schedule';
import { DAYS, HOURS } from '../../services/useSchedule';
import { Clock, Download, Lock, Calendar } from 'lucide-react';
import { Button } from '../UI/Button';

interface AvailabilityGridProps {
  slots: AvailabilitySlot[];
  onToggleSlot: (day: DayOfWeek, time: string) => void;
  onResetGrid?: () => void;
  onLoadDemoData?: () => void;
  onExportPNG?: () => void;
  isLocked?: boolean;
  lockMessage?: string;
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  slots,
  onToggleSlot,
  onExportPNG,
  isLocked = false,
  lockMessage,
}) => {
  const [mobileSelectedDay, setMobileSelectedDay] = useState<DayOfWeek | 'ALL'>('ALL');

  // Metric calculations
  const classCount = slots.filter((s) => s.type === 'Class').length;
  const busyCount = slots.filter((s) => s.type === 'Busy').length;
  const freeCount = slots.filter((s) => s.type === 'Free').length;

  const getSlot = (day: DayOfWeek, time: string): AvailabilitySlot | undefined => {
    return slots.find((s) => s.day === day && s.time === time);
  };

  return (
    <div id="availability-grid-container" className="space-y-4 text-left p-1 bg-white rounded-xl">
      {/* Semester Locked Banner */}
      {isLocked && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900 text-xs shadow-xs">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Semester Schedule Locked: </span>
            {lockMessage ||
              'Semester onboarding is currently closed. You cannot modify your availability. Please contact a Lab or Department Manager to request an override.'}
          </div>
        </div>
      )}

      {/* Grid Summary Header */}
      <div className="card-enterprise p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Weekly Availability</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
              {freeCount} Free
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
              {classCount} Class
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
              {busyCount} Busy
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onExportPNG && (
            <Button variant="primary" onClick={onExportPNG} className="!py-1 !px-3 text-xs gap-1.5 shadow-2xs">
              <Download className="w-3.5 h-3.5" />
              <span>Export Schedule</span>
            </Button>
          )}
        </div>
      </div>

      {/* Legend & Mobile Day Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-slate-300 bg-white inline-block" />
            <span>Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-rose-300 bg-rose-100 inline-block" />
            <span>Class (IRAS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-amber-300 bg-amber-100 inline-block" />
            <span>Busy Override</span>
          </div>
        </div>

        {/* Mobile-Friendly Day Pills Switcher */}
        <div className="flex sm:hidden overflow-x-auto gap-1 pb-1 w-full pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setMobileSelectedDay('ALL')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold shrink-0 transition-colors ${
              mobileSelectedDay === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Days Table
          </button>
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setMobileSelectedDay(d)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold shrink-0 transition-colors ${
                mobileSelectedDay === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE-ONLY SINGLE DAY LIST VIEW (When a day tab is selected on mobile) */}
      {mobileSelectedDay !== 'ALL' && (
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-800">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{mobileSelectedDay} Timetable</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">Tap slot to toggle</span>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            {HOURS.map((hour) => {
              const slot = getSlot(mobileSelectedDay, hour);
              const isClass = slot?.type === 'Class';
              const isBusy = slot?.type === 'Busy';
              const isDuty = slot?.type === 'Duty';

              return (
                <div
                  key={`${mobileSelectedDay}-${hour}`}
                  onClick={() => !isLocked && !isClass && !isDuty && onToggleSlot(mobileSelectedDay, hour)}
                  className={`p-3 flex items-center justify-between transition-colors select-none ${
                    isDuty
                      ? 'bg-blue-50/70 text-blue-900 cursor-default'
                      : isClass
                      ? 'bg-rose-50/60 text-rose-900 cursor-not-allowed'
                      : isLocked
                      ? isBusy
                        ? 'bg-amber-50/60 text-amber-900 cursor-not-allowed'
                        : 'bg-white text-slate-500 cursor-not-allowed'
                      : isBusy
                      ? 'bg-amber-50/80 text-amber-900 cursor-pointer hover:bg-amber-100'
                      : 'bg-white text-slate-600 cursor-pointer hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-700 w-16">
                      {hour}
                    </span>
                    <div>
                      {isDuty ? (
                        <span className="text-xs font-bold text-blue-700">
                          {slot?.dutyTitle || 'Assigned Lab Duty'}
                        </span>
                      ) : isClass ? (
                        <span className="text-xs font-bold text-rose-700">
                          {slot?.courseCode || 'Class Lecture'} (IRAS Locked)
                        </span>
                      ) : isBusy ? (
                        <span className="text-xs font-semibold text-amber-800">
                          Manual Busy Override
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Available for Duty
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {isDuty ? (
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                        DUTY
                      </span>
                    ) : isClass ? (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                        CLASS
                      </span>
                    ) : isBusy ? (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200">
                        BUSY
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        FREE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL TIMETABLE GRID TABLE (Desktop always, Mobile when 'ALL' is active) */}
      <div className={`card-enterprise overflow-x-auto ${mobileSelectedDay !== 'ALL' ? 'hidden sm:block' : 'block'}`}>
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
                  const isDuty = slot?.type === 'Duty';

                  return (
                    <td
                      key={`${day}-${hour}`}
                      onClick={() => !isLocked && !isClass && !isDuty && onToggleSlot(day, hour)}
                      className={`p-2 border-r border-slate-200 last:border-r-0 text-center transition-colors duration-150 select-none ${
                        isDuty
                          ? 'bg-blue-600 border-blue-700 text-white cursor-default shadow-xs'
                          : isClass
                          ? 'bg-rose-50 border-rose-200 text-rose-800 cursor-not-allowed'
                          : isLocked
                          ? isBusy
                            ? 'bg-amber-50 border-amber-200 text-amber-900 cursor-not-allowed opacity-90'
                            : 'bg-white text-slate-400 cursor-not-allowed'
                          : isBusy
                          ? 'bg-amber-50 border-amber-200 text-amber-900 cursor-pointer hover:bg-amber-100'
                          : 'bg-white hover:bg-slate-100 cursor-pointer text-slate-400'
                      }`}
                    >
                      {isDuty ? (
                        <div className="font-bold text-[11px] flex flex-col items-center justify-center">
                          <span>DUTY ASSIGNED</span>
                          <span className="text-[9px] font-medium text-blue-100">{slot?.dutyTitle || 'Lab Duty'}</span>
                        </div>
                      ) : isClass ? (
                        <div className="font-bold text-[11px] flex flex-col items-center justify-center">
                          <span>{slot?.courseCode || 'CLASS'}</span>
                          <span className="text-[9px] font-medium text-rose-600">Locked</span>
                        </div>
                      ) : isBusy ? (
                        <div className="font-semibold text-[11px] text-amber-800">Busy</div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-medium">Free</span>
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
