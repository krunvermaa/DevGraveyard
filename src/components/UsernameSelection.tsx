import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkUsernameAvailability, createUserProfile } from '../services/userService';
import { Button } from './ui/Button';
import { Loader2 } from 'lucide-react';
import { AVATARS } from '../pixelAvatars';
import { updateProfile } from 'firebase/auth';

export const UsernameSelection: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [username, setUsername] = useState(() => {
    if (user?.displayName) {
      const sanitized = user.displayName.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);
      if (sanitized.length >= 3) return sanitized;
    }
    if (user?.email) {
      const sanitized = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);
      if (sanitized.length >= 3) return sanitized;
    }
    return '';
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // validate username format
    const validFormat = /^[a-zA-Z0-9_]{3,30}$/;
    if (!validFormat.test(username)) {
      setError('Username must be 3-30 characters, alphanumeric or underscores.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setError('Username is already taken.');
        setLoading(false);
        return;
      }
      
      await createUserProfile(user.uid, user.email || '', username, selectedAvatar);
      
      try {
        await updateProfile(user, { photoURL: selectedAvatar });
      } catch (err) {
        console.error("Failed to update Firebase Auth profile:", err);
      }
      
      await refreshProfile();
    } catch (err) {
      console.error(err);
      setError('Failed to set username. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center relative z-10 px-4 py-12">
      <div className="max-w-2xl w-full space-y-6 p-8 border border-[#c53030]/30 bg-surface/50 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(223,54,54,0.1)] text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c53030] to-transparent opacity-50" />
        
        <h2 className="text-2xl font-bold font-sans text-white">Claim Your Alias</h2>
        <p className="text-sm text-zinc-400 font-mono">
          Every gravedigger needs a name and a face. Choose yours.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4 text-left">
          <div className="space-y-4">
            <label className="text-xs font-mono uppercase tracking-widest text-[#c53030]/80 text-center block w-full">Select Avatar</label>
            <div className="grid grid-cols-5 gap-4">
              {AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedAvatar === avatar 
                      ? 'border-[#c53030] scale-105 shadow-[0_0_20px_rgba(223,54,54,0.4)]' 
                      : 'border-zinc-800 hover:border-[#c53030]/50 hover:scale-105'
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover bg-zinc-950 p-1" />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-[#c53030]/10" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-[#c53030]/80">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. shadow_coder"
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/50 transition-colors"
              disabled={loading}
              maxLength={30}
            />
          </div>
          
          {error && <p className="text-xs text-code-red font-mono">{error}</p>}
          
          <Button 
            type="submit" 
            variant="secondary"
            disabled={!username || loading}
            className="w-full h-12 bg-zinc-900 border border-zinc-700 hover:border-[#c53030]/60 text-zinc-100 hover:text-white hover:bg-[#c53030] transition-all font-mono uppercase tracking-widest text-xs font-semibold mt-4 shadow-md cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Claim Alias'}
          </Button>
        </form>
      </div>
    </div>
  );
};
