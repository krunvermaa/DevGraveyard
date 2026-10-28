import React from 'react';

export const Atmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}>
      {/* Deep animated gradient background base - Slowed down */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-[#050505] to-black opacity-60 animate-gradient-shift bg-[length:200%_200%]" 
        style={{ 
          animationDuration: '60s',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden'
        }} 
      />

      {/* Mist Particles - Moving Upward - Reduced & lighter blur on mobile */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`mist-${i}`}
          className={`absolute bottom-[-30%] w-[50vw] h-[40vh] bg-zinc-800/5 rounded-[100%] blur-[40px] md:blur-[120px] animate-mist-rise ${i >= 2 ? 'hidden md:block' : ''}`}
          style={{
            left: `${(i * 18 + 7) % 90}%`,
            animationDelay: `${i * 8}s`,
            animationDuration: `${40 + (i % 3) * 10}s`,
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform, opacity'
          }}
        />
      ))}
      
      {/* Static Color Accents (Subtle Life/Death balance - lighter blur & size on mobile) */}
      <div 
        className="absolute top-1/4 left-1/4 w-[260px] md:w-[500px] h-[260px] md:h-[500px] bg-[#c53030]/10 rounded-full blur-[50px] md:blur-[150px] animate-pulse" 
        style={{ 
          animationDuration: '15s',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden'
        }} 
      />
      <div 
        className="absolute bottom-1/3 right-1/4 w-[280px] md:w-[600px] h-[280px] md:h-[600px] bg-teal-900/10 rounded-full blur-[60px] md:blur-[200px] animate-pulse" 
        style={{ 
          animationDuration: '20s', 
          animationDelay: '5s',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden'
        }} 
      />

      {/* Floating Sparkles / Souls - Fewer on mobile with hardware acceleration */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`soul-${i}`}
          className={`absolute w-1 h-1 bg-[#c53030] rounded-full blur-[1px] animate-soul-float ${i >= 6 ? 'hidden md:block' : ''}`}
          style={{
            left: `${(i * 7 + 11) % 100}%`,
            top: `${(i * 17 + 5) % 100}%`,
            animationDelay: `${(i * 1.5) % 10}s`,
            animationDuration: `${12 + (i % 5) * 4}s`,
            opacity: 0.25 + (i % 4) * 0.1,
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
};