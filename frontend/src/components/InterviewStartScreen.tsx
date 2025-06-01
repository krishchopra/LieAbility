import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AnimatedEye from "./AnimatedEye";
import MovingGradientBackground from "./MovingGradientBackground";
import { useCamera } from "@/contexts/CameraContext";
import { AlertTriangle, Smile, Eye as EyeIcon, MessageSquare, Check, Camera, CheckCircle2, XCircle, Volume2, LampDesk, Wifi, Clock, Timer, ListChecks } from "lucide-react";
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
  const { videoRef, stream, isStreaming, hasPermission, error: cameraError, startCamera } = useCamera();

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // Common box styling - updated for glassmorphic effect
  const boxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // More transparent
    border: '1px solid rgba(255, 255, 255, 0.2)', // More subtle border
    backdropFilter: 'blur(12px)', // Slightly reduced blur for better transparency
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)', // Softer shadow for glass effect
  };

  // Inner box styling for "What will be measured" items - updated for glassmorphic effect
  const innerBoxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Very transparent background
    backdropFilter: 'blur(8px)', // Lighter blur
    border: '1px solid rgba(255, 255, 255, 0.18)', // Subtle border
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
      {/* Additional corner gradient */}
      <div
        className="absolute top-0 right-0 w-[40vw] h-[40vh] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(111, 63, 251, 0.4) 0%, rgba(70, 41, 173, 0.2) 50%, rgba(0, 0, 0, 0) 80%)',
          borderRadius: '0 0 0 100%',
        }}
      />
      
      {/* Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-20 px-4 py-3" style={{
        backgroundColor: 'rgba(10, 10, 30, 0.3)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
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
          
          {/* Navigation Links */}
          <nav className="flex space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">How it Works</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">About</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Web3 Integration</a>
          </nav>
          
          {/* Right side - Login button */}
          <div className="flex justify-end">
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Login
            </button>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="min-h-screen flex flex-col items-center justify-center p-1 md:p-2 space-y-6 max-w-7xl mx-auto w-[98%]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Empty space to account for header bar */}
        <div className="h-16"></div>

        {/* Header with Title and Start Button */}
        <motion.div
          className="w-full flex flex-col md:flex-row justify-between items-center mb-3 gap-4"
          variants={itemVariants}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white text-left">
            Recruiter Screen with ETHGlobal
          </h2>

          <NeumorphicButton
            onClick={onStart}
            color="accent"
            className="min-w-[180px] px-6 py-3 text-lg rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
            disabled={!isStreaming || !!cameraError}
          >
            <span className="text-white drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
              {!isStreaming || cameraError ? "Camera not ready" : "Start Interview"}
            </span>
          </NeumorphicButton>
        </motion.div>

        {/* Main two-column layout */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Left Column - Camera Preview */}
          <motion.div
            className="w-full lg:w-1/2"
            variants={itemVariants}
          >
            <div className="rounded-xl overflow-hidden h-full min-h-[300px] relative" style={boxStyle}>
              {/* Camera Error State */}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center flex-col p-6 text-center bg-black/30 backdrop-blur-sm">
                  <div className="w-16 h-16 bg-red-600/50 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Camera Error</h3>
                  <p className="text-gray-300 mb-4">{cameraError}</p>
                  <NeumorphicButton onClick={startCamera} color="blue">
                    Try Again
                  </NeumorphicButton>
                </div>
              )}

              {/* Camera Loading State */}
              {!cameraError && !isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center flex-col p-6 text-center bg-black/30 backdrop-blur-sm">
                  <div className="w-16 h-16 bg-blue-600/50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Camera className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Initializing Camera</h3>
                  <p className="text-gray-300">Please allow camera access when prompted</p>
                </div>
              )}

              {/* Camera Preview */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover min-h-[300px] md:min-h-[400px]"
                style={{ transform: "scaleX(-1)" }}
              />

              {/* Camera Ready Indicator */}
              {isStreaming && !cameraError && (
                <div className="absolute bottom-4 right-4 px-4 py-2 bg-green-600/80 backdrop-blur-sm rounded-full flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-medium">Camera Ready</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Information Boxes */}
          <motion.div
            className="w-full lg:w-1/2 flex flex-col gap-4"
            variants={itemVariants}
          >
            {/* Interview Info Card */}
            <motion.div 
              className="w-full rounded-xl p-3 relative overflow-hidden"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(255, 255, 255, 0.15), 0 0 15px rgba(255, 255, 255, 0.05) inset',
              }}
              variants={itemVariants}
            >
              <div className="flex justify-between items-center text-center">
                {/* Due By */}
                <div className="flex flex-col items-center space-y-1 px-2">
                  <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <p className="text-gray-400 text-xs">Due by</p>
                  <p className="text-white font-semibold">Nov 19, 7pm</p>
                </div>

                {/* Duration */}
                <div className="flex flex-col items-center space-y-1 px-2">
                  <div className="p-2 rounded-full bg-orange-500/20 text-orange-300">
                    <Timer className="h-5 w-5" />
                  </div>
                  <p className="text-gray-400 text-xs">Duration</p>
                  <p className="text-white font-semibold">15 Mins</p>
                </div>

                {/* Number of Questions */}
                <div className="flex flex-col items-center space-y-1 px-2">
                  <div className="p-2 rounded-full bg-violet-500/20 text-violet-300">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <p className="text-gray-400 text-xs">Questions</p>
                  <p className="text-white font-semibold">5</p>
                </div>
              </div>
            </motion.div>

            {/* What Will Be Measured Card - Changed to "Before you begin" */}
            <motion.div 
              className="w-full rounded-xl p-5 relative overflow-hidden"
              style={boxStyle}
              variants={itemVariants}
            >
              <h3 className="text-white text-xl font-semibold mb-4">
                Before you begin:
              </h3>
              
              <div className="space-y-2">
                <motion.div 
                  className="p-3 rounded-xl flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02]" 
                  style={innerBoxStyle}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <span className="text-white font-medium">🔇 Quiet Zone: Make sure you're in a quiet environment with minimal background noise.</span>
                </motion.div>
                
                <motion.div 
                  className="p-3 rounded-xl flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02]" 
                  style={innerBoxStyle}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <span className="text-white font-medium">💡 Good Lighting: Sit facing a light source to keep your face clearly visible.</span>
                </motion.div>
                
                <motion.div 
                  className="p-3 rounded-xl flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02]" 
                  style={innerBoxStyle}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <span className="text-white font-medium">🔌 Stable Connection: A strong internet connection helps avoid disruptions.</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </MovingGradientBackground>
  );
};

export default InterviewStartScreen;
