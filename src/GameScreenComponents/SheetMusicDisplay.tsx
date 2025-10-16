import React, { useEffect, useRef, useCallback } from "react";
import { StaveNote, Vex, Renderer, RenderContext } from "vexflow";
import { durationToNumber, dotted } from "./utilFunctions";

interface SheetMusicDisplayProps {
  keySignature: string;
  timeSignature: string;
  notes: StaveNote[];
  setNotes: React.Dispatch<React.SetStateAction<StaveNote[]>>;
  setNoteElements: React.Dispatch<React.SetStateAction<SVGGElement[]>>;
  melody: { pitch: string; octave: number; duration: string }[];
  sheetMusicDivRef: React.RefObject<HTMLDivElement>;
  lastRenderedMeasureRef: React.MutableRefObject<number>;
  totalMeasures: number;
  initialRender: boolean;
  setInitialRender: React.Dispatch<React.SetStateAction<boolean>>;
  clef: string;
}

const keySignatures = {
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  "F#": 6,
  "C#": 7,
  F: -1,
  Bb: -2,
  Eb: -3,
  Ab: -4,
  Db: -5,
  Gb: -6,
  Cb: -7,
};

function SheetMusicDisplay({
  keySignature,
  timeSignature,
  notes,
  setNotes,
  setNoteElements,
  melody,
  sheetMusicDivRef,
  lastRenderedMeasureRef,
  totalMeasures,
  initialRender,
  setInitialRender,
  clef,
}: SheetMusicDisplayProps) {
  const VF = Vex.Flow;
  const currentXRef = useRef<number>(0); // Current X value to start rendering subsequent measures
  const renderedNoteIndexRef = useRef<number>(0);
  const renderer = useRef<Renderer | undefined>();
  const context = useRef<RenderContext | undefined>();
  // Scale the renderer to fit two measures at a time, requires x and y parameters to be equal
  const viewHeight = window.innerHeight / 100;
  const scaleFactor = (viewHeight * 50) / 200;

  // Detects change in melody and update notes accordingly
  const melodyToNotes = useCallback(() => {
    setNotes((prevNotes) => {
      let newMelody = melody.slice(prevNotes.length);
      let newNotes = newMelody.map((note) => {
        let isDotted = false;
        let duration = note.duration;

        let staveNote = new VF.StaveNote({
          clef: clef,
          keys: [`${note.pitch}/${note.octave}`],
          duration: String(duration),
        });

        if (String(duration).endsWith("d")) {
          isDotted = true;
        }

        if (isDotted) {
          staveNote = dotted(staveNote);
        }

        return staveNote;
      });
      return [...prevNotes, ...newNotes];
    });
  }, [melody]);

  const initializeVF = useCallback(() => {
    const div = sheetMusicDivRef.current;
    if (!div) return;

    if (!renderer.current) {
      const newRenderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
      const newContext = newRenderer.getContext();
      renderer.current = newRenderer;
      context.current = newContext;
    }
  }, []);

  useEffect(() => {
    initializeVF();
  }, []);

  // Updates notes as melody changes
  useEffect(() => {
    if (melody.length > 0) {
      melodyToNotes();
    }
  }, [melody]);

  // Renders notes by starting from renderedNoteIndex until the end of the updated melody (endMeasure)
  // Scale factor: 200 px = 50 vh, or 4px = 1 vh
  const renderNotes = useCallback(
    (startMeasure: number, endMeasure: number) => {
      const beatsPerMeasure = parseInt(timeSignature);
      const viewHeight = window.innerHeight / 100;
      const measureWidth = 100 * viewHeight;
      const firstMeasureSpace = 50 * viewHeight;
      const measureHeight = 50 * viewHeight;
      if (renderer.current === undefined || context.current === undefined) {
        return;
      }
      let hasFirstMeasure = false;
      // Rescale to default
      if (!initialRender) {
        context.current.scale(1 / scaleFactor, 1 / scaleFactor);
      }
      renderer.current.resize(
        endMeasure * measureWidth + firstMeasureSpace,
        measureHeight
      );
      context.current.scale(scaleFactor, scaleFactor);
      let staves = [];
      const Beam = VF.Beam;
      let measureRenderIndex = startMeasure;
      // Create staves starting from currentXRef (avoids recreating old staves)
      while (measureRenderIndex < endMeasure) {
        let stave;
        if (measureRenderIndex === 0 && currentXRef.current === 0) {
          hasFirstMeasure = true;
          // Make first stave firstMeasureSpace + measureWidth, others measureWidth
          let firstMeasureWidth = firstMeasureSpace + measureWidth;
          stave = new VF.Stave(
            currentXRef.current,
            40,
            firstMeasureWidth / scaleFactor
          );
          stave
            .addClef(clef)
            .addTimeSignature(timeSignature)
            .addKeySignature(keySignature);
          currentXRef.current += firstMeasureWidth / scaleFactor;
        } else {
          stave = new VF.Stave(
            currentXRef.current,
            40,
            measureWidth / scaleFactor
          );
          currentXRef.current += measureWidth / scaleFactor;
        }
        stave.setContext(context.current).draw();
        staves.push(stave);
        measureRenderIndex++;
      }

      // Group notes into measures
      const measuresNotes = [];
      let currMeasure = [];
      let measureDuration = 0;

      // Split all notes into measures, only render the notes which you haven't already rendered (start from renderedNoteIndexRef)
      while (renderedNoteIndexRef.current < notes.length) {
        measureDuration = 0;
        currMeasure = [];
        // Create each measure
        while (
          measureDuration < beatsPerMeasure &&
          renderedNoteIndexRef.current < notes.length
        ) {
          currMeasure.push(notes[renderedNoteIndexRef.current]);
          let noteDuration = durationToNumber(
            notes[renderedNoteIndexRef.current].getDuration()
          );
          if (noteDuration === null) {
            throw console.error("Note Duration is null");
          }
          if (notes[renderedNoteIndexRef.current].isDotted()) {
            noteDuration = noteDuration * 1.5;
          } // Check for dotted notes separately since .duration doesn't contain dot.
          measureDuration += noteDuration;
          renderedNoteIndexRef.current++;
        }
        measuresNotes.push([...currMeasure]);
      }

      // Render notes for each measure
      let expectedX = 0;
      measuresNotes.forEach((measureNotes, idx) => {
        expectedX += idx === 0 ? 350 : 400;
        if (idx < staves.length) {
          const voice = new VF.Voice({
            num_beats: beatsPerMeasure,
            beat_value: 4,
          });
          try {
            voice.addTickables(measureNotes);
          } catch (error) {
            console.error("error adding measureNotes to voice");
            console.log(`measureNotes: ${measureNotes}`);
            console.log(`measuresNotes length: ${measuresNotes.length}`);
            console.log(`measuresNotes idx of measureNotes: ${idx}`);
          }
          const beams = Beam.generateBeams(measureNotes);
          // Format voices, last parameter is the width to format voices
          if (idx == 0 && hasFirstMeasure) {
            // In the first measure clef/signatures take up ~180 px, only have 320/500 px for notes
            // Key/time signatures take up 70 - 150 px. Use all extra space.
            const numAccidentals: number = keySignatures[keySignature];
            let signatureSpace: number;
            if (numAccidentals == 0) {
              signatureSpace = (70 / 4) * viewHeight;
            } else {
              signatureSpace =
                (80 / 4) * viewHeight +
                ((numAccidentals * 10) / 4) * viewHeight;
            }
            const remainingSpace =
              firstMeasureSpace + measureWidth - signatureSpace;
            try {
              new VF.Formatter()
                .joinVoices([voice])
                .format([voice], ((remainingSpace / scaleFactor) * 95) / 100);
            } catch (error) {
              console.log("Error creating voice with notes: ");
              console.log(measureNotes);
              throw error;
            }
          } else {
            try {
              new VF.Formatter()
                .joinVoices([voice])
                .format([voice], ((measureWidth / scaleFactor) * 95) / 100);
            } catch (error) {
              console.log("Error creating voice with notes: ");
              console.log(measureNotes);
              throw error;
            }
          }
          voice.draw(context.current, staves[idx]);
          beams.forEach((b) => {
            b.setContext(context.current).draw();
          });
        }
      });
      setNoteElements(notes.map((note) => note.getSVGElement() as SVGGElement));
      lastRenderedMeasureRef.current = endMeasure;
      setInitialRender(false);
    },
    [notes]
  );

  // Call renderNotes whenever notes is updated
  useEffect(() => {
    if (notes && notes.length > 0 && renderer.current && context.current) {
      renderNotes(lastRenderedMeasureRef.current, totalMeasures);
    }
  }, [notes]);

  return <div ref={sheetMusicDivRef}></div>;
}

export default SheetMusicDisplay;
