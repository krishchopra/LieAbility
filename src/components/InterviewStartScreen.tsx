import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AnimatedEye from "./AnimatedEye";
import MovingGradientBackground from "./MovingGradientBackground";
import { useCamera } from "@/contexts/CameraContext";
import { AlertTriangle, Smile, Eye as EyeIcon, MessageSquare, Check } from "lucide-react";

interface InterviewStartScreenProps {
  onStart: () => void;
}

const InterviewStartScreen = ({ onStart }: InterviewStartScreenProps) => {
  const [showCameraTest, setShowCameraTest] = useState(false);
  const {
    videoRef,
    isStreaming,
    hasPermission,
    error: cameraError,
    startCamera,
    stopCamera,
  } = useCamera();

  const handleTestCamera = async () => {
    setShowCameraTest(true);
    await startCamera();
  };

  const handleStartInterview = () => {
    // Camera will continue running via context
    onStart();
  };

  return (
    <MovingGradientBackground variant="dark">
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4 mb-4">
          <AnimatedEye size={120} />
          <h1 className="text-6xl font-bold text-white lowercase">
            lieability
          </h1>
        </div>

        {/* Warning Card */}
        <Card className="w-full bg-gradient-to-r from-gray-800/90 to-green-900/40 border border-blue-500 backdrop-blur-sm p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="bg-transparent flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-white text-lg">
              You're about to begin an authenticity-based behavioral assessment. You won't be able to pause or redo this once started.
            </p>
          </div>
        </Card>

        {/* Camera Requirements Card */}
        <Card className="w-full bg-gray-800/70 border border-gray-700 backdrop-blur-sm p-6 rounded-lg">
          <p className="text-white text-lg text-center mb-4">
            This assessment requires camera and microphone access for behavioral analysis.
          </p>

          <div className="flex justify-center">
            <Button
              onClick={handleTestCamera}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
            >
              Test Mic and Camera
            </Button>
          </div>

          {/* Camera Test Section */}
          {showCameraTest && (
            <div className="mt-4 space-y-4">
              {cameraError && (
                <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400 font-semibold mb-2">
                    Camera Error
                  </p>
                  <p className="text-gray-300 text-sm mb-3">{cameraError}</p>
                  <Button
                    onClick={startCamera}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {!cameraError && isStreaming && (
                <div className="space-y-3">
                  <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                    <p className="text-green-400 font-semibold">
                      ✓ Camera & Microphone Ready
                    </p>
                  </div>

                  {/* Camera Preview */}
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      controls={false}
                      style={{ transform: "scaleX(-1)" }}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* What Will Be Measured Card */}
        <Card className="w-full bg-gray-800/70 border border-gray-700 backdrop-blur-sm p-6 rounded-lg">
          <h3 className="text-white text-xl font-semibold mb-6 text-center">
            What will be measured:
          </h3>
          
          <div className="space-y-3">
            <div className="bg-gray-700/50 p-3 rounded-md flex items-center gap-3">
              <Smile className="text-blue-400 h-6 w-6" />
              <span className="text-white">Emotion analysis</span>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-md flex items-center gap-3">
              <EyeIcon className="text-blue-400 h-6 w-6" />
              <span className="text-white">Facial cues</span>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-md flex items-center gap-3">
              <MessageSquare className="text-blue-400 h-6 w-6" />
              <span className="text-white">Speech patterns</span>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-md flex items-center gap-3">
              <Check className="text-blue-400 h-6 w-6" />
              <span className="text-white">Truthfulness indicators</span>
            </div>
          </div>
        </Card>

        {/* Begin Button */}
        <div className="mt-4">
          <Button
            onClick={handleStartInterview}
            disabled={showCameraTest && !isStreaming}
            className="bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400 text-gray-900 font-semibold px-8 py-3 text-lg rounded-full min-w-[180px] shadow-lg"
          >
            Begin
          </Button>
        </div>
      </div>
    </MovingGradientBackground>
  );
};

export default InterviewStartScreen;
