import React from "react";

const LoadingAnimation = () => {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Outer spinning ring */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin"></div>

      {/* Middle spinning ring - opposite direction */}
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-cyan-300 border-l-blue-400 animate-spin-slow-reverse"></div>

      {/* Inner pulsing circle */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 animate-pulse-slow flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full bg-blue-500/30 animate-ping opacity-70"></div>

        {/* Data points that float around */}
        <div className="relative w-full h-full">
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-3 left-6 animate-float-particle"></div>
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-8 right-4 animate-float-particle animation-delay-1000"></div>
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full bottom-4 right-6 animate-float-particle animation-delay-2000"></div>
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full bottom-6 left-4 animate-float-particle animation-delay-3000"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
