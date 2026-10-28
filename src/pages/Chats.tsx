import React, { useState } from 'react';
import { SharedGravesViewer } from '../components/SharedGravesViewer';
import { GraveModal } from '../components/GraveModal';
import { DispatchGraveModal } from '../components/DispatchGraveModal';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Grave } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

export const Chats: React.FC = () => {
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [loadingGraveId, setLoadingGraveId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [dispatchSuccessNotice, setDispatchSuccessNotice] = useState<string | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  const handleSelectSharedGrave = async (graveId: string) => {
    setLoadingGraveId(graveId);
    setErrorNotice(null);
    try {
      const docRef = doc(db, 'graves', graveId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelectedGrave({ id: docSnap.id, ...docSnap.data() } as Grave);
      } else {
        setErrorNotice("This grave has dissolved into dust (it may have been deleted by its owner).");
        setTimeout(() => setErrorNotice(null), 5000);
      }
    } catch (err) {
      console.error("Error opening shared grave:", err);
      setErrorNotice("Failed to summon grave details from the catacombs.");
      setTimeout(() => setErrorNotice(null), 5000);
    } finally {
      setLoadingGraveId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in pb-24">
      {/* Mobile Quick Action Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-zinc-800/60 sm:hidden">
        <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider">Crypt Dispatches</span>
        <button
          type="button"
          onClick={() => setIsDispatchModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-[#c53030]/20 hover:bg-[#c53030]/30 border border-[#c53030]/50 hover:border-[#c53030] text-red-300 hover:text-white text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(197,48,48,0.2)] cursor-pointer active:scale-95"
        >
          <Send className="w-3.5 h-3.5 text-red-400" />
          <span>[ + Dispatch Grave ]</span>
        </button>
      </div>

      {/* Success notification banner */}
      <AnimatePresence>
        {dispatchSuccessNotice && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dispatchSuccessNotice}</span>
            </div>
            <button 
              type="button"
              onClick={() => setDispatchSuccessNotice(null)} 
              className="text-zinc-500 hover:text-white cursor-pointer ml-3"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error notification banner */}
      <AnimatePresence>
        {errorNotice && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs font-mono flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button 
              type="button"
              onClick={() => setErrorNotice(null)} 
              className="text-zinc-500 hover:text-white cursor-pointer ml-3"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Crypt Dispatches Viewer */}
      <SharedGravesViewer 
        onSelectGrave={handleSelectSharedGrave} 
        loadingGraveId={loadingGraveId}
        onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
      />

      {/* Grave Detail Modal */}
      <AnimatePresence>
        {selectedGrave && (
          <GraveModal 
            grave={selectedGrave} 
            onClose={() => setSelectedGrave(null)} 
          />
        )}
      </AnimatePresence>

      {/* Dispatch a Grave Modal */}
      <DispatchGraveModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onSuccess={(dispatch) => {
          setDispatchSuccessNotice(`Tombstone "${dispatch.graveName}" was dispatched across the veil to @${dispatch.toUsername}!`);
          setTimeout(() => setDispatchSuccessNotice(null), 6000);
        }}
      />
    </div>
  );
};
