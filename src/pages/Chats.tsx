import React, { useState } from 'react';
import { SharedGravesViewer } from '../components/SharedGravesViewer';
import { GraveModal } from '../components/GraveModal';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Grave } from '../types';
import { AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

export const Chats: React.FC = () => {
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [loadingGraveId, setLoadingGraveId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

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
      {/* Error notification banner */}
      <AnimatePresence>
        {errorNotice && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs font-mono flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button 
              onClick={() => setErrorNotice(null)} 
              className="text-zinc-500 hover:text-white cursor-pointer ml-3"
            >
              ✕
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Main Crypt Dispatches Viewer */}
      <SharedGravesViewer 
        onSelectGrave={handleSelectSharedGrave} 
        loadingGraveId={loadingGraveId}
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
    </div>
  );
};