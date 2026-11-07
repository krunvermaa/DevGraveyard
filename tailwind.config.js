/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#050505', // Deep charcoal, almost black
        surface: '#0a0a0a',    // Very dark grey
        border: '#27272a',     // zinc-800
        muted: '#71717a',      // zinc-500
        text: '#e4e4e7',       // zinc-300
        // Developer Accents (Red & Green Focus)
        'code-green': '#4ade80', // green-400 (Terminal/Success/Life)
        'code-red': '#f87171',   // red-400 (Error/Death/Grave)
        'code-cyan': '#22d3ee',  // cyan-400 (Kept as tertiary, rarely used)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        serif: ['Crimson Pro', 'serif'],
        averia: ['Averia Serif Libre', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'soul-gradient': 'radial-gradient(circle, rgba(74, 222, 128, 0.1) 0%, rgba(0,0,0,0) 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-fast': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 1s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'breathe': 'breathe 8s ease-in-out infinite',
        'soul-float': 'soulFloat 20s ease-in-out infinite',
        'grave-descend': 'graveDescend 2.5s cubic-bezier(0.4, 0, 1, 1) forwards',
        'soul-rise': 'soulRise 4s ease-out forwards',
        'blink': 'blink 1s step-end infinite',
        'mist-rise': 'mistRise 25s linear infinite',
        'gradient-shift': 'gradientShift 20s ease infinite',
        'modal-slide-up': 'modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'ghost-flicker': 'ghostFlicker 6s infinite alternate',
      },
      keyframes: {
        ghostFlicker: {
          '0%, 100%': { opacity: '1' },
          '48%': { opacity: '1' },
          '50%': { opacity: '0.6' },
          '52%': { opacity: '1' },
          '78%': { opacity: '1' },
          '80%': { opacity: '0.4' },
          '82%': { opacity: '1' },
          '84%': { opacity: '0.8' },
          '86%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.98)' },
        },
        soulFloat: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0.1' },
          '33%': { transform: 'translateY(-30px) translateX(25px) scale(1.1)', opacity: '0.25' },
          '66%': { transform: 'translateY(-10px) translateX(-25px) scale(1.05)', opacity: '0.15' },
        },
        graveDescend: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(150px)', opacity: '0' },
        },
        soulRise: {
          '0%': { transform: 'translateY(20px) scale(0.2)', opacity: '0' },
          '20%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-150px) scale(2)', opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        mistRise: {
          '0%': { transform: 'translateY(20%) scale(1)', opacity: '0' },
          '20%': { opacity: '0.08' },
          '80%': { opacity: '0.08' },
          '100%': { transform: 'translateY(-120%) scale(1.5)', opacity: '0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        modalSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
