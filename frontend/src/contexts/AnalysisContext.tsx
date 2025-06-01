import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  analysisService,
  AuthenticityScore,
  FacialAnalysis,
} from "@/services/AnalysisService";

interface AnalysisContextType {
  isInitialized: boolean;
  isAnalyzing: boolean;
  currentFacialAnalysis: FacialAnalysis | null;
  speechRecognition: SpeechRecognition | null;
  finalScore: AuthenticityScore | null;
  initializeAnalysis: () => Promise<boolean>;
  startAnalysis: () => Promise<void>;
  stopAnalysis: () => void;
  analyzeFace: (videoElement: HTMLVideoElement) => Promise<void>;
  generateScore: (question: string) => AuthenticityScore;
  resetAnalysis: () => void;
  resetForNewQuestion: () => void;
  error: string | null;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

interface AnalysisProviderProps {
  children: ReactNode;
}

// Properly named component for Fast Refresh
const AnalysisProvider = ({ children }: AnalysisProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentFacialAnalysis, setCurrentFacialAnalysis] =
    useState<FacialAnalysis | null>(null);
  const [speechRecognition, setSpeechRecognition] =
    useState<SpeechRecognition | null>(null);
  const [finalScore, setFinalScore] = useState<AuthenticityScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use ref to avoid stale closure issues
  const isAnalyzingRef = useRef(isAnalyzing);

