import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, X } from 'lucide-react';

const STORAGE_KEY = 'devgraveyard_cookie_consent';

export const CookieNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'acknowledged');
    } catch {
      // ignore storage errors
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Privacy and cookies notice"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-2xl text-xs space-y-3 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-zinc-300 font-mono font-medium">
          <Shield className="w-4 h-4 text-[#c53030] shrink-0" />
          <span>Sanctuary Privacy & Storage</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-zinc-400 font-sans leading-relaxed">
        DevGraveyard only utilizes essential local storage and session tokens to preserve your crypt preferences, authenticated session, and tombstone tributes. We never sell your data or access private code.
      </p>

      <div className="flex items-center justify-between pt-1">
        <Link
          to="/privacy"
          className="text-[#c53030] hover:text-[#ef4444] underline font-mono text-[11px] transition-colors"
        >
          Read Privacy Policy
        </Link>
        <button
          onClick={handleDismiss}
          className="px-3.5 py-1.5 rounded-lg bg-[#c53030] hover:bg-[#b02727] text-white font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-md"
        >
          Accept & Enter
        </button>
      </div>
    </aside>
  );
};
