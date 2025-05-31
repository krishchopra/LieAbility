import React from 'react';

interface MovingGradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'orange' | 'dark';
}

const MovingGradientBackground = ({ children, variant = 'dark' }: MovingGradientBackgroundProps) => {
  const getGradientClasses = () => {
    switch (variant) {
      case 'cyan':
        return 'bg-gradient-radial from-blue-800 via-blue-900 to-slate-950';
      case 'orange':
        return 'bg-gradient-to-br from-orange-400 via-red-400 to-pink-400';
      case 'dark':
      default:
        return 'bg-black'; // Just a base color, we'll create custom gradient with absolute elements
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className={`absolute inset-0 ${getGradientClasses()}`}>
        {variant === 'dark' && (
          <div className="absolute inset-0">
            {/* Dark blue base */}
            <div className="absolute inset-0 bg-blue-950" />
            
            {/* Main teal glow - larger, off-center, positioned bottom-right */}
            <div className="absolute top-[60%] left-[55%] w-[100vh] h-[100vh] bg-teal-400/30 rounded-full filter blur-[100px] mix-blend-screen animate-pulse-slow" />
            
            {/* Secondary cyan glow - smaller, different position */}
            <div className="absolute top-[30%] left-[40%] w-[70vh] h-[70vh] bg-cyan-400/25 rounded-full filter blur-[80px] mix-blend-screen animate-float" />
            
            {/* Smaller accent glows */}
            <div className="absolute top-[80%] left-[20%] w-[40vh] h-[40vh] bg-blue-400/20 rounded-full filter blur-[60px] mix-blend-screen animate-pulse-slow animation-delay-2000" />
            <div className="absolute top-[10%] left-[70%] w-[30vh] h-[30vh] bg-cyan-300/20 rounded-full filter blur-[40px] mix-blend-screen animate-float animation-delay-3000" />
            
            {/* Additional vibrant accents */}
            <div className="absolute top-[50%] left-[10%] w-[25vh] h-[25vh] bg-indigo-500/15 rounded-full filter blur-[50px] mix-blend-screen animate-float animation-delay-4000" />
            <div className="absolute top-[20%] left-[85%] w-[20vh] h-[20vh] bg-blue-500/15 rounded-full filter blur-[30px] mix-blend-screen animate-pulse-slow animation-delay-1000" />
            
            {/* Overlay for better color blending */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 to-transparent mix-blend-overlay" />
            
            {/* Darker edge vignette - lighter to show more color */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/50" />
          </div>
        )}
        <div className="absolute inset-0 opacity-30">
          {variant !== 'dark' && (
            <>
              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/30 rounded-full mix-blend-soft-light filter blur-3xl animate-blob" />
              <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-600/30 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000" />
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000" />
              <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-cyan-600/20 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-3000" />
            </>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MovingGradientBackground;
