import React, { useEffect, useRef, useState, useCallback } from "react";
import { centDifference, NoteCheck } from "./utilFunctions";
import { StaveNote } from "vexflow";
import { PitchDetector } from "pitchy";
type useAudioProps = {
  notes: Array<StaveNote>;
  noteElements: Array<SVGGElement>;
  activeNotes: Array<NoteCheck>;
  setActiveNotes: React.Dispatch<React.SetStateAction<NoteCheck[]>>;
  scoreElementRef: React.RefObject<HTMLDivElement>;
  setStrikes: React.Dispatch<React.SetStateAction<number>>;
  challengeOver: boolean;
  score: { total: number; correct: number };
  setScore: React.Dispatch<
    React.SetStateAction<{
      total: number;
      correct: number;
    }>
  >;
};
export default function useAudio({
  notes,
  noteElements,
  activeNotes,
  setActiveNotes,
  scoreElementRef,
  setStrikes,
  challengeOver,
  score,
  setScore,
}: useAudioProps) {
  const audioInputSizeRef = useRef(2048);
  const [audioContext, setAudioContext] = useState<AudioContext>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Float32Array>(
    new Float32Array(audioInputSizeRef.current)
  ); // Stores frequencyBinCount
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // Used to determine if program is ready for processAudio, by determining availability of above 3 refs
  const activeNotesRef = useRef<NoteCheck[]>(activeNotes); // Notes to be compared with audio input
  const scoreRef = useRef(score);
  const pitchyRef = useRef(
    PitchDetector.forFloat32Array(audioInputSizeRef.current)
  );

  const updateScore = useCallback(
    (isCorrect: boolean) => {
      scoreRef.current = {
        total: scoreRef.current.total + 1,
        correct: isCorrect
          ? scoreRef.current.correct + 1
          : scoreRef.current.correct,
      };
      if (!isCorrect) {
        setStrikes((prevStrikes) => prevStrikes + 1);
      }
      setScore(scoreRef.current);
    },
    [setStrikes]
  );

  useEffect(() => {
    activeNotesRef.current = activeNotes;
  }, [activeNotes]);

  const initializeAudio = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new window.AudioContext();
    const input = audioContextRef.current.createMediaStreamSource(stream);

    analyserRef.current = audioContextRef.current.createAnalyser();
    dataArrayRef.current = new Float32Array(audioInputSizeRef.current);

    input.connect(analyserRef.current);

    setIsProcessing(true);
    setAudioContext(audioContextRef.current);
  }, []);

  // Compare input audio to notes in activenotes, filter activenotes for overdue and correct notes
  const processAudio = useCallback(() => {
    if (
      !audioContext ||
      !analyserRef.current ||
      !isProcessing ||
      !scoreElementRef.current
    )
      return;
    analyserRef.current!.getFloatTimeDomainData(dataArrayRef.current);
    const [pitchyPitch, pitchyClarity] = pitchyRef.current.findPitch(
      dataArrayRef.current,
      audioContextRef.current!.sampleRate
    );
    const currentFrequency = pitchyPitch;
    const currentTime = audioContext.currentTime;
    let liveNoteNames = "";
    const newActiveNotes = activeNotesRef.current.filter((noteCheck) => {
      if (
        currentTime >= noteCheck.startTime &&
        currentTime <= noteCheck.endTime
      ) {
        liveNoteNames =
          liveNoteNames +
          "\n" +
          noteCheck.note.keys[0] +
          "\nStart time: " +
          noteCheck.startTime +
          "\nEnd Time: " +
          noteCheck.endTime +
          "\nError: " +
          centDifference(currentFrequency, noteCheck.note.keys[0]);
        if (
          centDifference(currentFrequency, noteCheck.note.keys[0]) < 15 &&
          pitchyClarity > 0.5
        ) {
          noteCheck.isCorrect = true;
          if (noteElements[notes.indexOf(noteCheck.note)]) {
            noteElements[notes.indexOf(noteCheck.note)].setAttribute(
              "fill",
              "green"
            );
            noteElements[notes.indexOf(noteCheck.note)].setAttribute(
              "stroke",
              "green"
            );
          }
          updateScore(true);
          scoreElementRef.current!.innerText = `${scoreRef.current.correct}/${scoreRef.current.total}`;
          return false; // Remove from active notes
        }
        return true; // Keep checking
      } else if (currentTime > noteCheck.endTime) {
        if (noteElements[notes.indexOf(noteCheck.note)]) {
          noteElements[notes.indexOf(noteCheck.note)].setAttribute(
            "fill",
            "red"
          );
          noteElements[notes.indexOf(noteCheck.note)].setAttribute(
            "stroke",
            "red"
          );
        }
        if (!noteCheck.isCorrect) {
          updateScore(false);
        }
        scoreElementRef.current!.innerText = `${scoreRef.current.correct}/${scoreRef.current.total}`;
        return false; // Remove from active notes
      }
      scoreElementRef.current!.innerText = `${scoreRef.current.correct}/${scoreRef.current.total}`;
      return true; // Keep in queue
    });
    activeNotesRef.current = newActiveNotes;
    setActiveNotes(newActiveNotes);
  }, [isProcessing, noteElements, notes]);
  // Use ref/state for activenotes for real-time updating, use state for notes/noteelements since a bit of lag is ok.

  // Process audio, refresh interval so that processAudio doesn't use outdated values
  useEffect(() => {
    let intervalId: number | undefined;
    if (isProcessing) {
      intervalId = setInterval(processAudio, 20);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isProcessing, noteElements, notes]);

  // Stop processing audio once challengeOver
  useEffect(() => {
    if (challengeOver) {
      setIsProcessing(false);
    }
  }, [challengeOver]);

  return {
    audioContext: audioContext,
    initializeAudio,
  };
}
