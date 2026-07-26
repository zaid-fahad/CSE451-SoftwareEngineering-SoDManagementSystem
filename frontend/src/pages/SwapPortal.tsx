import React, { useState } from 'react';
import { useAuth } from '../services/useAuth';
import { useSwaps } from '../services/useSwaps';
import { SwapCard } from '../component/Swap/SwapCard';
import { RequestSwapModal } from '../component/Swap/RequestSwapModal';
import { Button } from '../component/UI/Button';
import { ArrowRightLeft, Plus, CheckCircle2 } from 'lucide-react';
import { SwapCreatePayload } from '../model/swap';

export const SwapPortal: React.FC = () => {
  const { user } = useAuth();
  const { swaps, requestSwap, acceptSwap, cancelSwap } = useSwaps();

  const [activeTab, setActiveTab] = useState<'feed' | 'my-requests'>('feed');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const peerSwaps = swaps.filter((s) => s.requestingStudent.email !== user?.email);
  const mySwaps = swaps.filter((s) => s.requestingStudent.email === user?.email);

  const handleAccept = async (swapId: string) => {
    if (!user) return;
    const success = await acceptSwap(swapId, user);
    if (success) {
      setSuccessToast('Shift swap accepted successfully! Duty ownership has been transferred.');
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleCreateRequest = async (payload: SwapCreatePayload) => {
    if (!user) return;
    await requestSwap(payload, user);
    setSuccessToast('Your shift swap request has been broadcasted to all eligible peers.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Success Toast Banner */}
      {successToast && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn text-left">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Toolbar Header */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <span>Shift Trade & Swap Backlog</span>
          </h1>
          <p className="text-xs text-slate-500">
            Broadcast shift swap requests to eligible peers or accept trades offered by fellow students.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsRequestModalOpen(true)}
          className="!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Shift Swap</span>
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-3 px-4 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'feed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Peer Trade Feed ({peerSwaps.length})
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`pb-3 px-4 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'my-requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Swap Requests ({mySwaps.length})
        </button>
      </div>

      {/* Swap Request Cards List */}
      {activeTab === 'feed' ? (
        peerSwaps.length === 0 ? (
          <div className="card-enterprise p-8 text-center text-slate-500 space-y-1">
            <p className="text-sm font-medium">No active peer swap requests right now.</p>
            <p className="text-xs">Broadcasted trade requests from eligible peers will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {peerSwaps.map((swap) => (
              <SwapCard
                key={swap.id}
                swap={swap}
                currentUser={user}
                onAccept={handleAccept}
              />
            ))}
          </div>
        )
      ) : mySwaps.length === 0 ? (
        <div className="card-enterprise p-8 text-center text-slate-500 space-y-1">
          <p className="text-sm font-medium">You haven't requested any shift swaps yet.</p>
          <p className="text-xs">Click "Request Shift Swap" to broadcast a trade offer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mySwaps.map((swap) => (
            <SwapCard
              key={swap.id}
              swap={swap}
              currentUser={user}
              onAccept={handleAccept}
              onCancel={cancelSwap}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <RequestSwapModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onRequestSwap={handleCreateRequest}
      />
    </div>
  );
};
