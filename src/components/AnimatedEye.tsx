
import React from 'react';
import { Eye } from 'lucide-react';

const AnimatedEye = ({ size = 80 }: { size?: number }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 animate-pulse">
        <div 
          className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-20"
          style={{ width: size + 20, height: size + 20 }}
        />
      </div>
      <Eye 
        size={size} 
        className="text-cyan-400 animate-pulse relative z-10"
        strokeWidth={1.5}
      />
      <div className="absolute inset-0 animate-ping opacity-20">
        <div 
          className="rounded-full bg-cyan-400"
          style={{ width: size / 2, height: size / 2, margin: 'auto', marginTop: size / 4 }}
        />
      </div>
    </div>
  );
};

export default AnimatedEye;
