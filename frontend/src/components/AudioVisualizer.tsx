import React, { useEffect, useState, useRef } from "react";

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  stream,
  isActive,
}) => {
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0]);
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
      setAudioLevels([0, 0, 0, 0, 0]);
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

        // Calculate audio levels for 5 frequency bands
        const bandSize = Math.floor(bufferLength / 5);
        const levels = [];

        for (let i = 0; i < 5; i++) {
          const start = i * bandSize;
          const end = start + bandSize;
          let sum = 0;

          for (let j = start; j < end; j++) {
            sum += dataArray[j];
          }

          const average = sum / bandSize;
          // Normalize to 0-1 range and apply some smoothing
          levels.push(Math.min(average / 255, 1));
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
    <div className="flex items-center justify-center space-x-2">
      {audioLevels.map((level, i) => (
        <div
          key={i}
          className="w-1.5 bg-green-400 rounded transition-all duration-100"
          style={{
            height: Math.max(level * 32 + 8, 8),
            opacity: isActive ? 0.8 + level * 0.2 : 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
