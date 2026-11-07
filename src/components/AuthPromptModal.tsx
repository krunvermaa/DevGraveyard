import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, X, Flame } from 'lucide-react';
import { Button } from './ui/Button';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionText?: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  actionText = 'pay respects'
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined' || !document.body) return null;

  const handleEnterGraveyard = () => {
    onClose();
    navigate('/login');
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-zinc-950 border border-[#c53030]/40 rounded-2xl shadow-[0_0_50px_rgba(197,48,48,0.25)] p-6 sm:p-7 flex flex-col items-center text-center gap-4 overflow-hidden selection:bg-[#c53030]/20 selection:text-[#c53030] ring-1 ring-white/5 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded-full transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c53030] to-transparent opacity-70" />

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#c53030]/10 border border-[#c53030]/30 flex items-center justify-center text-[#c53030] shadow-[0_0_20px_rgba(197,48,48,0.2)]">
          <KeyRound className="w-6 h-6 animate-pulse" />
        </div>

        {/* Headings */}
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c53030] block">
            Sanctuary Gateway
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 tracking-tight">
            Enter the Sanctuary
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed pt-1">
            To <span className="text-white font-medium">{actionText}</span> and inscribe your mark in stone, you must identify yourself at the gates.
          </p>
        </div>

        {/* Feature badge */}
        <div className="w-full py-2.5 px-3 bg-zinc-900/80 border border-zinc-800 rounded-lg text-left flex items-center gap-2.5">
          <Flame className="w-4 h-4 text-[#c53030] shrink-0" />
          <span className="text-[11px] font-mono text-zinc-300 leading-tight">
            Fast sign-in with GitHub or Google. No spam. No private code access.
          </span>
        </div>

        {/* Actions */}
        <div className="w-full space-y-2 pt-2">
          <Button
            onClick={handleEnterGraveyard}
            className="w-full h-11 text-xs font-mono uppercase tracking-widest bg-[#c53030] hover:bg-[#b02727] text-white border border-red-500/40 shadow-[0_0_20px_rgba(197,48,48,0.4)] cursor-pointer rounded-lg"
          >
            Enter Graveyard & Sign In
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors cursor-pointer"
          >
            Lurk as Ghost
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
