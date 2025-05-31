import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AnimatedEye from "./AnimatedEye";
import MovingGradientBackground from "./MovingGradientBackground";
import { useCamera } from "@/contexts/CameraContext";
import { AlertTriangle, Smile, Eye as EyeIcon, MessageSquare, Check } from "lucide-react";
import { motion } from "framer-motion";

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
    blue: "text-white bg-blue-600 shadow-[5px_5px_10px_rgba(0,0,30,0.3),-5px_-5px_10px_rgba(70,130,240,0.1)]",
    accent: "text-gray-900 bg-gradient-to-r from-blue-400 to-cyan-300 shadow-[5px_5px_10px_rgba(0,0,30,0.3),-5px_-5px_10px_rgba(120,200,255,0.15)]"
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

  // Common box styling
  const boxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // #FFFFFF at 10% opacity
    border: '1px solid rgba(255, 255, 255, 0.5)', // White stroke at 50% opacity
    backdropFilter: 'blur(24px)', // 24px background blur
    boxShadow: '0 8px 16px rgba(62, 85, 145, 0.5)', // #3E5591 drop shadow at 50% opacity
  };

  // Inner box styling for "What will be measured" items
  const innerBoxStyle = {
    backgroundColor: 'rgba(211, 249, 214, 0.1)', // #D3F9D6 at 10% opacity
    backdropFilter: 'blur(24px)', // 24px background blur
  };

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

  const iconStyle = "h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300";

  return (
    <MovingGradientBackground variant="dark">
      <motion.div 
        className="min-h-screen flex flex-col items-center justify-center p-2 md:p-4 space-y-8 max-w-5xl mx-auto w-[95%]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Logo */}
        <motion.div 
          className="flex flex-col items-center space-y-5 mb-6"
          variants={itemVariants}
        >
          <AnimatedEye size={130} />
          <div className="text-center">
            <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
              LieAbility
            </h1>
            <p className="text-gray-400 mt-2 text-lg font-medium">Authenticity-based behavioral assessment</p>
          </div>
        </motion.div>

        {/* Warning Card */}
        <motion.div 
          className="w-full rounded-xl p-7 relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(255, 205, 5, 0.2)', // #FFCD05 at 20% opacity
            border: '1px solid rgba(255, 255, 255, 0.5)', // White stroke at 50% opacity
            backdropFilter: 'blur(24px)', // 24px background blur
            boxShadow: '0 8px 16px rgba(62, 85, 145, 0.5)', // #3E5591 drop shadow at 50% opacity
          }}
          variants={itemVariants}
        >
          <div className="flex items-start gap-5">
            <div className="bg-transparent flex-shrink-0 p-1">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-white text-lg font-medium leading-relaxed">
              You're about to begin an authenticity-based behavioral assessment. You won't be able to pause or redo this once started.
            </p>
          </div>
        </motion.div>

        {/* Camera Requirements Card */}
        <motion.div 
          className="w-full rounded-xl p-7 relative overflow-hidden"
          style={boxStyle}
          variants={itemVariants}
        >
          <p className="text-black text-lg font-medium text-center mb-6">
            This assessment requires camera and microphone access for behavioral analysis.
          </p>

          <div className="flex justify-center">
            <NeumorphicButton
              onClick={handleTestCamera}
              color="blue"
            >
              Test Mic and Camera
            </NeumorphicButton>
          </div>

          {/* Camera Test Section */}
          {showCameraTest && (
            <motion.div 
              className="mt-6 space-y-5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              {cameraError && (
                <div className="bg-red-900/30 border border-red-500 rounded-xl p-5">
                  <p className="text-red-400 font-semibold mb-3">
                    Camera Error
                  </p>
                  <p className="text-gray-300 text-sm mb-4">{cameraError}</p>
                  <NeumorphicButton
                    onClick={startCamera}
                    className="bg-red-600 hover:bg-red-500 text-white"
                  >
                    Try Again
                  </NeumorphicButton>
                </div>
              )}

              {!cameraError && isStreaming && (
                <div className="space-y-4">
                  <div className="bg-green-900/30 border border-green-500 rounded-xl p-5">
                    <p className="text-green-400 font-semibold flex items-center">
                      <Check className="mr-2 h-5 w-5" /> Camera & Microphone Ready
                    </p>
                  </div>

                  {/* Camera Preview */}
                  <div className="bg-gray-800/80 rounded-xl overflow-hidden shadow-lg">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      controls={false}
                      style={{ transform: "scaleX(-1)" }}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* What Will Be Measured Card */}
        <motion.div 
          className="w-full rounded-xl p-7 relative overflow-hidden"
          style={boxStyle}
          variants={itemVariants}
        >
          <h3 className="text-black text-xl font-semibold mb-6 text-center">
            What will be measured:
          </h3>
          
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            <motion.div 
              className="p-4 rounded-xl flex items-center gap-4 group transition-all duration-300 hover:scale-[1.02]" 
              style={innerBoxStyle}
              whileHover={{ backgroundColor: 'rgba(211, 249, 214, 0.15)' }}
            >
              <Smile className={iconStyle} />
              <span className="text-black font-medium">Emotion analysis</span>
            </motion.div>
            
            <motion.div 
              className="p-4 rounded-xl flex items-center gap-4 group transition-all duration-300 hover:scale-[1.02]" 
              style={innerBoxStyle}
              whileHover={{ backgroundColor: 'rgba(211, 249, 214, 0.15)' }}
            >
              <EyeIcon className={iconStyle} />
              <span className="text-black font-medium">Facial cues</span>
            </motion.div>
            
            <motion.div 
              className="p-4 rounded-xl flex items-center gap-4 group transition-all duration-300 hover:scale-[1.02]" 
              style={innerBoxStyle}
              whileHover={{ backgroundColor: 'rgba(211, 249, 214, 0.15)' }}
            >
              <MessageSquare className={iconStyle} />
              <span className="text-black font-medium">Speech patterns</span>
            </motion.div>
            
            <motion.div 
              className="p-4 rounded-xl flex items-center gap-4 group transition-all duration-300 hover:scale-[1.02]" 
              style={innerBoxStyle}
              whileHover={{ backgroundColor: 'rgba(211, 249, 214, 0.15)' }}
            >
              <Check className={iconStyle} />
              <span className="text-black font-medium">Truthfulness indicators</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Begin Button */}
        <motion.div 
          className="mt-4"
          variants={itemVariants}
        >
          <NeumorphicButton
            onClick={handleStartInterview}
            disabled={showCameraTest && !isStreaming}
            color="accent"
            className="min-w-[200px] px-8 py-3 text-lg rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 shadow-[8px_8px_16px_rgba(0,0,30,0.4),-8px_-8px_16px_rgba(120,200,255,0.25)] border border-white/20"
          >
            <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">Begin</span>
          </NeumorphicButton>
        </motion.div>
      </motion.div>
    </MovingGradientBackground>
  );
};

export default InterviewStartScreen;
