import React from 'react';

export const Upcoming: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full px-4 py-12 sm:p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-24 relative z-10">
        {/* 3D-like Grim Reaper with Scythe representation */}
        <div className="w-[60%] max-w-[240px] sm:max-w-[280px] md:max-w-[360px] aspect-[4/5] relative drop-shadow-[0_0_40px_rgba(0,0,0,0.9)] animate-pulse shrink-0">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3CradialGradient id=\'glow\' cx=\'50%25\' cy=\'30%25\' r=\'50%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23c53030\' stop-opacity=\'0.2\'/%3E%3Cstop offset=\'100%25\' stop-color=\'black\' stop-opacity=\'0\'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'200\' height=\'300\' fill=\'url(%23glow)\'/%3E%3Cpath d=\'M60 50 C80 10, 120 10, 140 50 C160 100, 150 250, 150 250 L50 250 C50 250, 40 100, 60 50 Z\' fill=\'%23050505\'/%3E%3Cpath d=\'M90 70 C100 65, 110 70, 110 70 C105 80, 95 80, 90 70 Z\' fill=\'%23c53030\' opacity=\'0.8\'/%3E%3Cpath d=\'M150 80 Q190 60, 180 20 Q190 40, 170 70 L150 250 Z\' fill=\'%231a1a1a\'/%3E%3Cpath d=\'M165 45 C150 20, 110 15, 90 30 C120 30, 140 40, 165 45 Z\' fill=\'%23888\'/%3E%3C/svg%3E")',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))'
            }}
          />
        </div>
        
        <div className="flex-1 w-full max-w-lg md:max-w-xl text-left bg-zinc-950/80 p-6 sm:p-8 md:p-12 rounded-3xl border border-zinc-800/80 backdrop-blur-md shadow-2xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-white mb-6 md:mb-8 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] border-b border-white/10 pb-4 md:pb-6 text-center md:text-left">
            Upcoming<br className="hidden md:block" /> Resurrections
          </h1>
          <ul className="space-y-4 sm:space-y-6 font-mono text-zinc-300 text-sm sm:text-base">
            <li className="flex items-start gap-3 sm:gap-4 hover:text-white transition-colors group">
              <span className="text-[#c53030] font-bold mt-0.5 sm:mt-1 group-hover:scale-110 transition-transform shrink-0">1.</span>
              <span>Reviving a project (Bring your code back from the dead)</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4 hover:text-white transition-colors group">
              <span className="text-[#c53030] font-bold mt-0.5 sm:mt-1 group-hover:scale-110 transition-transform shrink-0">2.</span>
              <span>Github Link Authentication</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4 hover:text-white transition-colors group">
              <span className="text-[#c53030] font-bold mt-0.5 sm:mt-1 group-hover:scale-110 transition-transform shrink-0">3.</span>
              <span>Helping tips for not letting project die next time</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4 hover:text-white transition-colors group">
              <span className="text-[#c53030] font-bold mt-0.5 sm:mt-1 group-hover:scale-110 transition-transform shrink-0">4.</span>
              <span>LinkedIn ready project and mistake analysis</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
