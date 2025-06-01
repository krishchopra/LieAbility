import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MovingGradientBackground from "./MovingGradientBackground";
import { motion } from "framer-motion";

interface ResultsScreenProps {
  onReset: () => void;
}

const ResultsScreen = ({ onReset }: ResultsScreenProps) => {
  const trustScore = 87;
  const isAuthentic = trustScore > 75;

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

  return (
    <MovingGradientBackground variant="dark">
      <motion.div 
        className="min-h-screen p-4 max-w-4xl mx-auto"
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
          </motion.div>

          {/* Trust Score */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-sm p-8 text-center relative overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 8px 16px rgba(62, 85, 145, 0.5)',
                  }}>
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
              </div>
            </Card>
          </motion.div>

          {/* Breakdown */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-sm p-6 relative overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 8px 16px rgba(62, 85, 145, 0.5)',
                  }}>
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
            <Card className="backdrop-blur-sm p-6 text-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 8px 16px rgba(62, 85, 145, 0.5)',
                  }}>
              <h4 className="text-black text-lg font-semibold mb-4">
                {isAuthentic ? "Congratulations!" : "Try Again"}
              </h4>
              {isAuthentic ? (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Your authenticity score qualifies for verification
                  </p>
                  <Button className="w-full bg-gradient-to-r from-[#274BA9] to-[#6E87C9] hover:opacity-90 text-white">
                    Mint LieAbility NFT
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Consider practicing your responses and try again
                  </p>
                  <Button
                    onClick={onReset}
                    className="w-full bg-gradient-to-r from-[#274BA9] to-[#6E87C9] hover:opacity-90 text-white"
                  >
                    Retake Assessment
                  </Button>
                </div>
              )}
            </Card>

            <Card className="backdrop-blur-sm p-6 text-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 8px 16px rgba(62, 85, 145, 0.5)',
                  }}>
              <h4 className="text-black text-lg font-semibold mb-4">
                Share Results
              </h4>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Mint your authenticity badge as an NFT
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full bg-white/70 border-blue-300 text-blue-700 hover:text-blue-800 hover:bg-white"
                  >
                    Mint NFT
                  </Button>
                  <Button
                    onClick={onReset}
                    variant="outline"
                    className="w-full bg-white/70 border-blue-300 text-blue-700 hover:text-blue-800 hover:bg-white"
                  >
                    New Assessment
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </MovingGradientBackground>
  );
};

export default ResultsScreen;
