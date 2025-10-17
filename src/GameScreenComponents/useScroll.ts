import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  fetchMelodyFromPython,
  getDurationInMs,
  playMetronome,
  NoteCheck,
} from "./utilFunctions";
import { StaveNote } from "vexflow";
import { useQuery } from "@tanstack/react-query";

interface UseScrollProps {
  tempo: number;
  keySignature: string;
  timeSignature: string;
  rhythms: string;
  melody: { pitch: string; octave: number; duration: string }[];
  setMelody: React.Dispatch<
    React.SetStateAction<{ pitch: string; octave: number; duration: string }[]>
  >;
  notes: StaveNote[];
  noteElements: (SVGGElement | undefined)[];
  audioContext: AudioContext | undefined;
  viewportRef: React.RefObject<HTMLDivElement>;
  totalMeasures: number;
  setTotalMeasures: React.Dispatch<React.SetStateAction<number>>;
  bufferMeasures: number;
  activeNotes: NoteCheck[];
  setActiveNotes: React.Dispatch<React.SetStateAction<NoteCheck[]>>;
  countdownRef: React.RefObject<HTMLDivElement>;
  challengeOver: boolean;
  setMetronomeOn: React.Dispatch<React.SetStateAction<boolean>>;
  setResetMetronome: React.Dispatch<React.SetStateAction<number>>;
  minNote: string;
  maxNote: string;
}

