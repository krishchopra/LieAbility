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
            {/* Dark background base */}
            <div className="absolute inset-0 bg-black" />
            
            {/* Deep blue glow - #000BE2 with reduced opacity */}
            <div 
              className="absolute top-[45%] left-[60%] w-[120vh] h-[120vh] rounded-full filter blur-[120px] mix-blend-screen animate-pulse-slow" 
              style={{ backgroundColor: 'rgba(0, 11, 226, 0.35)' }} // #000BE2 with 35% opacity (reduced from 70%)
            />
            
            {/* Bright teal/mint glow - #43FFC0 with reduced opacity */}
            <div 
              className="absolute top-[30%] left-[30%] w-[90vh] h-[90vh] rounded-full filter blur-[100px] mix-blend-screen animate-float" 
              style={{ backgroundColor: 'rgba(67, 255, 192, 0.3)' }} // #43FFC0 with 30% opacity (reduced from 70%)
            />
            
            {/* Light purple/lavender glow - #B0A9FF with reduced opacity */}
            <div 
              className="absolute top-[70%] left-[20%] w-[70vh] h-[70vh] rounded-full filter blur-[80px] mix-blend-screen animate-pulse-slow animation-delay-2000" 
              style={{ backgroundColor: 'rgba(176, 169, 255, 0.25)' }} // #B0A9FF with 25% opacity (reduced from 50%)
            />
            
            {/* Additional accent glows with the same colors but at reduced opacity */}
            <div 
              className="absolute top-[15%] left-[75%] w-[50vh] h-[50vh] rounded-full filter blur-[70px] mix-blend-screen animate-float animation-delay-3000" 
              style={{ backgroundColor: 'rgba(176, 169, 255, 0.15)' }} // #B0A9FF with 15% opacity (reduced from 30%)
            />
            
            <div 
              className="absolute top-[80%] left-[50%] w-[40vh] h-[40vh] rounded-full filter blur-[60px] mix-blend-screen animate-float animation-delay-4000" 
              style={{ backgroundColor: 'rgba(67, 255, 192, 0.2)' }} // #43FFC0 with 20% opacity (reduced from 40%)
            />
            
            <div 
              className="absolute top-[40%] left-[10%] w-[30vh] h-[30vh] rounded-full filter blur-[50px] mix-blend-screen animate-pulse-slow animation-delay-1000" 
              style={{ backgroundColor: 'rgba(0, 11, 226, 0.25)' }} // #000BE2 with 25% opacity (reduced from 50%)
            />
            
            {/* Lighter edge vignette */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/40" />
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
