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
            
            {/* Grid overlay
            <div className="absolute inset-0 z-0 opacity-60" 
                 style={{
                   backgroundImage: `
                     linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                     linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
                   `,
                   backgroundSize: '40px 40px',
                   backgroundPosition: 'center center'
                 }}
            /> */}
            
            {/* Main gradients */}
            <div 
              className="absolute top-[45%] left-[60%] w-[120vh] h-[120vh] rounded-full filter blur-[120px] mix-blend-screen animate-pulse-slow" 
              style={{ backgroundColor: 'rgba(0, 11, 226, 0.35)' }} 
            />
            <div 
              className="absolute top-[30%] left-[30%] w-[90vh] h-[90vh] rounded-full filter blur-[100px] mix-blend-screen animate-float" 
              style={{ backgroundColor: 'rgba(67, 167, 255, 0.3)' }} 
            />
            <div 
              className="absolute top-[70%] left-[20%] w-[70vh] h-[70vh] rounded-full filter blur-[80px] mix-blend-screen animate-pulse-slow animation-delay-2000" 
              style={{ backgroundColor: 'rgba(176, 169, 255, 0.25)' }} 
            />
            
            {/* Additional floating elements - more visible */}
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Particle 1 */}
              <div className="absolute w-24 h-24 rounded-full bg-blue-500/10 top-[15%] left-[10%] animate-float-particle" />
              <div className="absolute w-16 h-16 rounded-full bg-cyan-500/15 top-[25%] left-[85%] animate-float-particle animation-delay-2000" />
              <div className="absolute w-20 h-20 rounded-full bg-purple-500/10 top-[75%] left-[60%] animate-float-particle animation-delay-4000" />
              <div className="absolute w-32 h-32 rounded-full bg-teal-500/5 top-[55%] left-[25%] animate-float-particle animation-delay-3000" />
              <div className="absolute w-28 h-28 rounded-full bg-indigo-500/10 top-[35%] left-[75%] animate-float-particle animation-delay-1000" />
              
              {/* Light beams */}
              <div className="absolute h-[40vh] w-[2px] bg-gradient-to-b from-blue-500/0 via-blue-500/10 to-blue-500/0 top-0 left-[20%] animate-light-beam" />
              <div className="absolute h-[30vh] w-[2px] bg-gradient-to-b from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 top-[30%] left-[70%] animate-light-beam animation-delay-2000" />
              <div className="absolute h-[50vh] w-[2px] bg-gradient-to-b from-purple-500/0 via-purple-500/10 to-purple-500/0 top-[20%] left-[40%] animate-light-beam animation-delay-4000" />
              
              {/* Floating lines */}
              <div className="absolute w-[20vw] h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 top-[40%] left-0 animate-floating-line" />
              <div className="absolute w-[15vw] h-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 top-[60%] right-0 animate-floating-line animation-delay-3000" />
              <div className="absolute w-[25vw] h-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/15 to-purple-500/0 top-[20%] right-[20%] animate-floating-line animation-delay-1500" />
            </div>
            
            {/* Darker edge vignette */}
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
