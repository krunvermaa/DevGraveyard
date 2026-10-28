import React from 'react';

export const Atmosphere: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
      style={{ contain: 'strict' }}
    >
      {/* Deep static gradient background base */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-[#050505] to-black opacity-60 pointer-events-none" 
      />

      {/* 2 Gentle feathered mist layers with low blur and strict containment */}
      {[...Array(2)].map((_, i) => (
        <div
          key={`mist-${i}`}
          className="absolute bottom-[-20%] w-[50vw] h-[35vh] bg-zinc-800/10 rounded-[100%] blur-[25px] animate-mist-rise pointer-events-none"
          style={{
            left: i === 0 ? '10%' : '55%',
            animationDelay: `${i * 10}s`,
            animationDuration: `${32 + i * 14}s`,
            contain: 'strict',
            willChange: 'transform, opacity'
          }}
        />
      ))}
      
      {/* Subtle life/death accents with gentle blur */}
      <div 
        className="absolute top-1/4 left-1/4 w-[240px] md:w-[380px] h-[240px] md:h-[380px] bg-[#c53030]/5 rounded-full blur-[30px] pointer-events-none" 
        style={{ contain: 'strict' }}
      />
      <div 
        className="absolute bottom-1/3 right-1/4 w-[260px] md:w-[400px] h-[260px] md:h-[400px] bg-teal-900/5 rounded-full blur-[30px] pointer-events-none" 
        style={{ contain: 'strict' }}
      />

      {/* Floating Souls - Ultra-lightweight (5 particles) */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`soul-${i}`}
          className="absolute w-1 h-1 bg-[#c53030] rounded-full blur-[1px] animate-soul-float pointer-events-none"
          style={{
            left: `${(i * 19 + 12) % 92}%`,
            top: `${(i * 21 + 8) % 88}%`,
            animationDelay: `${(i * 2) % 8}s`,
            animationDuration: `${14 + (i % 3) * 4}s`,
            opacity: 0.25 + (i % 3) * 0.1,
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
};