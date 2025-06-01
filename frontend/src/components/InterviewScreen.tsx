import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MovingGradientBackground from "./MovingGradientBackground";
import { useCamera } from "@/contexts/CameraContext";
import AudioVisualizer from "./AudioVisualizer";

interface InterviewScreenProps {
  onComplete: () => void;
  onReset: () => void;
}

const questions = [
  "Why do you want to work for us?",
  "What experience do you have with blockchain technology?",
];

const InterviewScreen = ({ onComplete, onReset }: InterviewScreenProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [phase, setPhase] = useState<"countdown" | "recording">("countdown");

  // Camera hook from context
  const {
    videoRef,
    stream,
    isStreaming,
    hasPermission,
    error: cameraError,
    startCamera,
    stopCamera,
  } = useCamera();

  // Ensure camera is running when component mounts
  useEffect(() => {
    console.log(
      "🎥 Interview screen mounted, camera streaming:",
      isStreaming,
      "error:",
      cameraError
    );

    // Always try to start camera when interview screen loads
    // This handles cases where:
    // 1. Camera was stopped in start screen
    // 2. Camera failed to start initially
    // 3. Camera permissions were lost
    const initializeCamera = async () => {
      if (!isStreaming && !cameraError) {
        console.log("🎥 Starting camera for interview...");
        await startCamera();
      } else if (cameraError) {
        console.log("🎥 Camera has error, attempting restart...");
        await startCamera();
      } else {
        console.log("🎥 Camera already streaming, no action needed");
      }
    };

    initializeCamera();
  }, [startCamera]); // Include startCamera in deps to ensure we have the latest version

  // Effect to ensure video element is connected to stream in interview
  useEffect(() => {
    if (isStreaming && stream && videoRef.current) {
      console.log("🎥 [InterviewScreen] Connecting video element to stream");
      videoRef.current.srcObject = stream;

      // Ensure video plays
      videoRef.current.play().catch((error) => {
        console.warn("🎥 [InterviewScreen] Video autoplay failed:", error);
      });
    }
  }, [isStreaming, stream]);

  useEffect(() => {
    console.log("Interview started, question:", currentQuestion + 1);

    // Countdown phase
    if (phase === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === "countdown" && countdown === 0) {
      setPhase("recording");
      setIsRecording(true);
    }
  }, [countdown, phase]);

  useEffect(() => {
    // Recording phase timer
    if (phase === "recording" && timeLeft > 0 && isRecording) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === "recording" && timeLeft === 0) {
      handleNext();
    }
  }, [timeLeft, phase, isRecording]);

  // Cleanup camera when component unmounts or interview completes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleNext = () => {
    console.log("Moving to next question or completing interview");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(60);
      setCountdown(5);
      setPhase("countdown");
      setIsRecording(false);
    } else {
      stopCamera();
      onComplete();
    }
  };

  const handleReset = () => {
    stopCamera();
    onReset();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="min-h-screen flex flex-col p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-6"></div> {/* Empty space for balance */}
        </div>

        {/* Question Card */}
        <Card className="border-blue-700/50 backdrop-blur-sm p-8 mb-6 overflow-hidden relative" 
              style={{ backgroundColor: 'rgba(10, 10, 40, 0.8)' }}>
          {/* Gradient accent - matching MovingGradientBackground gradients */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute top-[30%] right-[60%] w-[50vh] h-[50vh] rounded-full filter blur-[80px] mix-blend-screen animate-pulse-slow" 
              style={{ backgroundColor: 'rgba(0, 11, 226, 0.35)' }} 
            />
            <div 
              className="absolute bottom-[20%] left-[40%] w-[30vh] h-[30vh] rounded-full filter blur-[60px] mix-blend-screen animate-float" 
              style={{ backgroundColor: 'rgba(67, 167, 255, 0.3)' }} 
            />
            <div 
              className="absolute top-[10%] left-[60%] w-[25vh] h-[25vh] rounded-full filter blur-[50px] mix-blend-screen animate-pulse-slow animation-delay-2000" 
              style={{ backgroundColor: 'rgba(176, 169, 255, 0.25)' }} 
            />
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center relative z-10">
            <div className="bg-blue-800/50 text-blue-100 text-xs font-medium px-3 py-1.5 rounded-full mb-4 md:mb-0 md:mr-6 border border-blue-700/50 backdrop-blur-sm shadow-inner">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <h3 className="text-white text-3xl font-semibold text-center md:text-left animate-fade-in">
              {questions[currentQuestion]}
            </h3>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Video Preview - Takes most of the screen */}
          <div className="flex-1 lg:flex-[2]">
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm h-full min-h-[400px] lg:min-h-[600px] flex items-center justify-center relative overflow-hidden">
              {/* Camera Error State */}
              {cameraError && (
                <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-gray-900 flex items-center justify-center relative">
                  <div className="text-center p-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white text-4xl">⚠️</span>
                    </div>
                    <p className="text-red-400 text-lg mb-2">Camera Error</p>
                    <p className="text-gray-300 text-sm mb-4">{cameraError}</p>
                    <Button
                      onClick={startCamera}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Camera Loading State */}
              {!cameraError && !isStreaming && (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-400 text-lg">
                      Initializing Camera...
                    </p>
                    <p className="text-gray-500 text-sm">
                      Please allow camera access
                    </p>
                  </div>
                </div>
              )}

              {/* Actual Camera Feed */}
              {!cameraError && isStreaming && (
                <div className="w-full h-full relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    controls={false}
                    style={{ transform: "scaleX(-1)" }}
                    className="w-full h-full object-cover rounded-lg"
                    onLoadedMetadata={() =>
                      console.log("🎥 Interview video metadata loaded")
                    }
                    onCanPlay={() => console.log("🎥 Interview video can play")}
                    onPlaying={() =>
                      console.log("🎥 Interview video is playing")
                    }
                    onError={(e) =>
                      console.error("🎥 Interview video error:", e)
                    }
                  />

                  {/* Recording indicators */}
                  {isRecording && (
                    <>
                      <div className="absolute top-4 left-4 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
                          REC
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-gray-800/70 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <AudioVisualizer
                              stream={stream}
                              isActive={isRecording}
                            />
                          </div>
                          <p className="text-white text-xs text-center font-medium">
                            Recording in progress...
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Camera status indicator */}
                  {!isRecording && (
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-green-600/80 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        Camera Active
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Control Panel */}
          <div className="lg:flex-[1] space-y-4">
            {/* Timer/Countdown */}
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-6">
              {phase === "countdown" ? (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">
                    Recording starts in:
                  </p>
                  <div className="text-6xl font-bold text-[#AABAE4]">
                    {countdown}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Time remaining:</p>
                  <div className="text-4xl font-bold text-white">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#D3F9D6] to-[#6C85C4] h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(timeLeft / 60) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Controls */}
            {phase === "recording" && (
              <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-6">
                <div className="space-y-4">
                  <Button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    disabled={timeLeft > 50} // Minimum 10 seconds
                  >
                    {timeLeft > 50
                      ? `Wait ${timeLeft - 50}s`
                      : "Next Question →"}
                  </Button>
                  <p className="text-gray-400 text-xs text-center">
                    You can proceed after 10 seconds minimum.
                  </p>
                </div>
              </Card>
            )}

            {/* Status */}
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Status:</p>
                <p className="text-white font-semibold">
                  {phase === "countdown"
                    ? "Preparing..."
                    : "Recording in progress..."}
                </p>
              </div>
            </Card>
            
            {/* Reset Interview Button - Moved from header to bottom of right panel */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="bg-gray-900/50 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 transition-colors duration-300"
              >
                Reset Interview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;
