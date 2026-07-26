import React, { useState } from 'react';
import { useAuth } from '../services/useAuth';
import { useSwaps } from '../services/useSwaps';
import { SwapCard } from '../component/Swap/SwapCard';
import { RequestSwapModal } from '../component/Swap/RequestSwapModal';
import { Button } from '../component/UI/Button';
import { ArrowRightLeft, Plus, CheckCircle2, Search } from 'lucide-react';
import { SwapCreatePayload } from '../model/swap';

export const SwapPortal: React.FC = () => {
  const { user } = useAuth();
  const { swaps, requestSwap, acceptSwap, cancelSwap } = useSwaps();

  const [activeTab, setActiveTab] = useState<'feed' | 'my-requests'>('feed');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const peerSwaps = swaps.filter((s) => s.requestingStudent.email !== user?.email);
  const mySwaps = swaps.filter((s) => s.requestingStudent.email === user?.email);

  const filterList = (list: typeof swaps) => {
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.requestingStudent.name.toLowerCase().includes(q) ||
        s.dutyTitle.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.day.toLowerCase().includes(q)
    );
  };

  const filteredPeerSwaps = filterList(peerSwaps);
  const filteredMySwaps = filterList(mySwaps);

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
    <div className="space-y-6 text-left">
      {/* Success Toast Banner */}
      {successToast && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Toolbar Header */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      {/* Navigation Tabs & Search Toolbar */}
      <div className="card-enterprise p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-xs border-b sm:border-b-0 border-slate-200">
          <button
            onClick={() => setActiveTab('feed')}
            className={`pb-2 sm:pb-0 px-3 transition-colors cursor-pointer border-b-2 sm:border-b-0 ${
              activeTab === 'feed'
                ? 'border-blue-600 sm:bg-blue-600 text-blue-600 sm:text-white rounded-md sm:py-1.5'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Peer Trade Feed ({filteredPeerSwaps.length})
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`pb-2 sm:pb-0 px-3 transition-colors cursor-pointer border-b-2 sm:border-b-0 ${
              activeTab === 'my-requests'
                ? 'border-blue-600 sm:bg-blue-600 text-blue-600 sm:text-white rounded-md sm:py-1.5'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Swap Requests ({filteredMySwaps.length})
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student, duty, room or day..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-900 text-xs rounded-md py-2 pl-9 pr-3 border border-slate-300 focus:border-blue-600 outline-none"
          />
        </div>
      </div>

      {/* Swap Request Cards List */}
      {activeTab === 'feed' ? (
        filteredPeerSwaps.length === 0 ? (
          <div className="card-enterprise p-8 text-center text-slate-500 space-y-1">
            <p className="text-sm font-medium">No active peer swap requests match your search.</p>
            <p className="text-xs">Broadcasted trade requests from eligible peers will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeerSwaps.map((swap) => (
              <SwapCard
                key={swap.id}
                swap={swap}
                currentUser={user}
                onAccept={handleAccept}
              />
            ))}
          </div>
        )
      ) : filteredMySwaps.length === 0 ? (
        <div className="card-enterprise p-8 text-center text-slate-500 space-y-1">
          <p className="text-sm font-medium">You haven't requested any shift swaps matching your search.</p>
          <p className="text-xs">Click "Request Shift Swap" to broadcast a trade offer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMySwaps.map((swap) => (
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
