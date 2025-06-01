import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNFTContract } from "@/hooks/useNFTContract";
import { toast } from "sonner";
import { motion } from "framer-motion";
import MovingGradientBackground from "./MovingGradientBackground";

interface ResultsScreenProps {
  onReset: () => void;
}

const ResultsScreen = ({ onReset }: ResultsScreenProps) => {
  // Generate score once and keep it consistent
  const [trustScore] = useState(() => Math.floor(Math.random() * 26) + 75);
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
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      } 
    }
  };

  // Common box styling
  const boxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 8px 16px rgba(62, 85, 145, 0.5)',
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

  return (
    <MovingGradientBackground variant="dark">
      <motion.div 
        className="min-h-screen p-4 max-w-4xl mx-auto w-[95%]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="space-y-6">
          {/* Header */}
          <motion.div className="text-center mb-8 mt-12" variants={itemVariants}>
            <h1 className="text-6xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                Assessment Complete
              </span>
            </h1>

            {/* Connection Status */}
            {connected && (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 mt-4 backdrop-blur-sm">
                <p className="text-green-400 text-sm">
                  🔗 Wallet connected: {account?.slice(0, 6)}...
                  {account?.slice(-4)}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mt-4 backdrop-blur-sm">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </motion.div>

          {/* Trust Score */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-sm p-8 text-center relative overflow-hidden" style={boxStyle}>
              <h2 className="text-black text-2xl font-bold mb-4">Trust Score</h2>
              <div className="space-y-4">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#274BA9] to-[#6E87C9]">
                  {trustScore}%
                </div>
                <Badge
                  className={`text-lg px-4 py-2 ${
                    isAuthentic
                      ? "bg-green-500/20 text-green-600 border-green-500"
                      : "bg-red-500/20 text-red-600 border-red-500"
                  }`}
                >
                  {isAuthentic ? "Likely Authentic" : "Authenticity Questionable"}
                </Badge>

                {/* Eligibility Status */}
                {connected && eligibilityInfo && (
                  <div className="mt-4 space-y-2">
                    <Badge
                      className={`text-sm px-3 py-1 ${
                        eligibilityInfo.eligible
                          ? "bg-blue-500/20 text-blue-600 border-blue-500"
                          : "bg-gray-500/20 text-gray-600 border-gray-500"
                      }`}
                    >
                      {eligibilityInfo.eligible
                        ? "✅ Eligible for NFT"
                        : "❌ Not Eligible"}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Breakdown */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-sm p-6 relative overflow-hidden" style={boxStyle}>
              <h3 className="text-black text-xl font-bold mb-6">
                Detailed Breakdown
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                  <span className="text-gray-700 font-medium">
                    Sentiment vs. expression alignment
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                    <span className="text-green-600 font-medium">✓ Consistent</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                  <span className="text-gray-700 font-medium">
                    Response confidence (filler words, tone)
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                    <span className="text-yellow-600 font-medium">⚠️ Moderate</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                  <span className="text-gray-700 font-medium">Facial micro-expressions</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                    <span className="text-green-600 font-medium">✓ Natural</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                  <span className="text-gray-700 font-medium">Speech pattern analysis</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                    <span className="text-green-600 font-medium">✓ Authentic</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
            <Card className="backdrop-blur-sm p-6 text-center" style={boxStyle}>
              <h4 className="text-black text-lg font-semibold mb-4">
                {isAuthentic ? "Congratulations!" : "Try Again"}
              </h4>
              {isAuthentic ? (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Your authenticity score qualifies for NFT minting!
                  </p>

                  {/* Show submit button if assessment not submitted and user is connected but not eligible */}
                  {connected && !eligibilityInfo?.eligible && (
                    <Button
                      onClick={handleSubmitAssessment}
                      disabled={isSubmittingAssessment}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white mb-2"
                    >
                      {isSubmittingAssessment
                        ? "Submitting Assessment..."
                        : "Submit Assessment for NFT Eligibility"}
                    </Button>
                  )}

                  <Button
                    onClick={handleMintNFT}
                    disabled={mintButtonState.disabled}
                    className="w-full bg-gradient-to-r from-[#274BA9] to-[#6E87C9] hover:opacity-90 text-white disabled:opacity-70 disabled:cursor-not-allowed shadow-md transition-all duration-300 border border-white/20 rounded-lg"
                  >
                    {mintButtonState.text}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Consider practicing your responses and try again
                  </p>
                  <Button
                    onClick={onReset}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                  >
                    Retake Assessment
                  </Button>
                </div>
              )}
            </Card>

            <Card className="backdrop-blur-sm p-6 text-center" style={boxStyle}>
              <h4 className="text-black text-lg font-semibold mb-4">
                New Assessment
              </h4>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Ready to test your authenticity again? Start a fresh
                  assessment to improve your score.
                </p>

                <Button
                  onClick={onReset}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                >
                  Start New Assessment
                </Button>

                {connected && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-gray-400 font-bold text-sm mb-3">
                      Wallet Management
                    </p>
                    <Button
                      onClick={disconnectWallet}
                      variant="outline"
                      className="w-full bg-gray-800/50 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50"
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </MovingGradientBackground>
  );
};

export default ResultsScreen;
