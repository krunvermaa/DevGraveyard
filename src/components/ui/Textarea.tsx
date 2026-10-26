import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', id, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      {label && <label htmlFor={id} className="text-[10px] font-mono uppercase tracking-widest text-zinc-200 transition-colors duration-300 group-focus-within:text-[#c53030]">{label}</label>}
      <textarea
        id={id}
        className={`flex min-h-[120px] w-full rounded-none border border-zinc-700 bg-zinc-900/50 px-3 py-3 text-sm text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-[#c53030]/50 focus:bg-zinc-900/80 focus:text-white disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all duration-300 font-sans ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-code-red/90 font-mono mt-1 border-l-2 border-code-red pl-2">{error}</p>}
    </div>
  );
};