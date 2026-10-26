import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Atmosphere } from './Atmosphere';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, PlusCircle, MessageSquare, Trophy, Clock, User, Ghost, Home as HomeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-text selection:bg-[#c53030]/20 selection:text-[#c53030] overflow-x-hidden">
      {/* Atmosphere Layers */}
      <div className="bg-noise" />
      <Atmosphere />
      <div className="fixed inset-0 bg-gradient-radial from-transparent to-background/90 pointer-events-none z-0" />
      
      <header className="sticky top-0 inset-x-0 z-[90] border-b border-border/40 bg-background/85 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <Link to={user ? "/home" : "/"} className="flex items-center gap-2.5 sm:gap-3 text-zinc-200 hover:text-white transition-colors group shrink-0">
            <div className="p-1.5 sm:p-2 rounded-md bg-surface border border-border group-hover:border-[#c53030]/60 transition-colors duration-300">
              <span className="text-xl sm:text-2xl leading-none opacity-90 group-hover:opacity-100" role="img" aria-label="grave">🪦</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg sm:text-xl md:text-2xl uppercase font-mono group-hover:text-[#ef4444] transition-colors duration-300 text-[#c53030]">Dev Graveyard</span>
              <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono tracking-widest uppercase">Est. 2024</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden lg:flex items-center gap-5">
              {location.pathname !== '/submit' ? (
                <Link to="/submit">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono tracking-wide text-red-200 bg-[#c53030]/20 border border-[#c53030]/50 hover:bg-[#c53030] hover:text-white hover:border-red-500 transition-all font-semibold shadow-sm cursor-pointer active:scale-95">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>BURY A PROJECT</span>
                  </button>
                </Link>
              ) : (
                <Link to="/home">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono tracking-wide text-zinc-200 bg-zinc-900 border border-zinc-750 hover:border-[#c53030]/60 hover:text-white transition-all font-semibold shadow-sm cursor-pointer">
                    <span>RETURN TO CEMETERY</span>
                  </button>
                </Link>
              )}

              <Link to="/confessions">
                <button className={`text-xs font-mono tracking-wide transition-colors border-b-2 pb-0.5 cursor-pointer ${location.pathname === '/confessions' ? 'text-white border-[#c53030] font-bold' : 'text-zinc-300 hover:text-white border-transparent hover:border-[#c53030]/60'}`}>
                  CONFESSIONS
                </button>
              </Link>
              <Link to="/chats">
                <button className={`text-xs font-mono tracking-wide transition-colors border-b-2 pb-0.5 cursor-pointer ${location.pathname === '/chats' ? 'text-white border-[#c53030] font-bold' : 'text-zinc-300 hover:text-white border-transparent hover:border-[#c53030]/60'}`}>
                  CHATS
                </button>
              </Link>
              <Link to="/leaderboard">
                <button className={`text-xs font-mono tracking-wide transition-colors border-b-2 pb-0.5 cursor-pointer ${location.pathname === '/leaderboard' ? 'text-white border-[#c53030] font-bold' : 'text-zinc-300 hover:text-white border-transparent hover:border-[#c53030]/60'}`}>
                  LEADERBOARD
                </button>
              </Link>
              <Link to="/upcoming">
                <button className={`text-xs font-mono tracking-wide transition-colors border-b-2 pb-0.5 cursor-pointer ${location.pathname === '/upcoming' ? 'text-white border-[#c53030] font-bold' : 'text-zinc-300 hover:text-white border-transparent hover:border-[#c53030]/60'}`}>
                  UPCOMING
                </button>
              </Link>
              <Link to="/profile">
                <button className={`flex items-center gap-1.5 text-xs font-mono tracking-wide transition-colors border-b-2 pb-0.5 cursor-pointer uppercase ${location.pathname === '/profile' ? 'text-white border-[#c53030] font-bold' : 'text-zinc-300 hover:text-white border-transparent hover:border-[#c53030]/60'}`}>
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{userProfile?.username || 'PROFILE'}</span>
                </button>
              </Link>
            </nav>
          )}

          {/* Medium Screen Navigation (Tablets / Small Laptops) */}
          {user && (
            <div className="hidden md:flex lg:hidden items-center gap-3">
              <Link to={location.pathname === '/submit' ? '/home' : '/submit'}>
                <button className="px-2.5 py-1 rounded text-xs font-mono text-red-200 bg-[#c53030]/20 border border-[#c53030]/50 hover:bg-[#c53030] hover:text-white transition-all font-semibold">
                  {location.pathname === '/submit' ? 'CEMETERY' : 'BURY'}
                </button>
              </Link>
              <Link to="/confessions" className={`text-xs font-mono ${location.pathname === '/confessions' ? 'text-white font-bold' : 'text-zinc-300 hover:text-white'}`}>CONFESS</Link>
              <Link to="/chats" className={`text-xs font-mono ${location.pathname === '/chats' ? 'text-white font-bold' : 'text-zinc-300 hover:text-white'}`}>CHATS</Link>
              <Link to="/leaderboard" className={`text-xs font-mono ${location.pathname === '/leaderboard' ? 'text-white font-bold' : 'text-zinc-300 hover:text-white'}`}>RANKS</Link>
              <Link to="/profile" className={`text-xs font-mono uppercase ${location.pathname === '/profile' ? 'text-white font-bold' : 'text-zinc-300 hover:text-white'}`}>@{userProfile?.username || 'YOU'}</Link>
            </div>
          )}

          {/* Mobile Right Controls */}
          {user && (
            <div className="flex md:hidden items-center gap-2">
              <Link to="/submit">
                <button 
                  className="px-2.5 py-1 text-xs font-mono font-bold text-white bg-[#c53030] rounded border border-red-500 hover:bg-red-700 transition-colors shadow-sm active:scale-95"
                  aria-label="Bury a project"
                >
                  + BURY
                </button>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="p-2 text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-700 hover:border-[#c53030]/60 rounded-md transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && user && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl overflow-hidden px-4 py-4 space-y-2 shadow-2xl"
            >
              <div className="grid grid-cols-2 gap-2 pb-2">
                <Link
                  to="/home"
                  className={`flex items-center gap-2 p-2.5 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/home'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                  }`}
                >
                  <HomeIcon className="w-4 h-4 text-[#c53030]" />
                  <span>Cemetery</span>
                </Link>

                <Link
                  to="/submit"
                  className={`flex items-center gap-2 p-2.5 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/submit'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-[#c53030]" />
                  <span>Bury Project</span>
                </Link>

                <Link
                  to="/confessions"
                  className={`flex items-center gap-2 p-2.5 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/confessions'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                  }`}
                >
                  <Ghost className="w-4 h-4 text-[#c53030]" />
                  <span>Confessions</span>
                </Link>

                <Link
                  to="/chats"
                  className={`flex items-center gap-2 p-2.5 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/chats'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#c53030]" />
                  <span>Chats</span>
                </Link>

                <Link
                  to="/leaderboard"
                  className={`flex items-center gap-2 p-2.5 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/leaderboard'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-[#c53030]" />
                  <span>Pantheon</span>
                </Link>

                <Link
                  to="/upcoming"
                  className={`flex items-center gap-2 p-2.5 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/upcoming'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                  }`}
                >
                  <Clock className="w-4 h-4 text-[#c53030]" />
                  <span>Upcoming</span>
                </Link>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <Link
                  to="/profile"
                  className={`flex items-center justify-between p-3 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/profile'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900 border-zinc-700/80 text-zinc-200 hover:text-white hover:border-[#c53030]/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#c53030]" />
                    <span className="uppercase font-semibold">@{userProfile?.username || 'PROFILE'}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">View Crypt &rarr;</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative flex-grow container mx-auto px-4 sm:px-6 pb-12 pt-6 md:pt-10">
        {children}
      </main>

      <footer className="relative border-t border-border/40 bg-background py-10 sm:py-12 mt-auto">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-px bg-zinc-800" />
          <p className="text-zinc-300 text-sm font-serif italic text-center">
            "Not every project survives.<br/>Some still teach."
          </p>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest pt-2 sm:pt-4">
            Requiescat in Pace
          </p>
        </div>
      </footer>
    </div>
  );
};
