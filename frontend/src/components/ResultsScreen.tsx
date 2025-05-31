import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedEye from "./AnimatedEye";
import MovingGradientBackground from "./MovingGradientBackground";

interface ResultsScreenProps {
  onReset: () => void;
}

const ResultsScreen = ({ onReset }: ResultsScreenProps) => {
  const trustScore = 87;
  const isAuthentic = trustScore > 75;

  return (
    <MovingGradientBackground variant="orange">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <AnimatedEye size={80} />
            <h1 className="text-4xl font-bold text-white">
              Assessment Complete
            </h1>
          </div>

          {/* Trust Score */}
          <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-8 text-center">
            <h2 className="text-white text-2xl font-bold mb-4">Trust Score</h2>
            <div className="space-y-4">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {trustScore}%
              </div>
              <Badge
                className={`text-lg px-4 py-2 ${
                  isAuthentic
                    ? "bg-green-500/20 text-green-400 border-green-500"
                    : "bg-red-500/20 text-red-400 border-red-500"
                }`}
              >
                {isAuthentic ? "Likely Authentic" : "Authenticity Questionable"}
              </Badge>
            </div>
          </Card>

          {/* Breakdown */}
          <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-6">
            <h3 className="text-white text-xl font-bold mb-6">
              Detailed Breakdown
            </h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">
                  Sentiment vs. expression alignment
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span className="text-green-400">✓ Consistent</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">
                  Response confidence (filler words, tone)
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                  <span className="text-yellow-400">⚠️ Moderate</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Facial micro-expressions</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span className="text-green-400">✓ Natural</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Speech pattern analysis</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span className="text-green-400">✓ Authentic</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-6 text-center">
              <h4 className="text-white text-lg font-semibold mb-4">
                {isAuthentic ? "Congratulations!" : "Try Again"}
              </h4>
              {isAuthentic ? (
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Your authenticity score qualifies for verification
                  </p>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                    Mint LieAbility NFT
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-300">
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

            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm p-6 text-center">
              <h4 className="text-white text-lg font-semibold mb-4">
                Share Results
              </h4>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Mint your authenticity badge as an NFT
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full bg-gray-800/50 border-gray-600 text-white hover:text-white hover:bg-gray-700/50"
                  >
                    Mint NFT
                  </Button>
                  <Button
                    onClick={onReset}
                    variant="outline"
                    className="w-full bg-gray-800/50 border-gray-600 text-white hover:text-white hover:bg-gray-700/50"
                  >
                    New Assessment
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MovingGradientBackground>
  );
};

export default ResultsScreen;
