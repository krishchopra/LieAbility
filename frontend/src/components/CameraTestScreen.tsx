import React, { useState, useEffect } from "react";
import { Check, AlertTriangle, ArrowLeft } from "lucide-react";
import MovingGradientBackground from "./MovingGradientBackground";
import { useCamera } from "@/contexts/CameraContext";
import { motion } from "framer-motion";
import AnimatedEye from "./AnimatedEye";

// Neumorphic button component
const NeumorphicButton = ({ 
  children, 
  onClick, 
  className = "", 
  disabled = false,
  color = "blue" // "blue" or "accent"
}) => {
  const baseStyle = "relative flex items-center justify-center px-6 py-2 rounded-xl font-medium text-base transition-all duration-300 transform active:scale-95 active:shadow-inner disabled:opacity-70 disabled:cursor-not-allowed";
  
  const colorStyles = {
    blue: "text-white bg-blue-600 shadow-[5px_5px_10px_rgba(0,0,30,0.3),0px_0px_8px_rgba(70,130,240,0.1)]",
    accent: "text-gray-900 bg-gradient-to-r from-blue-400 to-cyan-300 shadow-[5px_5px_10px_rgba(0,0,30,0.3),0px_0px_8px_rgba(120,200,255,0.15)]"
  };
  
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyle} ${colorStyles[color]} ${className}`}
    >
      {/* Inner highlight effect */}
      <span className="absolute inset-0 rounded-xl overflow-hidden">
        <span className="absolute inset-0 opacity-20 bg-gradient-to-b from-white via-transparent to-transparent"></span>
      </span>
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

interface CameraTestScreenProps {
  onBack: () => void;
  onStart: () => void;
}

const CameraTestScreen = ({ onBack, onStart }: CameraTestScreenProps) => {
  const {
    videoRef,
    isStreaming,
    hasPermission,
    error: cameraError,
    startCamera,
    stopCamera,
  } = useCamera();

  useEffect(() => {
    // Start camera automatically when component mounts
    startCamera();
    
    // Cleanup when component unmounts
    return () => {
      // Don't stop camera on unmount as we'll need it for the interview
    };
  }, [startCamera]);

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

  return (
    <MovingGradientBackground variant="dark">
      <motion.div 
        className="min-h-screen flex flex-col items-center justify-center p-2 md:p-4 space-y-8 max-w-5xl mx-auto w-[95%]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >

        {/* Camera Test Card */}
        <motion.div 
          className="w-full rounded-xl p-7 relative overflow-hidden"
          style={boxStyle}
          variants={itemVariants}
        >
          <div className="mb-4 text-center">
            <p className="text-black text-lg font-medium">
              Please ensure your camera and microphone are working properly before beginning the assessment.
            </p>
          </div>

          {/* Camera Error Display */}
          {cameraError && (
            <motion.div 
              className="bg-red-900/30 border border-red-500 rounded-xl p-5 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-red-400 font-semibold mb-2">
                    Camera Error
                  </p>
                  <p className="text-gray-300 text-sm mb-4">{cameraError}</p>
                  <NeumorphicButton
                    onClick={startCamera}
                    color="blue"
                  >
                    Try Again
                  </NeumorphicButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* Camera Preview */}
          {!cameraError && (
            <div className="space-y-6">
              {isStreaming && (
                <motion.div 
                  className=" bg-green-500  border border-green-400/30 rounded-xl p-5 flex items-center justify-center shadow-inner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-white font-semibold flex items-center text-lg">
                    <Check className="mr-3 h-6 w-6 text-green-400" /> Camera & Microphone Ready
                  </p>
                </motion.div>
              )}

              <div className="bg-gray-800/80 rounded-xl overflow-hidden shadow-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  controls={false}
                  style={{ transform: "scaleX(-1)" }}
                  className="w-full h-72 object-cover"
                />
              </div>

              <p className="text-black text-sm text-center opacity-80">
                You should see yourself in the preview above. Try speaking to test your microphone.
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex space-x-4 mt-4"
          variants={itemVariants}
        >
          <NeumorphicButton
            onClick={onBack}
            color="blue"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </NeumorphicButton>

          <NeumorphicButton
            onClick={onStart}
            disabled={!isStreaming}
            color="accent"
            className="min-w-[200px] px-8 py-3 text-lg rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[8px_8px_16px_rgba(0,0,30,0.4),0px_0px_12px_rgba(120,200,255,0.25)] border-0"
          >
            <span className="text-white drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">Begin Assessment</span>
          </NeumorphicButton>
        </motion.div>
      </motion.div>
    </MovingGradientBackground>
  );
};

export default CameraTestScreen; 