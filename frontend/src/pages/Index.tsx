import React, { useState } from "react";
import InterviewStartScreen from "@/components/InterviewStartScreen";
import InterviewScreen from "@/components/InterviewScreen";
import ProcessingScreen from "@/components/ProcessingScreen";
import ResultsScreen from "@/components/ResultsScreen";
import CameraTestScreen from "@/components/CameraTestScreen";
import { CameraProvider } from "@/contexts/CameraContext";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { AuthenticityScore } from "@/services/AnalysisService";

type AppState =
  | "start"
  | "camera-test"
  | "interview"
  | "processing"
  | "results";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<AppState>("start");
  const [analysisData, setAnalysisData] = useState<AuthenticityScore | null>(
    null
  );

  const handleTestCamera = () => {
    console.log("Testing camera and microphone...");
    setCurrentScreen("camera-test");
  };

  const handleStart = () => {
    console.log("Starting interview...");
    setCurrentScreen("interview");
  };

  const handleGoBackToStart = () => {
    console.log("Going back to start screen...");
    setCurrentScreen("start");
  };

  const handleInterviewComplete = (score: AuthenticityScore) => {
    console.log("Interview completed with score:", score);
    setAnalysisData(score);
    setCurrentScreen("processing");
  };

  const handleProcessingComplete = () => {
    console.log("Processing completed, showing results...");
    setCurrentScreen("results");
  };

  const handleReset = () => {
    console.log("Resetting interview...");
    setAnalysisData(null);
    setCurrentScreen("start");
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "start":
        return (
          <InterviewStartScreen
            onStart={handleStart}
            onTestCamera={handleTestCamera}
          />
        );
      case "camera-test":
        return (
          <CameraTestScreen
            onBack={handleGoBackToStart}
            onStart={handleStart}
          />
        );
      case "interview":
        return (
          <InterviewScreen
            onComplete={handleInterviewComplete}
            onReset={handleReset}
          />
        );
      case "processing":
        return (
          <ProcessingScreen
            onComplete={handleProcessingComplete}
            analysisData={analysisData}
          />
        );
      case "results":
        return analysisData ? (
          <ResultsScreen onReset={handleReset} analysisData={analysisData} />
        ) : (
          <div>Error: No analysis data available</div>
        );
      default:
        return (
          <InterviewStartScreen
            onStart={handleStart}
            onTestCamera={handleTestCamera}
          />
        );
    }
  };

  return (
    <CameraProvider>
      <AnalysisProvider>{renderCurrentScreen()}</AnalysisProvider>
    </CameraProvider>
  );
};

export default Index;
