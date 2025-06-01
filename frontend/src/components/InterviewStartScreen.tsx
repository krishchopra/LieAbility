import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AnimatedEye from "./AnimatedEye";
import MovingGradientBackground from "./MovingGradientBackground";
import { useCamera } from "@/contexts/CameraContext";

interface InterviewStartScreenProps {
  onStart: () => void;
}

const InterviewStartScreen = ({ onStart }: InterviewStartScreenProps) => {
  const [showCameraTest, setShowCameraTest] = useState(false);
  const {
    videoRef,
    stream,
    isStreaming,
    hasPermission,
    error: cameraError,
    startCamera,
    stopCamera,
  } = useCamera();

  // Effect to ensure video element is connected to stream when showing camera test
  useEffect(() => {
    if (showCameraTest && isStreaming && stream && videoRef.current) {
      console.log(
        "🎥 [StartScreen] Connecting video element to existing stream"
      );
      videoRef.current.srcObject = stream;

      // Ensure video plays
      videoRef.current.play().catch((error) => {
        console.warn("🎥 [StartScreen] Video autoplay failed:", error);
      });
    }
  }, [showCameraTest, isStreaming, stream]);

  const handleTestCamera = async () => {
    setShowCameraTest(true);

    // If camera is already streaming, just ensure video connection
    if (isStreaming && stream) {
      console.log(
        "🎥 [StartScreen] Camera already active, connecting to video element"
      );
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (error) {
          console.warn("🎥 [StartScreen] Video play failed:", error);
        }
      }
    } else {
      // Start camera if not already running
      console.log("🎥 [StartScreen] Starting camera for test");
      await startCamera();
    }
  };

  const handleStartInterview = () => {
    // Camera will continue running via context
    onStart();
  };

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

          {/* Camera Requirements Card */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-6">
            <h3 className="text-white text-xl font-semibold mb-4">
              Camera & Audio Required
            </h3>
            <p className="text-gray-300 mb-4">
              This assessment requires camera and microphone access for
              behavioral analysis.
            </p>

            {!showCameraTest && (
              <Button
                onClick={handleTestCamera}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 mb-4"
              >
                Test Camera & Microphone
              </Button>
            )}

            {/* Camera Test Section */}
            {showCameraTest && (
              <div className="space-y-4">
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

                {!cameraError && !isStreaming && (
                  <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4">
                    <p className="text-yellow-400 font-semibold">
                      Requesting Camera Access...
                    </p>
                    <p className="text-gray-300 text-sm">
                      Please allow camera and microphone permissions
                    </p>
                  </div>
                )}

                {!cameraError && isStreaming && (
                  <div className="space-y-3">
                    <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                      <p className="text-green-400 font-semibold">
                        ✓ Camera & Microphone Ready
                      </p>
                      <p className="text-gray-300 text-sm">
                        You can proceed with the interview
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
                        onLoadedMetadata={() =>
                          console.log("🎥 Video metadata loaded")
                        }
                        onCanPlay={() => console.log("🎥 Video can play")}
                        onPlaying={() => console.log("🎥 Video is playing")}
                        onError={(e) => console.error("🎥 Video error:", e)}
                      />
                    </div>

                    <Button
                      onClick={() => {
                        // Don't stop the camera - just hide the preview
                        // The camera should keep running for the interview
                        setShowCameraTest(false);
                      }}
                      variant="outline"
                      className="border-gray-600 text-black-300 hover:text-white hover:bg-gray-800"
                    >
                      Hide Preview
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Camera Ready Status (when preview is hidden but camera is active) */}
            {!showCameraTest && isStreaming && !cameraError && (
              <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 font-semibold">
                  ✓ Camera & Microphone Active
                </p>
                <p className="text-gray-300 text-sm">
                  Camera is ready for the interview!
                </p>
              </div>
            )}
          </Card>

          {/* Info Card */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-6">
            <h3 className="text-white text-xl font-semibold mb-4">
              What will be measured:
            </h3>
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
            onClick={handleStartInterview}
            disabled={showCameraTest && !isStreaming}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {showCameraTest && !isStreaming
              ? "Camera Required to Begin"
              : "I'm Ready → Begin"}
          </Button>
        </div>
      </div>
    </MovingGradientBackground>
  );
};

export default InterviewStartScreen;
