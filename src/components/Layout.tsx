import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Atmosphere } from './Atmosphere';
import { CookieNotice } from './CookieNotice';
import { useAuth } from '../contexts/AuthContext';
import { trackPageView } from '../services/analyticsService';
import { Menu, X, PlusCircle, MessageSquare, Trophy, Clock, User, Ghost, Home as HomeIcon, Search, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change & track page view
  useEffect(() => {
    setMobileMenuOpen(false);
    trackPageView(location.pathname);
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
              <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono tracking-widest uppercase">Est. 2026</span>
            </div>
          </Link>
          
          {/* Desktop & Laptop Navigation */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2.5">
              <Link
                to="/home"
                className={`group flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/home' || location.pathname === '/'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <HomeIcon className={`w-3.5 h-3.5 text-[#c53030] shrink-0 transition-all ${location.pathname === '/home' || location.pathname === '/' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : 'opacity-90 group-hover:opacity-100'}`} />
                <span>Home</span>
              </Link>

              <Link
                to="/cemetery"
                className={`group flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/cemetery'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <Search className={`w-3.5 h-3.5 text-[#c53030] shrink-0 transition-all ${location.pathname === '/cemetery' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : 'opacity-90 group-hover:opacity-100'}`} />
                <span>Cemetery</span>
              </Link>

              <Link
                to="/submit"
                className={`group flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/submit'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <PlusCircle className={`w-3.5 h-3.5 text-[#c53030] shrink-0 transition-all ${location.pathname === '/submit' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : 'opacity-90 group-hover:opacity-100'}`} />
                <span className="hidden lg:inline">Bury a Project</span>
                <span className="lg:hidden">[+ BURY]</span>
              </Link>

              <Link
                to="/confessions"
                className={`group flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/confessions'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <Ghost className={`w-3.5 h-3.5 text-[#c53030] shrink-0 transition-all ${location.pathname === '/confessions' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : 'opacity-90 group-hover:opacity-100'}`} />
                <span>Confessions</span>
              </Link>

              <Link
                to="/chats"
                className={`group flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/chats'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <MessageSquare className={`w-3.5 h-3.5 text-[#c53030] shrink-0 transition-all ${location.pathname === '/chats' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : 'opacity-90 group-hover:opacity-100'}`} />
                <span>Chats</span>
              </Link>

              <Link
                to="/leaderboard"
                className={`group flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/leaderboard'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 text-[#c53030] shrink-0 transition-all ${location.pathname === '/leaderboard' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : 'opacity-90 group-hover:opacity-100'}`} />
                <span>Pantheon</span>
              </Link>

              <Link
                to="/upcoming"
                className={`group flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/upcoming'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <Clock className={`w-3.5 h-3.5 text-[#c53030] shrink-0 transition-all ${location.pathname === '/upcoming' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : 'opacity-90 group-hover:opacity-100'}`} />
                <span>Upcoming</span>
              </Link>

              <Link
                to="/profile"
                className={`group flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/profile'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <User className={`w-3.5 h-3.5 text-[#c53030] shrink-0 transition-all ${location.pathname === '/profile' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : 'opacity-90 group-hover:opacity-100'}`} />
                <span className="uppercase truncate max-w-[110px] lg:max-w-[160px]">@{userProfile?.username || 'PROFILE'}</span>
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-2 lg:gap-2.5">
              <Link
                to="/cemetery"
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/cemetery'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
                <span>Cemetery</span>
              </Link>

              <Link
                to="/leaderboard"
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/leaderboard'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
                <span>Pantheon</span>
              </Link>

              <Link
                to="/confessions"
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/confessions'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <Ghost className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
                <span>Confessions</span>
              </Link>

              <Link
                to="/login"
                className="group flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider bg-[#c53030] hover:bg-[#b02727] text-white border border-red-500/50 shadow-[0_0_15px_rgba(197,48,48,0.4)] hover:shadow-[0_0_22px_rgba(197,48,48,0.7)] transition-all cursor-pointer font-bold ml-1"
              >
                <KeyRound className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-200" />
                <span>Enter Graveyard</span>
              </Link>
            </nav>
          )}

          {/* Mobile Right Controls with 44px Touch Targets */}
          <div className="flex md:hidden items-center gap-2">
            {user ? (
              <Link to="/submit" className="min-h-[44px] flex items-center">
                <button 
                  className="min-h-[38px] px-3 py-1.5 text-xs font-mono font-bold text-white bg-[#c53030] rounded-lg border border-red-500 hover:bg-red-700 transition-colors shadow-sm active:scale-95 flex items-center justify-center cursor-pointer"
                  aria-label="Bury a project"
                >
                  + BURY
                </button>
              </Link>
            ) : (
              <Link to="/login" className="min-h-[44px] flex items-center">
                <button
                  className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-white bg-[#c53030] rounded-lg border border-red-500 hover:bg-[#b02727] transition-all shadow-[0_0_10px_rgba(197,48,48,0.4)] cursor-pointer"
                  aria-label="Enter Graveyard"
                >
                  <KeyRound className="w-3 h-3 text-amber-200" />
                  <span>ENTER</span>
                </button>
              </Link>
            )}
            <button 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-700 hover:border-[#c53030]/60 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md overflow-hidden px-4 py-4 space-y-2 shadow-2xl"
            >
              {user ? (
                <>
                  <div className="grid grid-cols-2 gap-2 pb-2">
                    <Link
                      to="/home"
                      className={`flex items-center gap-2 p-2.5 rounded-lg border font-mono text-xs transition-colors ${
                        location.pathname === '/home' || location.pathname === '/'
                          ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                      }`}
                    >
                      <HomeIcon className={`w-4 h-4 text-[#c53030] ${location.pathname === '/home' || location.pathname === '/' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : ''}`} />
                      <span>Home</span>
                    </Link>

                    <Link
                      to="/cemetery"
                      className={`flex items-center gap-2 p-2.5 rounded-lg border font-mono text-xs transition-colors ${
                        location.pathname === '/cemetery'
                          ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                      }`}
                    >
                      <Search className={`w-4 h-4 text-[#c53030] ${location.pathname === '/cemetery' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : ''}`} />
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
                      <PlusCircle className={`w-4 h-4 text-[#c53030] ${location.pathname === '/submit' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : ''}`} />
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
                      <Ghost className={`w-4 h-4 text-[#c53030] ${location.pathname === '/confessions' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : ''}`} />
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
                      <MessageSquare className={`w-4 h-4 text-[#c53030] ${location.pathname === '/chats' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : ''}`} />
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
                      <Trophy className={`w-4 h-4 text-[#c53030] ${location.pathname === '/leaderboard' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : ''}`} />
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
                      <Clock className={`w-4 h-4 text-[#c53030] ${location.pathname === '/upcoming' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : ''}`} />
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
                        <User className={`w-4 h-4 text-[#c53030] ${location.pathname === '/profile' ? 'drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]' : ''}`} />
                        <span className="uppercase font-semibold">@{userProfile?.username || 'PROFILE'}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">View Crypt &rarr;</span>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/cemetery"
                      className={`flex items-center gap-2 p-2.5 rounded-lg border font-mono text-xs transition-colors ${
                        location.pathname === '/cemetery'
                          ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                      }`}
                    >
                      <Search className="w-4 h-4 text-[#c53030]" />
                      <span>Cemetery</span>
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
                      to="/login"
                      className="flex items-center justify-center gap-2 p-3 rounded-lg border border-red-500/50 bg-[#c53030] hover:bg-[#b02727] text-white font-mono text-xs uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(197,48,48,0.4)] transition-all cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-amber-200" />
                      <span>Enter Graveyard &amp; Sign In</span>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative flex-grow container mx-auto px-4 sm:px-6 pb-12 pt-6 md:pt-10">
        {children}
      </main>

      <footer className="relative border-t border-border/40 bg-background py-10 sm:py-12 mt-auto">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center space-y-6">
          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-8 gap-y-2.5 text-xs font-mono text-zinc-400">
            <Link to="/cemetery" className="hover:text-[#c53030] transition-colors">
              Cemetery
            </Link>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <Link to="/leaderboard" className="hover:text-[#c53030] transition-colors">
              Pantheon
            </Link>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <Link to="/confessions" className="hover:text-[#c53030] transition-colors">
              Confessions
            </Link>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <Link to="/privacy" className="hover:text-[#c53030] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <Link to="/terms" className="hover:text-[#c53030] transition-colors">
              Terms of Service
            </Link>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <a 
              href="https://github.com/krunvermaa/DevGraveyard" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <span className="text-[10px] text-zinc-600">↗</span>
            </a>
          </div>

          <div className="w-12 h-px bg-zinc-800" />

          <p className="text-zinc-300 text-sm font-serif italic text-center max-w-sm">
            "Not every project survives.<br />Some still teach."
          </p>

          <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-widest">
            Requiescat in Pace
          </p>
        </div>
      </footer>

      {/* Cookie & Storage Notice */}
      <CookieNotice />
    </div>
  );
};
