import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  vy: number;
  vx: number;
  sinOffset: number;
  sinSpeed: number;
}

export const Atmosphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isTabVisible = true;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    // Check device capabilities
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0));
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Mobile: 12-14 particles for performance and battery conservation; Desktop: 30 particles
    const particleCount = prefersReducedMotion ? 0 : (isMobile ? 14 : 30);
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);

    const initParticles = () => {
      particles = [];
      const colors = [
        'rgba(197, 48, 48, ',  // Crimson blood ember
        'rgba(248, 113, 113, ', // Bright flame red
        'rgba(161, 161, 170, ', // Crypt grey soul
        'rgba(20, 184, 166, ',  // Faint ethereal teal
      ];

      for (let i = 0; i < particleCount; i++) {
        const baseAlpha = 0.15 + Math.random() * 0.25;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: (Math.random() * 1.5 + 0.8) * (isMobile ? 0.9 : 1.2),
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: baseAlpha,
          baseAlpha,
          vy: -(Math.random() * 0.35 + 0.15),
          vx: (Math.random() - 0.5) * 0.15,
          sinOffset: Math.random() * Math.PI * 2,
          sinSpeed: 0.01 + Math.random() * 0.02,
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-initialize particles within new boundaries if array is empty
      if (particles.length === 0 && !prefersReducedMotion) {
        initParticles();
      }
    };

    handleResize();
    initParticles();

    // Render loop
    let lastTime = performance.now();
    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isTabVisible || prefersReducedMotion) return;

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.sinOffset += p.sinSpeed;
        p.x += p.vx + Math.sin(p.sinOffset) * 0.25;
        p.y += p.vy * (delta * 60);

        // Subtle alpha breathing
        p.alpha = p.baseAlpha + Math.sin(p.sinOffset) * 0.08;

        // Wrap around boundaries
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -10;
        }
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;

        // Draw particle with gentle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.05, Math.min(1, p.alpha))})`;
        ctx.shadowColor = p.color + '0.6)';
        ctx.shadowBlur = isMobile ? 3 : 6;
        ctx.fill();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
    };

    let resizeTimeout: any = null;
    const onResizeThrottled = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        handleResize();
      }, 150);
    };

    window.addEventListener('resize', onResizeThrottled, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResizeThrottled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
      style={{ contain: 'strict' }}
    >
      {/* Deep static gradient background base */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-[#050505] to-black opacity-60 pointer-events-none" 
      />

      {/* 2 Feathered mist layers with strict containment */}
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

      {/* Hardware-accelerated High Performance Embers/Souls Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full"
        style={{ contain: 'strict' }}
      />
    </div>
  );
};
