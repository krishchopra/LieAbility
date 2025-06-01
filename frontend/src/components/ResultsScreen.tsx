import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MovingGradientBackground from "./MovingGradientBackground";
import { motion } from "framer-motion";
import { useNFTContract } from "@/hooks/useNFTContract";
import { toast } from "sonner";
import { AuthenticityScore } from "@/services/AnalysisService";
import {
  Brain,
  Eye,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Award,
  CheckCheck,
  AlertTriangle,
  Clock,
} from "lucide-react";
import AnimatedEye from "./AnimatedEye";
import VLayerProofComponent from "./VLayerProofComponent";

interface ResultsScreenProps {
  onReset: () => void;
  analysisData: AuthenticityScore;
}

const ResultsScreen = ({ onReset, analysisData }: ResultsScreenProps) => {
  // Use real analysis data instead of random generation
  const trustScore = analysisData.overall;
  const isAuthentic = trustScore >= 75;

  const {
    connected,
    account,
    eligibilityInfo,
    loading,
    error,
    connectWallet,
    submitAssessment,
    mintNFT,
    disconnectWallet,
  } = useNFTContract();

  const [assessmentSubmitted, setAssessmentSubmitted] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // Common box styling - updated to match InterviewStartScreen
  const boxStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
  };

  // Inner box styling for detailed breakdown
  const innerBoxStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
  };

  // Auto-submit assessment when component mounts and user is connected and eligible
  useEffect(() => {
    if (connected && account && isAuthentic && !assessmentSubmitted) {
      handleSubmitAssessment();
    }
  }, [connected, account, isAuthentic]);

  // Also try to submit when eligibility info is loaded and user is not eligible
  useEffect(() => {
    if (
      connected &&
      account &&
      isAuthentic &&
      eligibilityInfo &&
      !eligibilityInfo.eligible &&
      !assessmentSubmitted &&
      !isSubmittingAssessment
    ) {
      console.log("User not eligible, attempting to submit assessment...");
      handleSubmitAssessment();
    }
  }, [
    connected,
    account,
    isAuthentic,
    eligibilityInfo,
    assessmentSubmitted,
    isSubmittingAssessment,
  ]);

  const handleSubmitAssessment = async () => {
    if (!connected) {
      const success = await connectWallet();
      if (!success) return;
    }

    setIsSubmittingAssessment(true);
    try {
      const success = await submitAssessment(trustScore);
      if (success) {
        setAssessmentSubmitted(true);
        toast.success("Assessment submitted! You can now mint your NFT.");
      }
    } catch (error) {
      console.error("Assessment submission failed:", error);
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  const handleConnectWallet = async () => {
    const success = await connectWallet();
    if (success && isAuthentic) {
      handleSubmitAssessment();
    }
  };

  const handleMintNFT = async () => {
    if (!connected) {
      await handleConnectWallet();
      return;
    }

    if (!eligibilityInfo?.eligible) {
      toast.error("You need to submit your assessment first!");
      return;
    }

    const success = await mintNFT();
    if (success) {
      toast.success("🎉 LieAbility NFT minted successfully!");
    }
  };

  const getMintButtonState = () => {
    if (!connected) {
      return { text: "Connect Wallet to Mint NFT", disabled: false };
    }

    if (isSubmittingAssessment) {
      return { text: "Submitting Assessment...", disabled: true };
    }

    if (!eligibilityInfo?.eligible && !assessmentSubmitted) {
      return { text: "Submit Assessment First", disabled: true };
    }

    if (loading) {
      return { text: "Minting...", disabled: true };
    }

    return { text: "Mint LieAbility NFT", disabled: false };
  };

  const mintButtonState = getMintButtonState();

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 85) return "from-green-500 to-emerald-600";
    if (score >= 75) return "from-blue-500 to-cyan-600";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-600";
  };

  // Get breakdown item color and icon
  const getBreakdownStyle = (score: number) => {
    if (score >= 85)
      return {
        color: "text-green-600",
        bg: "bg-green-500/20",
        border: "border-green-500",
        icon: CheckCircle,
      };
    if (score >= 75)
      return {
        color: "text-blue-600",
        bg: "bg-blue-500/20",
        border: "border-blue-500",
        icon: CheckCircle,
      };
    if (score >= 60)
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-500/20",
        border: "border-yellow-500",
        icon: AlertCircle,
      };
    return {
      color: "text-red-600",
      bg: "bg-red-500/20",
      border: "border-red-500",
      icon: AlertCircle,
    };
  };

  return (
    <MovingGradientBackground variant="dark">
      {/* Add keyframe animations for the glowing button and circular progress */}
      <style>{`
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 5px 0 rgba(98, 132, 231, 0.4), 0 0 20px 0 rgba(98, 132, 231, 0.2);
          }
          50% {
            box-shadow: 0 0 20px 0 rgba(98, 132, 231, 0.6), 0 0 40px 0 rgba(98, 132, 231, 0.4);
          }
          100% {
            box-shadow: 0 0 5px 0 rgba(98, 132, 231, 0.4), 0 0 20px 0 rgba(98, 132, 231, 0.2);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes ring-fill {
          0% {
            stroke-dasharray: 0 276.46;
          }
          100% {
            stroke-dasharray: calc(276.46 * var(--score-percent) / 100) 276.46;
          }
        }

        .trust-score-glow {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2);
        }

        .trust-score-inner {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%);
        }

        .score-ring-bg {
          opacity: 0.3;
        }

        .score-ring-fill {
          stroke-dasharray: 0 276.46;
          stroke-dashoffset: 69.115; /* Start from top */
          animation: ring-fill 2s ease-out forwards;
          animation-delay: 0.5s;
        }

        .mint-button-glow {
          animation: pulse-glow 2s infinite;
        }

        .nft-button-shine::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 3s infinite;
        }

        .mint-box-glow {
          background: linear-gradient(135deg, rgba(30, 64, 175, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(147, 197, 253, 0.05) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.1) inset;
        }
      `}</style>

      {/* Header bar with logo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          {/* Logo and company name integrated into header */}
          <div className="flex items-center space-x-2">
            <AnimatedEye size={30} />
            <h1 className="text-xl font-bold tracking-tight flex">
              <span className="bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                Lie
              </span>
              <span className="text-[#8CA1D6] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                Ability
              </span>
            </h1>
          </div>

          {/* Right side - Account display if connected */}
          <div className="flex justify-end">
            {connected ? (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      <motion.div
        className="min-h-screen flex flex-col items-center p-1 md:p-2 space-y-6 max-w-7xl mx-auto w-[98%]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Empty space to account for header bar */}
        <div className="h-16"></div>

        {/* Header with Title and back button */}
        <motion.div
          className="w-full flex flex-col md:flex-row justify-between items-center mb-3 gap-4"
          variants={itemVariants}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white text-left">
            Assessment Results
          </h2>

          <Button
            onClick={onReset}
            className="bg-gray-900/50 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 transition-colors duration-300"
          >
            Start New Assessment
          </Button>
        </motion.div>

        {/* Main Content */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Left Column - Trust Score card */}
          <motion.div className="w-full lg:w-1/2" variants={itemVariants}>
            {/* Trust Score with combined functionality and style */}
            <div
              className="rounded-xl p-7 relative overflow-hidden mb-6"
              style={boxStyle}
            >
              <h3 className="text-white text-xl font-semibold mb-4 text-center">
                AI-Generated Trust Score
              </h3>

              <div className="flex flex-col items-center justify-center">
                {/* Enhanced Trust Score with Fitness Ring */}
                <div className="relative w-56 h-56 mb-6 trust-score-glow rounded-full">
                  {/* Animated Circular Progress */}
                  <svg
                    className="w-full h-full absolute top-0 left-0"
                    viewBox="0 0 100 100"
                  >
                    {/* Colored gradient background ring */}
                    <defs>
                      <linearGradient
                        id="ringGradient"
                        gradientTransform="rotate(90)"
                      >
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                      <filter
                        id="glow"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Background ring */}
                    <circle
                      className="score-ring-bg"
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="url(#ringGradient)"
                      strokeWidth="6"
                    />

                    {/* Progress ring with animation */}
                    <circle
                      className="score-ring score-ring-fill score-ring-track"
                      style={
                        { "--score-percent": trustScore } as React.CSSProperties
                      }
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="url(#ringGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      filter="url(#glow)"
                    />

                    {/* Small circles marking progress intervals */}
                    {[0, 25, 50, 75].map((mark) => (
                      <circle
                        key={mark}
                        cx={
                          50 +
                          44 *
                            Math.cos(2 * Math.PI * (mark / 100) - Math.PI / 2)
                        }
                        cy={
                          50 +
                          44 *
                            Math.sin(2 * Math.PI * (mark / 100) - Math.PI / 2)
                        }
                        r="1.5"
                        fill="#fff"
                        opacity="0.7"
                      />
                    ))}
                  </svg>

                  {/* Inner circle with score */}
                  <div className="absolute inset-[12px] rounded-full trust-score-inner border border-blue-500/30 backdrop-blur-sm flex items-center justify-center flex-col">
                    <div
                      className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${getScoreColor(
                        trustScore
                      )}`}
                    >
                      {trustScore}%
                    </div>
                    <div className="text-blue-300 text-sm mt-1 font-medium">
                      {isAuthentic ? "Likely Authentic" : "Needs Improvement"}
                    </div>

                    {/* Status indicator moved inside the circle */}
                    <div className="mt-3">
                      <Badge
                        className={`px-3 py-1 text-xs ${
                          isAuthentic
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                        }`}
                      >
                        {isAuthentic ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <XCircle className="h-3 w-3" />
                            <span>Unverified</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Correlation Score from first version */}
                <div className="mt-4 p-3 rounded-lg" style={innerBoxStyle}>
                  <div className="text-sm text-gray-300 mb-1 text-center">
                    Speech-Emotion Correlation
                  </div>
                  <div className="text-2xl font-bold text-purple-300 text-center">
                    {Math.round(
                      (analysisData.breakdown.sentiment +
                        analysisData.breakdown.microExpressions) /
                        2
                    )}
                    %
                  </div>
                </div>

                {/* Eligibility Status */}
                {connected && (
                  <div className="mt-2 space-y-2">
                    <Badge
                      className={`text-sm px-3 py-1 ${
                        eligibilityInfo?.eligible
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                          : "bg-gray-500/20 text-gray-300 border-gray-500/50"
                      }`}
                    >
                      {eligibilityInfo?.eligible
                        ? "✅ Eligible for NFT"
                        : "❌ Not Yet Eligible"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Action Card */}
            <div
              className={`rounded-xl p-5 relative overflow-hidden ${
                isAuthentic ? "mint-box-glow" : ""
              }`}
              style={isAuthentic ? undefined : boxStyle}
            >
              <h3 className="text-white text-xl font-semibold mb-4">
                {isAuthentic ? "Mint Your Verification NFT" : "Try Again"}
              </h3>

              {isAuthentic ? (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm mb-4">
                    Your authenticity score qualifies you to receive a
                    LieAbility NFT that verifies your authentic communication.
                  </p>

                  {/* Mint Button - Enhanced with glow and animations */}
                  <Button
                    onClick={handleMintNFT}
                    disabled={mintButtonState.disabled}
                    className={`
                      w-full relative overflow-hidden
                      bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#60A5FA]
                      hover:from-[#1E3A8A] hover:via-[#3B76E3] hover:to-[#60A5FA]
                      text-white disabled:opacity-70 disabled:cursor-not-allowed 
                      rounded-lg py-6 transition-all duration-300
                      border border-blue-300/30
                      ${
                        !mintButtonState.disabled
                          ? "mint-button-glow nft-button-shine"
                          : ""
                      }
                      transform hover:scale-[1.02] active:scale-[0.98]
                    `}
                  >
                    <div className="flex items-center justify-center space-x-3 relative z-10">
                      <Award className="h-6 w-6 text-blue-100 animate-pulse" />
                      <span className="text-lg font-bold tracking-wide text-blue-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                        {mintButtonState.text}
                      </span>
                    </div>
                    {/* Inner glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400/10 to-blue-300/20 opacity-80"></div>
                  </Button>

                  {/* Connected wallet info */}
                  {connected && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={disconnectWallet}
                        className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Your score indicates some areas for improvement. Consider
                    practicing your responses and try again.
                  </p>
                  <Button
                    onClick={onReset}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 text-white"
                  >
                    Retake Assessment
                  </Button>
                </div>
              )}
            </div>

            {/* Assessment Info Card - Moved to left column */}
            <div
              className="rounded-xl p-3 relative overflow-hidden mt-6"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(12px)",
                boxShadow:
                  "0 8px 32px rgba(255, 255, 255, 0.15), 0 0 15px rgba(255, 255, 255, 0.05) inset",
              }}
            >
              <div className="flex justify-between items-center text-center">
                {/* Date */}
                <div className="flex flex-col items-center space-y-1 px-2">
                  <div className="p-2 rounded-full bg-blue-500/20 text-blue-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <p className="text-gray-400 text-xs">Completed</p>
                  <p className="text-white font-semibold">Just Now</p>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center space-y-1 px-2">
                  <div className="p-2 rounded-full bg-green-500/20 text-green-300">
                    <CheckCheck className="h-5 w-5" />
                  </div>
                  <p className="text-gray-400 text-xs">Score</p>
                  <p className="text-white font-semibold">{trustScore}%</p>
                </div>

                {/* Status */}
                <div className="flex flex-col items-center space-y-1 px-2">
                  <div className="p-2 rounded-full bg-purple-500/20 text-purple-300">
                    {isAuthentic ? (
                      <Award className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">Status</p>
                  <p className="text-white font-semibold">
                    {isAuthentic ? "Verified" : "Unverified"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Detailed Analysis */}
          <motion.div className="w-full lg:w-1/2" variants={itemVariants}>
            {/* Detailed Breakdown */}
            <div
              className="rounded-xl p-6 relative overflow-hidden mb-6"
              style={boxStyle}
            >
              <h3 className="text-white text-xl font-semibold mb-6 text-center">
                Assessment Breakdown
              </h3>

              <div className="space-y-3">
                {/* Enhanced breakdown with actual data from first version */}
                <div
                  className="p-3 rounded-xl flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.02]"
                  style={innerBoxStyle}
                >
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">
                      Sentiment vs. Expression Alignment
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const style = getBreakdownStyle(
                        analysisData.breakdown.sentiment
                      );
                      const Icon = style.icon;
                      return (
                        <>
                          <Icon className={`w-4 h-4 text-white`} />
                          <span className="text-white font-medium">
                            {analysisData.breakdown.sentiment}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.02]"
                  style={innerBoxStyle}
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">
                      Response Confidence
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const style = getBreakdownStyle(
                        analysisData.breakdown.coherence
                      );
                      const Icon = style.icon;
                      return (
                        <>
                          <Icon className={`w-4 h-4 text-white`} />
                          <span className="text-white font-medium">
                            {analysisData.breakdown.coherence}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.02]"
                  style={innerBoxStyle}
                >
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">
                      Facial Micro-expressions
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const style = getBreakdownStyle(
                        analysisData.breakdown.microExpressions
                      );
                      const Icon = style.icon;
                      return (
                        <>
                          <Icon className={`w-4 h-4 text-white`} />
                          <span className="text-white font-medium">
                            {analysisData.breakdown.microExpressions}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.02]"
                  style={innerBoxStyle}
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-medium">
                      Speech Pattern Analysis
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const style = getBreakdownStyle(
                        analysisData.breakdown.confidence
                      );
                      const Icon = style.icon;
                      return (
                        <>
                          <Icon className={`w-4 h-4 text-white`} />
                          <span className="text-white font-medium">
                            {analysisData.breakdown.confidence}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg" style={innerBoxStyle}>
                <h4 className="text-white font-semibold mb-3">
                  Analysis Insights:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <span className="font-medium">Overall Score:</span>{" "}
                    {trustScore}%
                  </div>
                  <div>
                    <span className="font-medium">Speech Analysis:</span>{" "}
                    {analysisData.speech}%
                  </div>
                  <div>
                    <span className="font-medium">Facial Analysis:</span>{" "}
                    {analysisData.facial}%
                  </div>
                  <div>
                    <span className="font-medium">Micro-expressions:</span>{" "}
                    {analysisData.breakdown.microExpressions}%
                  </div>
                </div>
              </div>
            </div>

            {/* VLayer Web Proof Component */}
            {isAuthentic && (
              <motion.div variants={itemVariants}>
                <VLayerProofComponent
                  userAddress={account}
                  trustScore={trustScore}
                  onProofGenerated={(proof) => {
                    console.log("VLayer proof generated:", proof);
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </MovingGradientBackground>
  );
};

export default ResultsScreen;
