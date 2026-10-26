import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden inline-flex items-center justify-center rounded-sm text-sm font-medium transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 py-2 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 hover:tracking-wide shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_-3px_rgba(255,255,255,0.2)] animate-fade-in",
    secondary: "bg-transparent border border-zinc-800 hover:border-zinc-500 text-zinc-100 hover:text-white hover:bg-zinc-900/50",
    ghost: "hover:bg-zinc-900 text-zinc-100 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest animate-pulse">
          <span className="w-1 h-1 bg-zinc-900 rounded-full animate-bounce"></span>
          Laying to rest...
        </span>
      ) : children}
    </button>
  );
};