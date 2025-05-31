
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AnimatedEye from './AnimatedEye';
import MovingGradientBackground from './MovingGradientBackground';

interface InterviewStartScreenProps {
  onStart: () => void;
}

const InterviewStartScreen = ({ onStart }: InterviewStartScreenProps) => {
  return (
    <MovingGradientBackground variant="dark">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8 text-center">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-4">
            <AnimatedEye size={120} />
            <h1 className="text-6xl font-bold text-white">
              Lie<span className="text-cyan-400">Ability</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Authenticity-based behavioral assessment
            </p>
          </div>

          {/* Warning Card */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-6">
            <p className="text-white text-lg mb-4">
              You're about to begin an authenticity-based behavioral assessment. 
              You won't be able to pause or redo this once started.
            </p>
          </Card>

          {/* Info Card */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-6">
            <h3 className="text-white text-xl font-semibold mb-4">What will be measured:</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span>Emotion analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span>Facial cues</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span>Speech patterns</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span>Truthfulness indicators</span>
              </div>
            </div>
          </Card>

          {/* Start Button */}
          <Button 
            onClick={onStart}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            I'm Ready → Begin
          </Button>
        </div>
      </div>
    </MovingGradientBackground>
  );
};

export default InterviewStartScreen;
