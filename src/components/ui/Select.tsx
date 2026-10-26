import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', id, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      {label && <label htmlFor={id} className="text-[10px] font-mono uppercase tracking-widest text-zinc-200 transition-colors duration-300 group-focus-within:text-[#c53030]">{label}</label>}
      <div className="relative">
        <select
          id={id}
          className={`appearance-none flex h-12 w-full rounded-none border-b border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[#c53030]/50 focus:bg-zinc-900/80 focus:text-white disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-mono ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-code-red/90 font-mono mt-1 border-l-2 border-code-red pl-2">{error}</p>}
    </div>
  );
};