import React from 'react';

export const SoulBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soul 1 - Bottom Left - Red (Failure/Grave) */}
      <div 
        className="absolute bottom-[10%] left-[10%] w-64 h-64 bg-code-red/5 rounded-full blur-[90px] animate-soul-float" 
        style={{ animationDelay: '0s', animationDuration: '22s' }}
      />
      
      {/* Soul 2 - Top Right - Green (Code/Life) */}
      <div 
        className="absolute top-[20%] right-[15%] w-96 h-96 bg-[#c53030]/5 rounded-full blur-[110px] animate-soul-float" 
        style={{ animationDelay: '5s', animationDuration: '28s' }}
      />
      
      {/* Soul 3 - Mid Left (Smaller) - Red */}
      <div 
        className="absolute top-[40%] left-[20%] w-32 h-32 bg-code-red/10 rounded-full blur-[50px] animate-soul-float" 
        style={{ animationDelay: '2s', animationDuration: '15s' }}
      />
      
      {/* Soul 4 - Bottom Right - Green */}
      <div 
        className="absolute bottom-[15%] right-[25%] w-56 h-56 bg-[#c53030]/5 rounded-full blur-[70px] animate-soul-float" 
        style={{ animationDelay: '8s', animationDuration: '24s' }}
      />
    </div>
  );
};