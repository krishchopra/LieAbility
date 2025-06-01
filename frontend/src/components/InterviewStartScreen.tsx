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
  onTestCamera: () => void;
}

const InterviewStartScreen = ({ onStart, onTestCamera }: InterviewStartScreenProps) => {
  const { hasPermission, error: cameraError } = useCamera();

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
          className="flex flex-col items-center space-y-3 mb-6"
          variants={itemVariants}
        >
          <AnimatedEye size={90} />
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight flex justify-center">
              <span className="bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                Lie
              </span>
              <span className="text-[#8CA1D6] drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                Ability
              </span>
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
          <div className="flex items-center gap-5">
            <div className="bg-transparent flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-white text-lg font-medium leading-relaxed">
              You won't be able to pause or redo this once started.
            </p>
          </div>
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
            onClick={onTestCamera}
            color="accent"
            className="min-w-[200px] px-8 py-3 text-lg rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 "
          >
            <span className="text-white drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">Test Mic and Camera</span>
          </NeumorphicButton>
        </motion.div>
      </motion.div>
    </MovingGradientBackground>
  );
};

export default InterviewStartScreen;
