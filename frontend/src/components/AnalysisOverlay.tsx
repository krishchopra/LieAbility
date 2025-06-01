import React, { useRef, useEffect, useState } from "react";
import { FacialAnalysis } from "@/services/AnalysisService";

interface AnalysisOverlayProps {
  facialAnalysis: FacialAnalysis | null;
  speechRecognition: SpeechRecognition | null;
  isAnalyzing: boolean;
  showDetailed?: boolean;
}

const AnalysisOverlay: React.FC<AnalysisOverlayProps> = ({
  facialAnalysis,
  speechRecognition,
  isAnalyzing,
  showDetailed = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Throttled authenticity state - updates every 2 seconds
  const [throttledAuthenticity, setThrottledAuthenticity] = useState<
    number | null
  >(null);
  const lastAuthenticityUpdate = useRef<number>(0);

  // Throttle authenticity updates to every 1.5 seconds
  useEffect(() => {
    if (facialAnalysis?.microExpressions?.authenticity !== undefined) {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastAuthenticityUpdate.current;

      if (timeSinceLastUpdate >= 1500 || throttledAuthenticity === null) {
        setThrottledAuthenticity(facialAnalysis.microExpressions.authenticity);
        lastAuthenticityUpdate.current = now;
      }
    }
  }, [facialAnalysis?.microExpressions?.authenticity, throttledAuthenticity]);

  // Draw facial landmarks and analysis indicators
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isAnalyzing) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size to match video container
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }

    // Draw facial analysis indicators
    if (facialAnalysis) {
      drawFacialLandmarks(
        ctx,
        canvas.width,
        canvas.height,
        facialAnalysis,
        throttledAuthenticity
      );
    } else {
      drawSearchingIndicator(ctx, canvas.width, canvas.height);
    }

    // Draw speech recognition indicator
    if (speechRecognition) {
      drawSpeechIndicator(ctx, canvas.width, canvas.height, true);
    } else {
      drawSpeechIndicator(ctx, canvas.width, canvas.height, false);
    }
  }, [facialAnalysis, speechRecognition, isAnalyzing, throttledAuthenticity]);

  const drawFacialLandmarks = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    analysis: FacialAnalysis,
    authenticityScore: number | null = null
  ) => {
    if (!analysis.landmarks || !analysis.landmarks.landmarks.length) {
      return;
    }

    const landmarks = analysis.landmarks.landmarks;

    // COORDINATE SCALING: MediaPipe coordinates need to be scaled to canvas size
    const videoElement = document.querySelector("video") as HTMLVideoElement;
    // scaleX and scaleY are now primarily for the "areNormalized = false" branch,
    // which means coordinates are already in pixels of the native video.
    let scaleX = 1;
    let scaleY = 1;
    // offsetX and offsetY are not generally needed if CSS handles object-fit: cover correctly
    // and the canvas is perfectly overlaid. They were part of a previous letterbox/pillarbox attempt.
    let offsetX = 0;
    let offsetY = 0;

    if (videoElement) {
      const nativeWidth = videoElement.videoWidth || 1280;
      const nativeHeight = videoElement.videoHeight || 720;
      const displayWidth = width; // Canvas width
      const displayHeight = height; // Canvas height

      // These scales are for converting native video pixel coords to canvas display pixel coords.
      scaleX = displayWidth / nativeWidth;
      scaleY = displayHeight / nativeHeight;

      // The letterboxing/pillarboxing logic here is REMOVED.
      // It assumes the canvas *is* the video display area, and CSS object-fit handles the aspect ratio.
      // If coordinates are normalized (0-1), they are scaled directly to canvas width/height.
      // If coordinates are pixels (from native video), they are scaled using scaleX/scaleY above.
    }

    // Function to scale landmark coordinates with proper transformation
    const scaleLandmark = (point: number[]): [number, number] => {
      if (!point || point.length < 2) return [0, 0];

      let x = point[0];
      let y = point[1];

      // Check if coordinates are normalized (0-1) or already in pixels
      const areNormalized = x <= 1 && y <= 1 && x >= 0 && y >= 0;

      if (areNormalized) {
        // MediaPipe normalized coordinates (0-1) - convert to canvas pixels
        x = x * width;
        y = y * height;
      } else {
        // Already in pixel coordinates - scale to canvas size
        x = x * scaleX + offsetX;
        y = y * scaleY + offsetY;
      }

      // Account for video mirroring (scaleX(-1) in CSS)
      x = width - x;

      return [x, y];
    };

    // Helper function to draw a connected path of landmarks
    const drawLandmarkPath = (
      ctx: CanvasRenderingContext2D,
      points: number[][],
      isClosed: boolean = false,
      strokeStyle: string = "#ffffff88", // Increased opacity for mesh lines
      lineWidth: number = 1.5 // Slightly thicker lines for mesh
    ) => {
      if (points.length < 2) return;

      const scaledPoints = points.map(scaleLandmark);

      ctx.beginPath();
      ctx.moveTo(scaledPoints[0][0], scaledPoints[0][1]);
      for (let i = 1; i < scaledPoints.length; i++) {
        ctx.lineTo(scaledPoints[i][0], scaledPoints[i][1]);
      }
      if (isClosed) {
        ctx.closePath();
      }
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    // MediaPipe landmark indices for different facial features
    // Sourced from MediaPipe documentation/examples
    const MESH_LANDMARK_GROUPS = {
      lipsOuter: [
        61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17,
        84, 181, 91, 146,
      ],
      lipsInner: [
        78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317,
        14, 87, 178, 88, 95,
      ],
      leftEye: [
        33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161,
        246,
      ],
      rightEye: [
        362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385,
        384, 398,
      ],
      leftEyebrow: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
      rightEyebrow: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],
      faceOval: [
        // Simplified - check MediaPipe official for exact full oval
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
        379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234,
        127, 162, 21, 54, 103, 67, 109,
      ],
      nose: [
        168,
        6,
        197,
        195,
        5,
        4,
        1,
        2,
        98,
        327, // Bridge and tip
      ],
      // Add more groups as desired (e.g., iris)
    };

    // SIMPLIFIED APPROACH: Use only key landmarks like the Python code
    if (landmarks.length >= 400) {
      // Key landmarks for head pose (same as Python code: 1, 9, 57, 130, 287, 359)
      const keyLandmarkIndices = [1, 9, 57, 130, 287, 359];
      const keyPoints = keyLandmarkIndices
        .map((i) => landmarks[i])
        .filter((p) => p);

      if (keyPoints.length >= 6) {
        // Draw clean key points
        ctx.fillStyle = "#00ff88";
        ctx.shadowColor = "#00ff88";
        ctx.shadowBlur = 8;

        keyPoints.forEach((point, index) => {
          const [scaledX, scaledY] = scaleLandmark(point);
          ctx.beginPath();
          ctx.arc(scaledX, scaledY, index < 2 ? 6 : 4, 0, 2 * Math.PI); // Adjusted sizes
          ctx.fill();
        });

        // Draw simple face outline connecting key points
        ctx.strokeStyle = "#00ff8866";
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 3;

        if (keyPoints.length >= 6) {
          const [nose_tip, chin, left_cheek, left_eye, right_cheek, right_eye] =
            keyPoints.map(scaleLandmark);

          // Simple face outline
          ctx.beginPath();
          // Connect points to form a simple face shape
          ctx.moveTo(left_eye[0], left_eye[1]);
          ctx.lineTo(left_cheek[0], left_cheek[1]);
          ctx.lineTo(chin[0], chin[1]);
          ctx.lineTo(right_cheek[0], right_cheek[1]);
          ctx.lineTo(right_eye[0], right_eye[1]);
          ctx.stroke();

          // Add center line for head orientation
          ctx.strokeStyle = "#00ff88aa";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(nose_tip[0], nose_tip[1]);
          ctx.lineTo(chin[0], chin[1]);
          ctx.stroke();

          // Add eye line
          ctx.beginPath();
          ctx.moveTo(left_eye[0], left_eye[1]);
          ctx.lineTo(right_eye[0], right_eye[1]);
          ctx.stroke();
        }

        // Add head pose indicator
        if (keyPoints.length >= 2) {
          const [nose_tip, chin] = keyPoints.slice(0, 2).map(scaleLandmark);

          // Calculate head direction
          const centerX = (nose_tip[0] + chin[0]) / 2;
          const centerY = (nose_tip[1] + chin[1]) / 2;

          // Draw head direction arrow
          ctx.strokeStyle = "#ffaa00";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#ffaa00";
          ctx.shadowBlur = 8;

          const arrowLength = 40;
          const headDirection = Math.atan2(
            chin[1] - nose_tip[1],
            chin[0] - nose_tip[0]
          );
          const arrowEndX = centerX + Math.cos(headDirection) * arrowLength;
          const arrowEndY = centerY + Math.sin(headDirection) * arrowLength;

          // Main arrow
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(arrowEndX, arrowEndY);
          ctx.stroke();

          // Arrow head
          const arrowHeadSize = 8;
          ctx.beginPath();
          ctx.moveTo(arrowEndX, arrowEndY);
          ctx.lineTo(
            arrowEndX - arrowHeadSize * Math.cos(headDirection - Math.PI / 6),
            arrowEndY - arrowHeadSize * Math.sin(headDirection - Math.PI / 6)
          );
          ctx.moveTo(arrowEndX, arrowEndY);
          ctx.lineTo(
            arrowEndX - arrowHeadSize * Math.cos(headDirection + Math.PI / 6),
            arrowEndY - arrowHeadSize * Math.sin(headDirection + Math.PI / 6)
          );
          ctx.stroke();
        }

        // Draw subtle mesh lines using the full landmark set
        ctx.shadowBlur = 0; // No shadow for subtle mesh lines

        // Lips
        drawLandmarkPath(
          ctx,
          MESH_LANDMARK_GROUPS.lipsOuter.map((i) => landmarks[i]),
          true
        );
        drawLandmarkPath(
          ctx,
          MESH_LANDMARK_GROUPS.lipsInner.map((i) => landmarks[i]),
          true
        );

        // Eyes (outline)
        drawLandmarkPath(
          ctx,
          MESH_LANDMARK_GROUPS.leftEye.map((i) => landmarks[i]),
          true
        );
        drawLandmarkPath(
          ctx,
          MESH_LANDMARK_GROUPS.rightEye.map((i) => landmarks[i]),
          true
        );

        // Eyebrows
        drawLandmarkPath(
          ctx,
          MESH_LANDMARK_GROUPS.leftEyebrow.map((i) => landmarks[i]),
          false
        );
        drawLandmarkPath(
          ctx,
          MESH_LANDMARK_GROUPS.rightEyebrow.map((i) => landmarks[i]),
          false
        );

        // Nose
        drawLandmarkPath(
          ctx,
          MESH_LANDMARK_GROUPS.nose.map((i) => landmarks[i]),
          false
        );

        // A simplified face oval - can be expanded if desired
        drawLandmarkPath(
          ctx,
          MESH_LANDMARK_GROUPS.faceOval.map((i) => landmarks[i]),
          true,
          "#ffffff55", // More opaque oval
          1.5 // Consistent line width
        );
      }
    } else if (landmarks.length >= 6) {
      // Fallback for fewer landmarks - draw all as key points
      ctx.fillStyle = "#00ff88";
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 6;

      landmarks.forEach((point, index) => {
        const [scaledX, scaledY] = scaleLandmark(point);
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, index < 2 ? 4 : 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Simple connections for basic landmarks
      if (landmarks.length >= 6) {
        const scaledLandmarks = landmarks.map(scaleLandmark);
        ctx.strokeStyle = "#00ff8866";
        ctx.lineWidth = 1.5;

        // Connect first two points (likely eyes)
        ctx.beginPath();
        ctx.moveTo(scaledLandmarks[0][0], scaledLandmarks[0][1]);
        ctx.lineTo(scaledLandmarks[1][0], scaledLandmarks[1][1]);
        ctx.stroke();

        // Connect to nose if available
        if (scaledLandmarks[2]) {
          ctx.beginPath();
          ctx.moveTo(
            (scaledLandmarks[0][0] + scaledLandmarks[1][0]) / 2,
            (scaledLandmarks[0][1] + scaledLandmarks[1][1]) / 2
          );
          ctx.lineTo(scaledLandmarks[2][0], scaledLandmarks[2][1]);
          ctx.stroke();
        }
      }
    }

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const drawSearchingIndicator = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const centerX = width * 0.5;
    const centerY = height * 0.45;
    const time = Date.now() * 0.005;

    // Animated scanning effect
    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 10;

    // Rotating scan lines
    for (let i = 0; i < 3; i++) {
      const angle = time + (i * Math.PI * 2) / 3;
      const radius = 80 + Math.sin(time * 2) * 20;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, angle, angle + 0.5);
      ctx.stroke();
    }

    // Center dot
    ctx.fillStyle = "#ffaa00";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const drawSpeechIndicator = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isActive: boolean
  ) => {
    const x = 30;
    const y = height - 40;
    const time = Date.now() * 0.01;

    if (isActive) {
      // Active microphone with sound waves
      ctx.fillStyle = "#00aaff";
      ctx.shadowColor = "#00aaff";
      ctx.shadowBlur = 6;

      // Microphone icon (simplified)
      ctx.fillRect(x, y - 10, 6, 20);
      ctx.fillRect(x - 3, y + 10, 12, 4);

      // Animated sound waves
      for (let i = 1; i <= 3; i++) {
        ctx.strokeStyle = "#00aaff";
        ctx.lineWidth = 1 + Math.sin(time + i) * 0.5;
        ctx.beginPath();
        ctx.arc(x + 3, y, 8 + i * 6, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
      }
    } else {
      // Inactive microphone
      ctx.fillStyle = "#666666";
      ctx.shadowBlur = 0;
      ctx.fillRect(x, y - 10, 6, 20);
      ctx.fillRect(x - 3, y + 10, 12, 4);
    }

    ctx.shadowBlur = 0;
  };

  if (!isAnalyzing) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Canvas for drawing landmarks */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ transform: "scaleX(-1)" }} // Mirror to match video
      />

      {/* Minimal status indicators in corners - no emotion display */}
      <div className="absolute top-16 left-4 flex space-x-2">
        {facialAnalysis && (
          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs border border-green-500/50 backdrop-blur-sm">
            Face: DETECTED
          </div>
        )}
      </div>

      {/* Speech indicator positioned separately to avoid REC collision */}
      {speechRecognition && (
        <div className="absolute top-4 left-20 flex space-x-2">
          <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/50 backdrop-blur-sm animate-pulse">
            🎤 Listening
          </div>
        </div>
      )}

      {/* Authenticity indicator removed - was too distracting */}

      {/* Error or loading states */}
      {!facialAnalysis && isAnalyzing && (
        <div className="absolute bottom-4 left-4">
          <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-500/50 backdrop-blur-sm">
            Searching for face...
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisOverlay;
