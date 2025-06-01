import React from 'react';

const AnimatedEye = ({ size = 80 }: { size?: number }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Background circle - smaller and translucent */}
      <div 
        className="rounded-full flex items-center justify-center"
        style={{ 
          width: size * 1.2, 
          height: size * 1.2, 
          backgroundColor: 'rgba(176, 169, 255, 0.2)' // #B0A9FF with 20% opacity
        }}
      >
        {/* Glowing effect - reduced */}
        <div className="absolute inset-0 animate-pulse flex items-center justify-center">
          <div 
            className="rounded-full bg-gradient-to-r from-cyan-600/10 to-blue-700/10 opacity-20"
            style={{ width: size * 1.1, height: size * 1.1 }}
          />
        </div>
        
        {/* Custom Eye logo - bigger */}
        <div 
          className="relative z-10 animate-pulse flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <img 
            src="/logo.png" 
            alt="LieAbility Eye Logo" 
            className="object-contain max-w-full max-h-full w-auto h-auto" 
          />
        </div>
        
        {/* Pulsing center - reduced
        <div className="absolute animate-ping opacity-10 flex items-center justify-center">
          <div 
            className="rounded-full bg-cyan-600"
            style={{ width: size / 6, height: size / 6 }}
          />
        </div> */}
      </div>
    </div>
  );
};

export default AnimatedEye;
