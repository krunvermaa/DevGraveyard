import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      {label && (
        <label 
          htmlFor={id} 
          className="text-[10px] font-mono uppercase tracking-widest text-zinc-200 transition-colors duration-300 group-focus-within:text-[#c53030]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`flex h-12 w-full rounded-none border-b border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-200 
                   placeholder:text-zinc-400 
                   focus:outline-none focus:border-[#c53030]/50 focus:bg-zinc-900/60 focus:text-white
                   disabled:cursor-not-allowed disabled:opacity-50 
                   transition-all duration-500 ease-out font-mono ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-code-red/90 font-mono mt-1 border-l-2 border-code-red pl-2 opacity-0 animate-fade-in">{error}</p>}
    </div>
  );
};