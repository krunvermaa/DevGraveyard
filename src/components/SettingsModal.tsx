import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { checkUsernameAvailability } from '../services/userService';
import { doc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, logout } from '../firebase';
import { deleteUser } from 'firebase/auth';
import { deleteAccountCompletely, updateUsernameEverywhere } from '../services/accountService';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user, userProfile } = useAuth();
  const [newUsername, setNewUsername] = useState(userProfile?.username || '');
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');

  const [instagram, setInstagram] = useState(userProfile?.instagram || '');
  const [whatsapp, setWhatsapp] = useState(userProfile?.whatsapp || '');
  const [isUpdatingSocials, setIsUpdatingSocials] = useState(false);
  const [socialsSuccess, setSocialsSuccess] = useState('');
  const [socialsError, setSocialsError] = useState('');
  
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const creationDate = user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown';
  const loginEmail = user?.email || 'No email associated';

  const handleUpdateSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSocialsSuccess('');
    setSocialsError('');
    setIsUpdatingSocials(true);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        instagram: instagram.trim(),
        whatsapp: whatsapp.trim()
      });
      setSocialsSuccess('Social links updated successfully!');
      setTimeout(() => {
        setSocialsSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setSocialsError('Failed to update social links.');
    } finally {
      setIsUpdatingSocials(false);
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess('');
    
    const formattedUsername = newUsername.trim().toLowerCase();
    
    if (!formattedUsername) {
      setUsernameError('Username cannot be empty');
      return;
    }
    
    if (formattedUsername === userProfile?.username?.toLowerCase()) {
      setUsernameError('This is already your username');
      return;
    }
    
    if (formattedUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(formattedUsername)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsChangingUsername(true);
    try {
      const isAvailable = await checkUsernameAvailability(formattedUsername);
      if (!isAvailable) {
        setUsernameError('Username is already taken');
        setIsChangingUsername(false);
        return;
      }
      
      const batch = writeBatch(db);
      
      // Delete old username if it exists
      if (userProfile?.username) {
        const oldUsernameRef = doc(db, 'usernames', userProfile.username.toLowerCase());
        batch.delete(oldUsernameRef);
      }
      
      // Create new username
      const newUsernameRef = doc(db, 'usernames', formattedUsername);
      batch.set(newUsernameRef, { uid: user?.uid });
      
      // Update user document
      const userRef = doc(db, 'users', user!.uid);
      batch.update(userRef, { username: formattedUsername });
      
      await batch.commit();

      if (userProfile?.username && user?.uid) {
        await updateUsernameEverywhere(user.uid, userProfile.username, formattedUsername);
      }

      setUsernameSuccess('Username changed successfully!');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      setUsernameError(err.message || 'Failed to change username');
    } finally {
      setIsChangingUsername(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteAccountCompletely(user.uid, userProfile?.username);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete account. You may need to log in again to perform this action.');
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800" />
        
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-sans text-zinc-100 tracking-tight">
              Settings
            </h2>
            <button 
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 pb-4 border-b border-zinc-800/50">
              <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">Personal Details</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400 font-mono">Email / Login</span>
                <span className="text-zinc-200">{loginEmail}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400 font-mono">Current Username</span>
                <span className="text-zinc-200">@{userProfile?.username || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400 font-mono">Account Created</span>
                <span className="text-zinc-200">{creationDate}</span>
              </div>
            </div>

            <form onSubmit={handleChangeUsername} className="space-y-3 pb-4 border-b border-zinc-800/50">
              <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2">Change Username</h3>
              <div className="flex gap-2">
                <Input 
                  id="new_username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="New Username"
                  className="flex-1 bg-zinc-900 border-zinc-800 focus:border-zinc-700"
                />
                <Button 
                  type="submit"
                  disabled={isChangingUsername || newUsername === userProfile?.username}
                  className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                >
                  {isChangingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
                </Button>
              </div>
              {usernameError && <p className="text-xs text-red-400">{usernameError}</p>}
              {usernameSuccess && <p className="text-xs text-green-400">{usernameSuccess}</p>}
            </form>

            <div className="space-y-3 pt-2">
              <Button 
                onClick={handleLogout}
                variant="secondary"
                className="w-full flex justify-center items-center gap-2 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
              >
                <LogOut className="w-4 h-4" /> STEP BACK
              </Button>

              {isConfirmingDelete ? (
                <div className="space-y-2 p-3 bg-red-950/20 border border-red-900/50 rounded-xl">
                  <p className="text-xs text-red-400 font-mono text-center mb-2">This will permanently delete your account and data.</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 bg-red-900/50 hover:bg-red-800/50 text-red-200 border-red-900"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
                    </Button>
                    <Button 
                      onClick={() => setIsConfirmingDelete(false)}
                      disabled={isDeleting}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsConfirmingDelete(true)}
                  className="w-full flex justify-center items-center gap-2 border-red-900/30 bg-red-950/10 hover:bg-red-950/30 text-red-500 hover:text-red-400 hover:border-red-900/50 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> ALIVE ME
                </Button>
              )}
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
