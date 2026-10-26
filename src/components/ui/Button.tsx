import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden inline-flex items-center justify-center rounded-sm text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c53030]/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]";
  
  const sizeStyles = {
    default: "h-10 px-6 py-2",
    sm: "h-8 px-3 py-1 text-xs",
    lg: "h-12 px-8 py-3 text-base",
    icon: "h-10 w-10 p-0"
  };

  const variants = {
    primary: "bg-zinc-100 text-zinc-950 font-semibold hover:bg-white hover:text-black border border-zinc-200 hover:border-white shadow-[0_0_15px_-3px_rgba(255,255,255,0.15)] hover:shadow-[0_0_20px_-3px_rgba(255,255,255,0.3)]",
    secondary: "bg-zinc-900/90 text-zinc-100 font-medium border border-zinc-700/80 hover:border-[#c53030]/60 hover:text-white hover:bg-zinc-800 shadow-sm",
    ghost: "bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-900/80 border border-transparent hover:border-zinc-700/60",
    danger: "bg-[#c53030] text-white font-semibold hover:bg-[#b02727] border border-red-500 hover:border-red-400 shadow-[0_0_15px_-3px_rgba(197,48,48,0.4)] hover:shadow-[0_0_20px_-3px_rgba(197,48,48,0.6)]"
  };

  return (
    <button 
      className={cn(baseStyles, sizeStyles[size], variants[variant], className)} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest animate-pulse">
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
          Laying to rest...
        </span>
      ) : children}
    </button>
  );
};
