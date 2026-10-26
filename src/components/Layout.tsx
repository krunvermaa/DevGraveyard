import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Atmosphere } from './Atmosphere';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, userProfile } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-text selection:bg-[#c53030]/20 selection:text-[#c53030] overflow-x-hidden">
      {/* Atmosphere Layers */}
      <div className="bg-noise" />
      <Atmosphere />
      <div className="fixed inset-0 bg-gradient-radial from-transparent to-background/90 pointer-events-none z-0" />
      
      <header className="sticky top-0 inset-x-0 z-[90] border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to={user ? "/home" : "/"} className="flex items-center gap-2 md:gap-3 text-zinc-200 hover:text-white transition-colors group">
            <div className="p-1.5 md:p-2 rounded-md bg-surface border border-border group-hover:border-[#c53030]/50 transition-colors duration-500">
              <span className="text-lg md:text-xl leading-none opacity-80 group-hover:opacity-100" role="img" aria-label="grave">🪦</span>
            </div>
            <div className="flex flex-col text-center md:text-left">
              <span className="font-bold tracking-tight text-lg sm:text-xl md:text-2xl lg:text-3xl uppercase font-mono group-hover:text-[#b91c1c] transition-colors duration-500 text-[#b91c1c]">Dev Graveyard</span>
              <span className="text-[9px] md:text-[10px] text-[#ebebeb] font-mono tracking-widest uppercase">Est. 2024</span>
            </div>
          </Link>
          
          <nav className="flex flex-wrap justify-center gap-4 items-center">
            {user && (
              <>
                {location.pathname !== '/submit' && (
                  <Link to="/submit">
                    <button className="text-xs font-mono tracking-wide text-zinc-100 hover:text-[#c53030] transition-colors border-b border-transparent hover:border-[#c53030]/30 pb-0.5">
                      [ BURY A PROJECT ]
                    </button>
                  </Link>
                )}
                {location.pathname === '/submit' && (
                  <Link to="/home">
                    <button className="text-xs font-mono tracking-wide text-zinc-100 hover:text-[#c53030] transition-colors border-b border-transparent hover:border-[#c53030]/30 pb-0.5">
                      [ RETURN TO CEMETERY ]
                    </button>
                  </Link>
                )}
                <Link to="/confessions">
                  <button className="text-xs font-mono tracking-wide text-zinc-100 hover:text-[#c53030] transition-colors border-b border-transparent hover:border-[#c53030]/30 pb-0.5">
                    [ CONFESSIONS ]
                  </button>
                </Link>
                <Link to="/chats">
                  <button className="text-xs font-mono tracking-wide text-zinc-100 hover:text-[#c53030] transition-colors border-b border-transparent hover:border-[#c53030]/30 pb-0.5">
                    [ CHATS ]
                  </button>
                </Link>
                <Link to="/leaderboard">
                  <button className="text-xs font-mono tracking-wide text-zinc-100 hover:text-[#c53030] transition-colors border-b border-transparent hover:border-[#c53030]/30 pb-0.5">
                    [ LEADERBOARD ]
                  </button>
                </Link>
                <Link to="/upcoming">
                  <button className="text-xs font-mono tracking-wide text-zinc-100 hover:text-[#c53030] transition-colors border-b border-transparent hover:border-[#c53030]/30 pb-0.5">
                    [ UPCOMING ]
                  </button>
                </Link>
                <Link to="/profile">
                  <button className="text-xs font-mono tracking-wide text-zinc-100 hover:text-[#c53030] transition-colors border-b border-transparent hover:border-[#c53030]/30 pb-0.5 uppercase">
                    [ {userProfile?.username || 'PROFILE'} ]
                  </button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="relative flex-grow container mx-auto px-4 sm:px-6 pb-12 pt-8 md:pt-12">
        {children}
      </main>

      <footer className="relative border-t border-border/40 bg-background py-12 mt-auto">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-px bg-zinc-800" />
          <p className="text-zinc-300 text-sm font-serif italic text-center">
            "Not every project survives.<br/>Some still teach."
          </p>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest pt-4">
            Requiescat in Pace
          </p>
        </div>
      </footer>
    </div>
  );
};