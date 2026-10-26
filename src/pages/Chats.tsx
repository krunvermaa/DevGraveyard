import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SharedGravesViewer } from '../components/SharedGravesViewer';
import { GraveModal } from '../components/GraveModal';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Grave } from '../types';

export const Chats: React.FC = () => {
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const navigate = useNavigate();

  const handleSelectSharedGrave = async (graveId: string) => {
    try {
      const docRef = doc(db, 'graves', graveId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelectedGrave({ id: docSnap.id, ...docSnap.data() } as Grave);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold font-sans text-white text-center sm:text-left drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Chats & Shared Graves</h1>
      
      <SharedGravesViewer onSelectGrave={handleSelectSharedGrave} />

      {selectedGrave && (
        <div className="fixed inset-0 z-50">
          <GraveModal grave={selectedGrave} onClose={() => setSelectedGrave(null)} />
        </div>
      )}
    </div>
  );
};
