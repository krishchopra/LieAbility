
import React, { useState } from 'react';
import InterviewStartScreen from '@/components/InterviewStartScreen';
import InterviewScreen from '@/components/InterviewScreen';
import ProcessingScreen from '@/components/ProcessingScreen';
import ResultsScreen from '@/components/ResultsScreen';

type AppState = 'start' | 'interview' | 'processing' | 'results';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<AppState>('start');

  const handleStart = () => {
    console.log('Starting interview...');
    setCurrentScreen('interview');
  };

  const handleInterviewComplete = () => {
    console.log('Interview completed, processing...');
    setCurrentScreen('processing');
  };

  const handleProcessingComplete = () => {
    console.log('Processing completed, showing results...');
    setCurrentScreen('results');
  };

  const handleReset = () => {
    console.log('Resetting interview...');
    setCurrentScreen('start');
  };

  switch (currentScreen) {
    case 'start':
      return <InterviewStartScreen onStart={handleStart} />;
    case 'interview':
      return <InterviewScreen onComplete={handleInterviewComplete} onReset={handleReset} />;
    case 'processing':
      return <ProcessingScreen onComplete={handleProcessingComplete} />;
    case 'results':
      return <ResultsScreen onReset={handleReset} />;
    default:
      return <InterviewStartScreen onStart={handleStart} />;
  }
};

export default Index;
