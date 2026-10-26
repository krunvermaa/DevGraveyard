import React from 'react';

export const Atmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep animated gradient background base - Slowed down */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-[#050505] to-black opacity-60 animate-gradient-shift bg-[length:200%_200%]" style={{ animationDuration: '60s' }} />

      {/* Mist Particles - Moving Upward - Slower and more subtle */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`mist-${i}`}
          className="absolute bottom-[-30%] w-[50vw] h-[40vh] bg-zinc-800/5 rounded-[100%] blur-[120px] animate-mist-rise"
          style={{
            left: `${Math.random() * 90}%`,
            animationDelay: `${i * 8}s`, // Increased spread
            animationDuration: `${40 + Math.random() * 20}s` // Much slower
          }}
        />
      ))}
      
      {/* Static Color Accents (Subtle Life/Death balance) */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#c53030]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '15s' }} />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[200px] animate-pulse" style={{ animationDuration: '20s', animationDelay: '5s' }} />

      {/* Floating Sparkles / Souls */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`soul-${i}`}
          className="absolute w-1 h-1 bg-[#c53030] rounded-full blur-[1px] animate-soul-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 20}s`,
            opacity: Math.random() * 0.5 + 0.2
          }}
        />
      ))}
    </div>
  );
};