export default function useScroll({
  tempo,
  keySignature,
  timeSignature,
  rhythms,
  melody,
  setMelody,
  notes,
  noteElements,
  audioContext,
  viewportRef,
  totalMeasures,
  setTotalMeasures,
  bufferMeasures,
  activeNotes,
  setActiveNotes,
  countdownRef,
  setMetronomeOn,
  setResetMetronome,
  minNote,
  maxNote,
}: UseScrollProps) {
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const nextNoteTimeRef = useRef<number | null>(); // Start time for next note to be scheduled
  const currentPlayingNoteIndexRef = useRef<number>(0); // Index of current note, used for checking distance from end
  const lookahead = 20; // How frequently to call scheduling function (ms)
  const schedulerIntervalRef = useRef<number | undefined>(); // ID for scheduling function timeout (to be cleared during pause)
  const nextScheduledNoteIndexRef = useRef<number>(0); // Index in notes for the next note to be scheduled
  const scheduledNotesRef = useRef<
    { id: number; index: number; time: number }[]
  >([]); // List of timeouts for scheduled scrolling
  const initialScrollRef = useRef<boolean>(true); // Boolean for initial scheduler call
  const activeNotesRef = useRef<NoteCheck[]>(activeNotes); // Ref to always hold the latest values
  const intervalTime = 60 / tempo;
  const lastMetronomeResetRef = useRef(0); // Number of notes since last metronome reset, reset after 100
  useEffect(() => {
    activeNotesRef.current = activeNotes;
  }, [activeNotes]);

  // Increases index of next scheduled note
  const nextNote = useCallback(() => {
    const currentNote = notes[nextScheduledNoteIndexRef.current];
    if (!currentNote || !nextNoteTimeRef.current) return;

    const noteDuration = getDurationInMs(currentNote, tempo) / 1000;
    nextNoteTimeRef.current += noteDuration;

    nextScheduledNoteIndexRef.current++;
  }, [notes]);

  // Schedules when to scroll to which notes by creating a timeout object
  const scheduleNote = useCallback(
    (noteIndex: number, time: number) => {
      if (!audioContext || !viewportRef.current) {
        return;
      }
      const noteElement = noteElements[noteIndex];
      if (noteElement) {
        const viewHeight = window.innerHeight / 100;
        const scaleFactor = (viewHeight * 50) / 200;
        const noteX = noteElement.getBBox().x * scaleFactor;
        const timeoutId = setTimeout(() => {
          requestAnimationFrame(() => {
            if (
              (audioContext.currentTime - startTimeRef.current) % intervalTime <
              0.05
            ) {
              if (lastMetronomeResetRef.current > 10) {
                setResetMetronome(
                  (prevResetMetronome) => prevResetMetronome + 1
                );
                lastMetronomeResetRef.current = 0;
              } else {
                lastMetronomeResetRef.current += 1;
              }
            } else {
              lastMetronomeResetRef.current += 1;
            }
            viewportRef.current!.scrollTo({
              left: noteX - ((10 / 4) * viewHeight) / scaleFactor,
              behavior: "smooth",
            });
            if (noteElement.getAttribute("fill") !== "green") {
              noteElement.setAttribute("fill", "purple");
              noteElement.setAttribute("stroke", "purple");
            }

            currentPlayingNoteIndexRef.current = noteIndex;

            scheduledNotesRef.current = scheduledNotesRef.current.filter(
              (note) => note.id !== timeoutId
            );
          });
        }, (time - audioContext.currentTime) * 1000);

        // Add this scheduled note to the array
        scheduledNotesRef.current = [
          ...scheduledNotesRef.current,
          { id: timeoutId, index: noteIndex, time: time },
        ];
        const note = notes[noteIndex];
        let noteDuration;
        noteDuration = getDurationInMs(note, tempo) / 1000;
        const tolerance = 0.2;
        const noteCheck = {
          note: note,
          startTime: time - tolerance,
          endTime: time + noteDuration + tolerance,
          isCorrect: false,
        };
        activeNotesRef.current = [...activeNotesRef.current, noteCheck];
        setActiveNotes([...activeNotesRef.current]);
      }
    },
    [notes, noteElements, audioContext]
  );

  // Clears all timeouts to scroll to notes
  const clearScheduledNotes = useCallback(() => {
    scheduledNotesRef.current.forEach((note) => clearTimeout(note.id));
    scheduledNotesRef.current = [];
  }, []);

  // Schedules notes based on next note to be scheduled's start time and current time
  // Creates interval for scheduler, adds a metronome on the first call.
  const scheduler = useCallback(() => {
    if (!audioContext) return;
    // Schedule all the notes in the buffer.
    while (
      nextNoteTimeRef.current &&
      nextScheduledNoteIndexRef.current < notes.length
    ) {
      scheduleNote(nextScheduledNoteIndexRef.current, nextNoteTimeRef.current);
      nextNote();
    }
  }, [notes, noteElements, audioContext]);

  useEffect(() => {
    if (!audioContext) return;
    if (isScrolling) {
      if (initialScrollRef.current) {
        initialScrollRef.current = false;
        requestAnimationFrame(() => {
          playMetronome(
            tempo,
            parseInt(timeSignature[0]),
            countdownRef,
            setMetronomeOn
          )
            .then(() => {
              startTimeRef.current = audioContext.currentTime;
              nextNoteTimeRef.current = startTimeRef.current;
              scheduler();
              schedulerIntervalRef.current = setInterval(scheduler, lookahead);
            })
            .catch((error) => {
              console.error("Error playing metronome:", error);
            });
        });
      } else {
        schedulerIntervalRef.current = setInterval(scheduler, lookahead);
      }
    }
    return () => {
      if (schedulerIntervalRef.current) {
        clearInterval(schedulerIntervalRef.current);
      }
    };
  }, [isScrolling, notes, noteElements]);

  // Resets all timeouts/variables through pauseScroll, then setIsScrolling to true
  const startScroll = useCallback(async () => {
    if (!isScrolling) {
      pauseScroll();
      setIsScrolling(true);
    }
  }, [isScrolling, audioContext]);

  // Resets all timeouts/variables to initial values. Clears all scheduled notes, stops scheduling notes, stops checkScroll
  const pauseScroll = useCallback(() => {
    setIsScrolling(false);
    clearInterval(schedulerIntervalRef.current);
    clearScheduledNotes();
  }, [clearScheduledNotes]);

  const [shouldFetchNewMelody, setShouldFetchNewMelody] = useState(false);

  // Fetch the new melody data
  const { data: newMelody } = useQuery({
    queryFn: async () => {
      return await fetchMelodyFromPython(
        bufferMeasures,
        keySignature,
        timeSignature.replace("/", "slash"),
        rhythms,
        minNote,
        maxNote
      );
    },
    queryKey: ["melody", bufferMeasures, keySignature, timeSignature, rhythms],
    enabled: shouldFetchNewMelody, // Only fetch if this is true
  });

  // Effect to handle newMelody updates
  useEffect(() => {
    if (newMelody && newMelody.length > 0) {
      setMelody((prevMelody) => [...prevMelody, ...newMelody]);
      setTotalMeasures((prevTotal) => prevTotal + bufferMeasures);
      setShouldFetchNewMelody(false); // Reset fetch trigger
    }
  }, [newMelody]);

  // Check scroll position and decide if more melody should be fetched
  const checkScroll = useCallback(() => {
    if (notes.length - currentPlayingNoteIndexRef.current < 20) {
      setShouldFetchNewMelody(true);
    }
  }, [notes]);

  useEffect(() => {
    let checkScrollInterval: number | undefined;
    if (isScrolling) {
      checkScrollInterval = setInterval(checkScroll, 1000);
    }
    return () => {
      if (checkScrollInterval) {
        clearInterval(checkScrollInterval);
      }
    };
  }, [isScrolling, keySignature, notes, melody, totalMeasures]);

  return { startScroll, pauseScroll };
}
