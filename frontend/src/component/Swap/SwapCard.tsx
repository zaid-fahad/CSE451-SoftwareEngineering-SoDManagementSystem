import React from 'react';
import { SwapRequest } from '../../model/swap';
import { User } from '../../model/user';
import { Clock, MapPin, User as UserIcon, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { Button } from '../UI/Button';

interface SwapCardProps {
  swap: SwapRequest;
  currentUser: User | null;
  onAccept: (swapId: string) => void;
  onCancel?: (swapId: string) => void;
}

export const SwapCard: React.FC<SwapCardProps> = ({
  swap,
  currentUser,
  onAccept,
  onCancel,
}) => {
  const isMyRequest = currentUser?.email === swap.requestingStudent.email;
  const isAccepted = swap.status === 'Accepted';
  const isCancelled = swap.status === 'Cancelled';

  return (
    <div className="card-enterprise p-5 flex flex-col justify-between space-y-4 text-left">
      
      {/* Top Header & Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-slate-400">
            ID: {swap.id} &bull; {swap.createdAt}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isAccepted
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : isCancelled
                ? 'bg-slate-100 border border-slate-200 text-slate-500'
                : 'bg-amber-50 border border-amber-200 text-amber-800'
            }`}
          >
            {swap.status === 'Pending' ? 'Pending Trade' : swap.status}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-snug">{swap.dutyTitle}</h3>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{swap.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{swap.day} ({swap.time})</span>
          </div>
        </div>
      </div>

      {/* Requesting Student Info */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            {isMyRequest ? 'Requested By You' : 'Offered By Peer'}
          </span>
          <UserIcon className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="font-bold text-slate-900">{swap.requestingStudent.name}</div>
        <div className="text-[11px] text-slate-500">{swap.requestingStudent.email} &bull; Dept ID: {swap.requestingStudent.department_id}</div>
        {swap.reason && (
          <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200">
            "{swap.reason}"
          </p>
        )}
      </div>

      {/* Accepted Status Banner */}
      {isAccepted && swap.acceptingStudent && (
        <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Accepted by <strong>{swap.acceptingStudent.name}</strong></span>
        </div>
      )}

      {/* Footer Actions */}
      {!isAccepted && !isCancelled && (
        <div className="pt-2">
          {isMyRequest ? (
            <Button
              variant="outline"
              onClick={() => onCancel && onCancel(swap.id)}
              fullWidth
              className="!py-1.5 text-xs text-slate-600"
            >
              Cancel Request
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => onAccept(swap.id)}
              fullWidth
              className="!py-2 text-xs gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Accept Shift Trade</span>
            </Button>
          )}
        </div>
      )}

    </div>
  );
};
