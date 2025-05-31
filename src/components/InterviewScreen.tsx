
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MovingGradientBackground from './MovingGradientBackground';

interface InterviewScreenProps {
  onComplete: () => void;
  onReset: () => void;
}

const questions = [
  "Do you want to work for this company?",
  "What experience do you have with XYZ technology?"
];

const InterviewScreen = ({ onComplete, onReset }: InterviewScreenProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [phase, setPhase] = useState<'countdown' | 'recording'>('countdown');

  useEffect(() => {
    console.log('Interview started, question:', currentQuestion + 1);
    
    // Countdown phase
    if (phase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'countdown' && countdown === 0) {
      setPhase('recording');
      setIsRecording(true);
    }
  }, [countdown, phase]);

  useEffect(() => {
    // Recording phase timer
    if (phase === 'recording' && timeLeft > 0 && isRecording) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'recording' && timeLeft === 0) {
      handleNext();
    }
  }, [timeLeft, phase, isRecording]);

  const handleNext = () => {
    console.log('Moving to next question or completing interview');
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(60);
      setCountdown(5);
      setPhase('countdown');
      setIsRecording(false);
    } else {
      onComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <MovingGradientBackground variant="cyan">
      <div className="min-h-screen flex flex-col p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-bold">
            Question {currentQuestion + 1} of {questions.length}
          </h2>
          <Button 
            onClick={onReset}
            variant="outline"
            className="bg-gray-900/50 border-gray-600 text-white hover:bg-gray-800/50"
          >
            Reset Interview
          </Button>
        </div>

        {/* Question Card */}
        <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-8 mb-6">
          <h3 className="text-white text-3xl font-semibold text-center animate-fade-in">
            {questions[currentQuestion]}
          </h3>
        </Card>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Video Preview - Takes most of the screen */}
          <div className="flex-1 lg:flex-[2]">
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm h-full min-h-[400px] lg:min-h-[600px] flex items-center justify-center relative overflow-hidden">
              {/* Simulated video preview */}
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-400 text-lg">Video Preview</p>
                  <p className="text-gray-500 text-sm">(Simulated - No actual camera access)</p>
                </div>
                
                {/* Recording indicators */}
                {isRecording && (
                  <>
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-sm">REC</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-gray-800/50 rounded-lg p-2">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          {/* Simulated waveform */}
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div 
                              key={i}
                              className="w-1 bg-green-400 rounded animate-pulse"
                              style={{ 
                                height: Math.random() * 20 + 10,
                                animationDelay: `${i * 0.1}s`
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-white text-xs text-center">Audio detected</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="lg:flex-[1] space-y-4">
            {/* Timer/Countdown */}
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-6">
              {phase === 'countdown' ? (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Recording starts in:</p>
                  <div className="text-6xl font-bold text-cyan-400">{countdown}</div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Time remaining:</p>
                  <div className="text-4xl font-bold text-white">{formatTime(timeLeft)}</div>
                  <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(timeLeft / 60) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Controls */}
            {phase === 'recording' && (
              <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-6">
                <div className="space-y-4">
                  <Button 
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    disabled={timeLeft > 50} // Minimum 10 seconds
                  >
                    {timeLeft > 50 ? `Wait ${50 - timeLeft + 1}s` : 'Next Question →'}
                  </Button>
                  <p className="text-gray-400 text-xs text-center">
                    You can proceed after 10 seconds minimum
                  </p>
                </div>
              </Card>
            )}

            {/* Status */}
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Status:</p>
                <p className="text-white font-semibold">
                  {phase === 'countdown' ? 'Preparing...' : 'Recording in progress'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MovingGradientBackground>
  );
};

export default InterviewScreen;
