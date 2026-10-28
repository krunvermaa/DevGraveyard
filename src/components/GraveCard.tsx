import React from 'react';
import { Grave } from '../types';
import { Link } from 'react-router-dom';

interface GraveCardProps {
  grave: Grave;
  index?: number;
  className?: string;
  onClick?: () => void;
}

export const GraveCard: React.FC<GraveCardProps> = ({ grave, index = 0, className = '', onClick }) => {
  const year = new Date(grave.created_at).getFullYear();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const playHoverSound = () => {
    try {
      // Disable hover sound on touch devices to avoid audio thread stalls on mobile
      if (typeof window !== 'undefined' && 'ontouchstart' in window && !window.matchMedia('(hover: hover)').matches) {
        return;
      }
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Low, spooky drone sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Ignore audio errors
    }
  };

  return (
    <div 
      className={`group relative flex flex-col items-center justify-end h-[300px] w-full cursor-pointer focus:outline-none select-none z-10 hover:z-50 focus:z-50 transition-transform duration-300 hover:-translate-y-2 ${className}`}
      tabIndex={0}
      role="button"
      aria-label={`View details for project ${grave.project_name}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={playHoverSound}
    >
      {/* 
        GRAVE STONE
      */}
      <div 
        className="relative z-10 w-40 h-56 bg-zinc-600 border-x-4 border-t-4 border-zinc-500 rounded-t-full rounded-b-md 
                   flex flex-col items-center justify-center p-4 text-center shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_4px_15px_rgba(255,255,255,0.1)] overflow-hidden
                   group-hover:border-zinc-400 group-hover:shadow-[0_0_40px_10px_rgba(197,48,48,0.3)]
                   transition-all duration-500 ease-out"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundBlendMode: 'overlay',
          backgroundColor: '#3f3f46', // zinc-700 equivalent
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        
        {/* Engraving Texture */}
        <div className="space-y-4 opacity-90 relative z-20 w-full px-2 mix-blend-multiply">
           <div className="text-zinc-900 text-3xl font-serif leading-none drop-shadow-sm">✟</div>
           
           <h3 className="font-averia font-bold text-zinc-900 uppercase tracking-tighter text-lg break-words leading-tight shadow-sm line-clamp-3">
             {grave.project_name}
           </h3>
           
           <div className="w-1/2 h-px bg-zinc-800/60 mx-auto box-content border-b border-white/10" />
           
           <span className="font-mono text-xs text-zinc-800 tracking-widest font-semibold block drop-shadow-sm">
             {year}
           </span>
        </div>

        {/* Bottom dirt gradient */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      </div>

      {/* Ground Shadow */}
      <div className="absolute bottom-[-10px] w-56 h-6 bg-[#c53030]/10 blur-xl rounded-[100%] z-0 opacity-0 group-hover:opacity-100 group-hover:w-64 group-hover:bg-[#c53030]/20 transition-all duration-500" />
      <div className="absolute bottom-[-5px] w-48 h-8 bg-black blur-md rounded-[100%] z-0 opacity-80 group-hover:w-56 group-hover:opacity-100 transition-all duration-500" />

      {/* User Avatar Label */}
      {grave.user_name && !grave.is_anonymous && (
        <Link 
          to={`/user/${grave.user_name}`}
          onClick={(e) => e.stopPropagation()}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 shadow-lg backdrop-blur-sm z-20 hover:bg-zinc-800 hover:border-zinc-600 transition-colors whitespace-nowrap max-w-[200px]"
        >
          {grave.user_avatar && (
            <img 
               src={grave.user_avatar} 
               alt={grave.user_name} 
               className="w-5 h-5 rounded-full object-cover bg-zinc-950 p-0.5 border border-zinc-700 shrink-0" 
             />
          )}
          <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider truncate">
            {grave.user_name}
          </span>
        </Link>
      )}

      {/* GitHub Link Icon */}
      {grave.github_link && (
        <a
          href={grave.github_link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 right-4 p-2 bg-zinc-900/80 border border-zinc-800/80 rounded-full shadow-lg backdrop-blur-sm z-30 hover:bg-zinc-800 hover:border-zinc-600 transition-all hover:scale-110 group/gh"
          title="View Repository"
        >
          <svg className="w-5 h-5 text-zinc-400 group-hover/gh:text-white" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
      )}
    </div>
  );
};
