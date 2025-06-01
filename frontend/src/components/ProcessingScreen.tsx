import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import MovingGradientBackground from "./MovingGradientBackground";
import LoadingAnimation from "./LoadingAnimation";
import { AuthenticityScore } from "@/services/AnalysisService";
import {
  Brain,
  Eye,
  MessageSquare,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

interface ProcessingScreenProps {
  onComplete: () => void;
  analysisData?: AuthenticityScore | null;
}

const ProcessingScreen = ({
  onComplete,
  analysisData,
}: ProcessingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const processingSteps = [
    {
      icon: Brain,
      label: "Initializing final analysis",
      duration: 15,
      color: "text-blue-400",
    },
    {
      icon: Eye,
      label: "Processing facial micro-expressions",
      duration: 25,
      color: "text-purple-400",
    },
    {
      icon: MessageSquare,
      label: "Analyzing speech patterns and sentiment",
      duration: 20,
      color: "text-green-400",
    },
    {
      icon: TrendingUp,
      label: "Computing correlation algorithms",
      duration: 15,
      color: "text-orange-400",
    },
    {
      icon: CheckCircle,
      label: "Generating authenticity score",
      duration: 25,
      color: "text-cyan-400",
    },
  ];

  useEffect(() => {
    console.log("Processing interview data with analysis:", analysisData);

    let totalProgress = 0;
    let stepIndex = 0;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;

        // Calculate which step we should be on
        let accumulatedDuration = 0;
        for (let i = 0; i < processingSteps.length; i++) {
          accumulatedDuration += processingSteps[i].duration;
          if (newProgress <= accumulatedDuration) {
            setCurrentStep(i);
            break;
          }
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1500);
          return 100;
        }
        return newProgress;
      });
    }, 80); // Faster updates for smoother animation

    return () => clearInterval(interval);
  }, [onComplete, analysisData]);

  const getStepStatus = (index: number) => {
    let accumulatedDuration = 0;
    for (let i = 0; i <= index; i++) {
      accumulatedDuration += processingSteps[i].duration;
    }

    if (progress >= accumulatedDuration) return "completed";
    if (index === currentStep) return "processing";
    return "pending";
  };

  const getAnalysisPreview = () => {
    if (!analysisData) return null;

    const { breakdown } = analysisData;
    return (
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <div className="text-gray-400">Sentiment Alignment</div>
          <div className="text-blue-400 font-semibold">
            {breakdown.sentiment}%
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-400">Response Confidence</div>
          <div className="text-green-400 font-semibold">
            {breakdown.coherence}%
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-400">Facial Authenticity</div>
          <div className="text-purple-400 font-semibold">
            {breakdown.microExpressions}%
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-400">Speech Patterns</div>
          <div className="text-orange-400 font-semibold">
            {breakdown.confidence}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <MovingGradientBackground variant="dark">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <LoadingAnimation />

          <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-8">
            <h2 className="text-white text-3xl font-bold mb-6">
              Analyzing your interaction...
            </h2>

            <p className="text-gray-300 text-lg mb-8">
              Processing authenticity and consistency patterns using AI and CV
            </p>

            {/* Progress Bar */}
            <div className="space-y-4 mb-8">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
              <p className="text-cyan-400 font-semibold text-xl">{progress}%</p>
            </div>

            {/* Processing Steps */}
            <div className="space-y-3 mb-8">
              {processingSteps.map((step, index) => {
                const status = getStepStatus(index);
                const Icon = step.icon;

                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      status === "completed"
                        ? "bg-green-900/30 border border-green-700/50"
                        : status === "processing"
                        ? "bg-blue-900/30 border border-blue-700/50"
                        : "bg-gray-800/30"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        status === "completed"
                          ? "text-green-400"
                          : status === "processing"
                          ? step.color + " animate-spin"
                          : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        status === "completed"
                          ? "text-green-400"
                          : status === "processing"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {status === "completed"
                        ? "✓ "
                        : status === "processing"
                        ? "⏳ "
                        : "◦ "}
                      {step.label}
                    </span>
                    {status === "processing" && (
                      <div className="flex space-x-1 ml-auto">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-100" />
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-200" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Analysis Preview (shows if data is available) */}
            {analysisData && progress > 50 && (
              <Card className="bg-black/40 border-gray-600 p-4 mb-6">
                <h4 className="text-white text-sm font-semibold mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-cyan-400" />
                  Analysis Preview
                </h4>
                {getAnalysisPreview()}
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                      {analysisData.overall}%
                    </div>
                    <div className="text-xs text-gray-400">
                      Preliminary Score
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
              <div className="space-y-1">
                <div className="font-medium text-blue-400">Computer Vision</div>
                <div>Facial landmark detection</div>
                <div>Emotion recognition</div>
                <div>Micro-expression analysis</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-green-400">
                  Speech Processing
                </div>
                <div>Real-time transcription</div>
                <div>Sentiment analysis</div>
                <div>Confidence scoring</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-purple-400">
                  AI Correlation
                </div>
                <div>Multi-modal alignment</div>
                <div>Pattern recognition</div>
                <div>Authenticity scoring</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MovingGradientBackground>
  );
};

export default ProcessingScreen;
