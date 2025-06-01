import React, { useEffect, useState, useRef } from "react";

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  stream,
  isActive,
}) => {
  const [audioLevels, setAudioLevels] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !isActive) {
      // Stop audio analysis
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAudioLevels([0, 0, 0, 0, 0, 0, 0]);
      return;
    }

    // Set up audio analysis
    try {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevels = () => {
        if (!analyserRef.current || !isActive) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate audio levels for 7 frequency bands
        const numBands = 7;
        const bandSize = Math.floor(bufferLength / numBands);
        const levels = [];

        for (let i = 0; i < numBands; i++) {
          const start = i * bandSize;
          const end = Math.min(start + bandSize, bufferLength);
          let sum = 0;

          for (let j = start; j < end; j++) {
            sum += dataArray[j] || 0;
          }

          const average = sum / Math.max(end - start, 1);
          // Normalize to 0-1 range and apply some smoothing
          const normalizedLevel = Math.min(Math.max(average / 255, 0), 1);
          levels.push(isNaN(normalizedLevel) ? 0 : normalizedLevel);
        }

        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
      };

      updateAudioLevels();
    } catch (error) {
      console.error("Audio analysis setup failed:", error);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream, isActive]);

  return (
    <div className="flex items-center justify-center space-x-1.5">
      {audioLevels.map((level, i) => (
        <div
          key={i}
          className="w-1.5 bg-gradient-to-t from-green-400 to-cyan-300 rounded-full transition-all duration-75"
          style={{
            height: Math.max((level || 0) * 40 + 4, 4), // Ensure no NaN values
            opacity: isActive ? 0.7 + (level || 0) * 0.3 : 0.3,
            transform: `scaleY(${1 + (level || 0) * 0.2})`, // Add safety check for level
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