  // Keep ref in sync with state
  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing;
  }, [isAnalyzing]);

  // Add logging for isAnalyzing state changes with more detail
  useEffect(() => {
    console.log("🧠 📊 isAnalyzing state changed to:", isAnalyzing);
    console.log(
      "🧠 📊 Stack trace for isAnalyzing change:",
      new Error().stack?.split("\n").slice(1, 4)
    );
  }, [isAnalyzing]);

  // Track when isAnalyzing becomes true for verification
  useEffect(() => {
    if (isAnalyzing) {
      console.log("🧠 ✅ VERIFICATION: isAnalyzing is now TRUE and active");
      console.log("🧠 ✅ Current context state:", {
        isInitialized,
        isAnalyzing,
        currentFacialAnalysis: !!currentFacialAnalysis,
        speechRecognition: !!speechRecognition,
      });
    } else {
      console.log("🧠 ❌ WARNING: isAnalyzing is FALSE");
    }
  }, [isAnalyzing, isInitialized, currentFacialAnalysis, speechRecognition]);

  // Initialize analysis service
  const initializeAnalysis = async (): Promise<boolean> => {
    try {
      setError(null);
      console.log("🧠 Initializing analysis service...");

      await analysisService.initialize();
      setIsInitialized(true);
      return true;
    } catch (err) {
      console.error("🧠 Analysis initialization error:", err);
      setError("Analysis service initialization failed");
      setIsInitialized(false);
      return false;
    }
  };

  // Start comprehensive analysis (speech + facial)
  const startAnalysis = async (): Promise<void> => {
    try {
      console.log("🧠 🚀 startAnalysis called - current state:", {
        isInitialized,
        isAnalyzing,
      });

      if (!isInitialized) {
        console.log("🧠 🚀 Not initialized, initializing first...");
        const initialized = await initializeAnalysis();
        if (!initialized) {
          throw new Error("Failed to initialize analysis service");
        }
      }

      console.log("🧠 🚀 Setting isAnalyzing to TRUE");
      setIsAnalyzing(true);
      setError(null);

      // Start speech recognition - don't fail if it doesn't work
      try {
        console.log("🧠 🎤 Attempting to start speech recognition...");
        await analysisService.startSpeechRecognition();

        // Set up speech analysis callback
        analysisService.onSpeechAnalysis((analysis) => {
          console.log("🎤 📊 Speech analysis received:", analysis);
        });

        console.log("🧠 🎤 Speech recognition started successfully");
        setSpeechRecognition(true as any); // Set a truthy value to indicate it's active
      } catch (speechError) {
        console.error("🧠 🎤 Speech recognition failed:", speechError);
        // Continue with facial analysis only
        setSpeechRecognition(null);
      }

      console.log(
        "🧠 ✅ Analysis started successfully - isAnalyzing should remain true"
      );
    } catch (err) {
      console.error("🧠 Failed to start analysis:", err);
      console.error(
        "🧠 ❌ ERROR: Setting isAnalyzing to FALSE due to error:",
        err
      );
      setError("Failed to start analysis");
      setIsAnalyzing(false);
    }
  };

  // Stop analysis
  const stopAnalysis = (): void => {
    try {
      console.log("🧠 ⏹️ stopAnalysis called - setting isAnalyzing to false");
      console.log(
        "🧠 ⏹️ stopAnalysis called from:",
        new Error().stack?.split("\n").slice(1, 5)
      );
      setIsAnalyzing(false);

      // Stop speech recognition
      console.log("🧠 🎤 Stopping speech recognition");
      analysisService.stopSpeechRecognition();
      setSpeechRecognition(null);

      console.log("🧠 ✅ Analysis stopped");
    } catch (err) {
      console.error("🧠 Error stopping analysis:", err);
    }
  };

  // Analyze facial expressions from video element
  const analyzeFace = async (videoElement: HTMLVideoElement): Promise<void> => {
    const currentIsAnalyzing = isAnalyzingRef.current; // Read from ref, not state

    console.log(
      "🧠 📹 analyzeFace called - initialized:",
      isInitialized,
      "analyzing (state):",
      isAnalyzing,
      "analyzing (ref):",
      currentIsAnalyzing
    );

    if (!isInitialized) {
      console.log("🧠 📹 Skipping analyzeFace - not initialized");
      return;
    }

    if (!currentIsAnalyzing) {
      console.log(
        "🧠 📹 Skipping analyzeFace - not analyzing (using ref value)"
      );
      return;
    }

    try {
      console.log("🧠 📹 ✅ PROCEEDING with facial analysis using ref value!");
      console.log("🧠 📹 Calling analysisService.analyzeFacialExpressions...");
      const analysis = await analysisService.analyzeFacialExpressions(
        videoElement
      );
      console.log(
        "🧠 📹 Facial analysis result:",
        analysis ? "SUCCESS" : "NO_FACES"
      );
      setCurrentFacialAnalysis(analysis);
    } catch (err) {
      console.error("🧠 Facial analysis error:", err);
      // Don't set error for individual frame failures
    }
  };

  // Generate final authenticity score
  const generateScore = (question: string): AuthenticityScore => {
    const score = analysisService.generateAuthenticityScore(question);
    setFinalScore(score);
    return score;
  };

  // Reset all analysis data
  const resetAnalysis = (): void => {
    stopAnalysis();
    analysisService.resetAnalysis();
    setCurrentFacialAnalysis(null);
    setFinalScore(null);
    setError(null);
    console.log("🧠 Analysis context reset");
  };

  // Reset for new question (keeps initialization)
  const resetForNewQuestion = (): void => {
    analysisService.resetAnalysis();
    setCurrentFacialAnalysis(null);
    // Don't change isAnalyzing state - keep analysis running
    console.log(
      "🧠 Analysis context reset for new question - keeping analysis running"
    );
  };

  // Initialize on mount
  useEffect(() => {
    initializeAnalysis();
  }, []);

  // Cleanup on unmount only - don't cleanup based on speechRecognition changes
  useEffect(() => {
    return () => {
      console.log("🧠 🧹 Component unmounting, cleaning up...");
      stopAnalysis();
    };
  }, []); // Empty dependency array - only run on unmount

  const value: AnalysisContextType = {
    isInitialized,
    isAnalyzing,
    currentFacialAnalysis,
    speechRecognition,
    finalScore,
    initializeAnalysis,
    startAnalysis,
    stopAnalysis,
    analyzeFace,
    generateScore,
    resetAnalysis,
    resetForNewQuestion,
    error,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

// Properly named hook for Fast Refresh
const useAnalysis = (): AnalysisContextType => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
};

// Export for Fast Refresh compatibility
export { AnalysisProvider, useAnalysis };
