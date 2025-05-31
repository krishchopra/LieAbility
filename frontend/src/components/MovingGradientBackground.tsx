
import React from 'react';

interface MovingGradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'orange' | 'dark';
}

const MovingGradientBackground = ({ children, variant = 'dark' }: MovingGradientBackgroundProps) => {
  const getGradientClasses = () => {
    switch (variant) {
      case 'cyan':
        return 'bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900';
      case 'orange':
        return 'bg-gradient-to-br from-orange-400 via-red-400 to-pink-400';
      case 'dark':
      default:
        return 'bg-gradient-to-br from-slate-900 via-gray-900 to-black';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className={`absolute inset-0 ${getGradientClasses()}`}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>
      </div>
      
      {/* Line art overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MovingGradientBackground;
