import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Metronome.css";

interface Metronome_2_props {
  metronomeOn: boolean;
  tempo: number;
  audioContext: AudioContext;
  initializedAudio: boolean;
  resetMetronome: number;
}

const Metronome_2: React.FC<Metronome_2_props> = ({
  metronomeOn,
  tempo,
  audioContext,
  initializedAudio,
  resetMetronome,
}) => {
  const [imageSrc, setImageSrc] = useState("images/metronome_left.svg");
  const isLeftRef = useRef(true);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  const loadLocalSound = useCallback(
    async (url: string, audioContext: AudioContext) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await audioContext.decodeAudioData(
          arrayBuffer
        );
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    },
    [initializedAudio, audioContext]
  );

  const tickMetronome = useCallback(() => {
    const currentTime = Date.now();
    const intervalTime = (60 / tempo) * 1000;
    // Only tick if enough time has passed since the last click to prevent double clicking (200 ms is good enough))
    if (
      audioBufferRef.current &&
      audioContext.state === "running" &&
      currentTime - lastClickTimeRef.current >= intervalTime - 200
    ) {
      lastClickTimeRef.current = currentTime;
      const source = audioContext.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContext.destination);
      source.start(0);
      isLeftRef.current = !isLeftRef.current;
      setImageSrc(
        isLeftRef.current
          ? "images/metronome_left.svg"
          : "images/metronome_right.svg"
      );
    }
  }, [audioContext, tempo]);

  useEffect(() => {
    if (initializedAudio && audioContext) {
      loadLocalSound("/sounds/metronome_click.mp3", audioContext);
    }
  }, [loadLocalSound, audioContext, initializedAudio]);

  useEffect(() => {
    if (metronomeOn && audioContext.state === "running") {
      const intervalTime = (60 / tempo) * 1000;
      tickMetronome();
      intervalRef.current = setInterval(() => {
        tickMetronome();
      }, intervalTime);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [metronomeOn, tempo, audioContext, tickMetronome, resetMetronome]);

  return <img src={imageSrc} alt="Metronome" className="metronome" />;
};

export default Metronome_2;
