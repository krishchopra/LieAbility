import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

interface CameraContextType {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  isStreaming: boolean;
  hasPermission: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      setError(null);
      console.log("🎥 [Context] Starting camera...");

      // If we already have a stream, don't request again
      if (stream && isStreaming) {
        console.log("🎥 [Context] Camera already running");
        return;
      }

      // Request camera permission and get stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      console.log("🎥 [Context] Camera stream acquired:", mediaStream);
      setStream(mediaStream);
      setHasPermission(true);
      setIsStreaming(true);

      // Attach stream to video element
      if (videoRef.current) {
        console.log("🎥 [Context] Attaching stream to video element");
        videoRef.current.srcObject = mediaStream;

        try {
          await videoRef.current.play();
          console.log("🎥 [Context] Video playback started successfully");
        } catch (playError) {
          console.warn(
            "🎥 [Context] Video autoplay failed (this is normal in some browsers):",
            playError
          );
        }
      }
    } catch (err) {
      console.error("🎥 [Context] Camera access error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError(
            "Camera access denied. Please allow camera permission and try again."
          );
        } else if (err.name === "NotFoundError") {
          setError("No camera found. Please connect a camera and try again.");
        } else if (err.name === "NotReadableError") {
          setError("Camera is already in use by another application.");
        } else {
          setError(
            "Failed to access camera. Please check your camera settings."
          );
        }
      } else {
        setError("An unknown error occurred while accessing the camera.");
      }
      setHasPermission(false);
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    console.log("🎥 [Context] Stopping camera...");
    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log("🎥 [Context] Stopping track:", track.kind);
        track.stop();
      });
      setStream(null);
      setIsStreaming(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Effect to handle stream changes
  useEffect(() => {
    if (stream && videoRef.current && isStreaming) {
      console.log("🎥 [Context] Updating video element with new stream");
      videoRef.current.srcObject = stream;

      videoRef.current.play().catch((error) => {
        console.warn("🎥 [Context] Video play failed:", error);
      });
    }
  }, [stream, isStreaming]);

  // Check if browser supports camera access
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera access is not supported in this browser.");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🎥 [Context] Cleaning up camera on unmount...");
      stopCamera();
    };
  }, []);

  return (
    <CameraContext.Provider
      value={{
        videoRef,
        stream,
        isStreaming,
        hasPermission,
        error,
        startCamera,
        stopCamera,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
};
