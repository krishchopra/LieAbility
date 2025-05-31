import React from 'react';

const AnimatedEye = ({ size = 80 }: { size?: number }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Background circle */}
      <div 
        className="rounded-full bg-blue-900 flex items-center justify-center"
        style={{ width: size + 40, height: size + 40 }}
      >
        {/* Glowing effect */}
        <div className="absolute inset-0 animate-pulse flex items-center justify-center">
          <div 
            className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 opacity-20"
            style={{ width: size + 20, height: size + 20 }}
          />
        </div>
        
        {/* Custom Eye logo */}
        <div 
          className="relative z-10 animate-pulse flex items-center justify-center"
          style={{ width: size * 0.85, height: size * 0.85 }}
        >
          <img 
            src="/logo.png" 
            alt="LieAbility Eye Logo" 
            className="object-contain max-w-full max-h-full w-auto h-auto" 
            style={{ transform: 'scale(0.9)' }} 
          />
        </div>
        
        {/* Pulsing center */}
        <div className="absolute animate-ping opacity-20 flex items-center justify-center">
          <div 
            className="rounded-full bg-cyan-600"
            style={{ width: size / 4, height: size / 4 }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedEye;
