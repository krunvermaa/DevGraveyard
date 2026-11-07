import React from 'react';

export const SoulBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{ contain: 'strict' }}
    >
      {/* Soul 1 - Bottom Left - Red (Failure/Grave) */}
      <div 
        className="absolute bottom-[10%] left-[10%] w-48 sm:w-64 h-48 sm:h-64 bg-code-red/5 rounded-full blur-[40px] sm:blur-[75px] animate-soul-float" 
        style={{ animationDelay: '0s', animationDuration: '22s', contain: 'strict', willChange: 'transform' }}
      />
      
      {/* Soul 2 - Top Right - Green (Code/Life) */}
      <div 
        className="absolute top-[20%] right-[15%] w-64 sm:w-96 h-64 sm:h-96 bg-[#c53030]/5 rounded-full blur-[45px] sm:blur-[85px] animate-soul-float" 
        style={{ animationDelay: '5s', animationDuration: '28s', contain: 'strict', willChange: 'transform' }}
      />
      
      {/* Soul 3 - Mid Left (Smaller) - Red */}
      <div 
        className="absolute top-[40%] left-[20%] w-24 sm:w-32 h-24 sm:h-32 bg-code-red/10 rounded-full blur-[30px] sm:blur-[50px] animate-soul-float" 
        style={{ animationDelay: '2s', animationDuration: '15s', contain: 'strict', willChange: 'transform' }}
      />
      
      {/* Soul 4 - Bottom Right - Green */}
      <div 
        className="absolute bottom-[15%] right-[25%] w-40 sm:w-56 h-40 sm:h-56 bg-[#c53030]/5 rounded-full blur-[35px] sm:blur-[60px] animate-soul-float" 
        style={{ animationDelay: '8s', animationDuration: '24s', contain: 'strict', willChange: 'transform' }}
      />
    </div>
  );
};
