
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import AnimatedEye from './AnimatedEye';
import MovingGradientBackground from './MovingGradientBackground';

interface ProcessingScreenProps {
  onComplete: () => void;
}

const ProcessingScreen = ({ onComplete }: ProcessingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log('Processing interview data...');
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <MovingGradientBackground variant="dark">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <AnimatedEye size={100} />
          
          <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-8">
            <h2 className="text-white text-3xl font-bold mb-6">
              Analyzing your interaction...
            </h2>
            
            <p className="text-gray-300 text-lg mb-8">
              Processing authenticity and consistency patterns
            </p>
            
            <div className="space-y-4">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-cyan-400 font-semibold">{progress}%</p>
            </div>
            
            <div className="mt-8 space-y-2 text-sm text-gray-400">
              <p>✓ Analyzing facial expressions and micro-movements</p>
              <p>✓ Processing speech patterns and vocal indicators</p>
              <p>✓ Evaluating response consistency and confidence</p>
              <p>✓ Generating authenticity score</p>
            </div>
          </Card>
        </div>
      </div>
    </MovingGradientBackground>
  );
};

export default ProcessingScreen;
