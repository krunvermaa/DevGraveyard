import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';

interface AvatarSelectionModalProps {
  onClose: () => void;
}

import { AVATARS } from '../pixelAvatars';

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user?.photoURL || null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user || !selectedAvatar) return;
    setLoading(true);
    try {
      await updateProfile(user, { photoURL: selectedAvatar });
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: selectedAvatar
      });
      // Since Firebase Auth state change might not trigger immediately for profile updates,
      // we just reload the page to reflect the new avatar globally.
      window.location.reload();
    } catch (error) {
      console.error("Failed to update avatar:", error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-zinc-950 border border-[#c53030]/30 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_-10px_rgba(223,54,54,0.3)] overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10 border border-transparent hover:border-zinc-700/60"
          aria-label="Close avatar selection"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-sans text-zinc-100">Select Avatar</h2>
            <p className="text-sm font-mono text-zinc-400">Choose a new face for the graveyard.</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 py-4">
            {AVATARS.map((avatar, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAvatar(avatar)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  selectedAvatar === avatar 
                    ? 'border-[#c53030] scale-105 shadow-[0_0_20px_rgba(223,54,54,0.4)]' 
                    : 'border-zinc-800 hover:border-[#c53030]/60 hover:scale-105'
                }`}
              >
                <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover bg-zinc-950 p-1" />
                {selectedAvatar === avatar && (
                  <div className="absolute inset-0 bg-[#c53030]/15" />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#c53030]/20">
            <Button 
              variant="secondary" 
              onClick={onClose} 
              disabled={loading} 
              className="text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-500 font-mono"
            >
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={handleSave} 
              disabled={loading || !selectedAvatar || selectedAvatar === user?.photoURL} 
              className="bg-[#c53030] hover:bg-[#b02727] text-white font-mono font-semibold min-w-[120px] shadow-[0_0_15px_rgba(197,48,48,0.4)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Avatar'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
