import { Vex, StaveNote } from "vexflow";

export interface NoteCheck {
  note: StaveNote;
  startTime: number;
  endTime: number;
  isCorrect: boolean;
}
export function dotted(staveNote: StaveNote, noteIndex: number = -1) {
  // noteIndex refers to which note in the StaveNote (StaveNote can represent a chord)
  if (noteIndex < 0) {
    Vex.Flow.Dot.buildAndAttach([staveNote], {
      all: true,
    });
  } else {
    Vex.Flow.Dot.buildAndAttach([staveNote], {
      index: noteIndex,
    });
  }
  return staveNote;
}

export function playMetronome(
  tempo: number,
  beats: number,
  divRef: React.RefObject<HTMLDivElement>,
  setMetronomeOn: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
  return new Promise((resolve) => {
    const interval = (60 / tempo) * 1000;
    setMetronomeOn(true);
    for (let i = 0; i <= beats; i++) {
      setTimeout(() => {
        if (i === beats) {
          divRef.current!.innerText = "\n";
          resolve();
        } else {
          divRef.current!.innerText = "Starting in " + (beats - i) + "...";
        }
      }, i * interval);
    }
  });
}

export async function fetchMelodyFromPython(
  measures: number,
  key: string,
  timeSignature: string,
  rhythms: string,
  minNote: string,
  maxNote: string
) {
  let response;
  if (key.includes("#")) {
    key = key.replace("#", "sharp");
  }
  if (minNote.includes("#")) {
    minNote = minNote.replace("#", "sharp");
  }
  if (maxNote.includes("#")) {
    maxNote = maxNote.replace("#", "sharp");
  }
  if (timeSignature.includes("/")) {
    key = key.replace("/", "slash");
  }
  response = await fetch(
    `https://music-app-vercel-fastapi-mshi-27-maxs-projects-44197312.vercel.app/generate_melody/${measures}/${key}/${timeSignature}/${rhythms}/${minNote}/${maxNote}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
}

export function durationToNumber(duration: string) {
  switch (duration) {
    case "w":
      return 4;
    case "hd":
      return 3;
    case "h":
      return 2;
    case "qd":
      return 1.5;
    case "q":
      return 1;
    case "8d":
      return 0.75;
    case "8":
      return 0.5;
    case "16":
      return 0.25;
    case "32":
      return 0.125;
    default:
      throw console.error("Invalid duration");
  }
}

export function getNoteDuration(note: StaveNote) {
  const durationStr = note.getDuration();
  if (durationStr === null) {
    throw new Error("Note duration is null");
  }

  let duration: number = durationToNumber(durationStr);
  if (note.isDotted()) {
    duration = duration * 1.5;
  }
  return duration;
}

export function getDurationInMs(note: StaveNote, tempo: number) {
  let duration = getNoteDuration(note);
  const beatsPerSecond = tempo / 60;
  const quarterNoteDurationMs = 1000 / beatsPerSecond;
  return duration * quarterNoteDurationMs;
}

export function frequencyToNote(frequency: number) {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const a4 = 440;
  const c0 = a4 * Math.pow(2, -4.75);
  const halfStepsBelowMiddleC = Math.round(12 * Math.log2(frequency / c0));
  const octave = Math.floor(halfStepsBelowMiddleC / 12);
  const noteIndex = ((halfStepsBelowMiddleC % 12) + 12) % 12;
  return noteNames[noteIndex] + "/" + octave;
}
function noteToFrequency(note: string) {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const a4 = 440;

  // Parse the note and octave
  note = note.replace("/", "");
  const regex = /^([A-G][b#]?)(-?\d+)$/; // Assert format of the note string
  const match = note.match(regex);

  if (!match) {
    throw new Error(
      'Invalid note format. Use format like "A4", "C#5", or "Gb3".'
    );
  }

  let [, noteName, octave] = match;
  let octaveNum: number = parseInt(octave);

  // Handle enharmonic equivalents
  if (noteName === "E#") {
    noteName = "F";
  } else if (noteName === "B#") {
    noteName = "C";
    octaveNum += 1; // Adjust octave because B# is equivalent to C in the next octave
  }

  // Handle flats
  if (noteName.includes("b")) {
    if (noteName === "Cb") {
      octaveNum -= 1;
    }
    noteName = noteNames[(noteNames.indexOf(noteName[0]) - 1 + 12) % 12];
  }

  // Calculate semitones from A4
  let semitones = noteNames.indexOf(noteName) - noteNames.indexOf("A");
  semitones += (octaveNum - 4) * 12;

  // Calculate frequency
  const frequency = a4 * Math.pow(2, semitones / 12);

  return frequency;
}

export function centDifference(inputFrequency: number, expectedNote: string) {
  // Convert expected note to frequency
  const expectedFrequency = noteToFrequency(expectedNote);

  // Calculate the frequency ratio
  const frequencyRatio = inputFrequency / expectedFrequency;

  // Convert ratio to cents
  const cents = 1200 * Math.log2(frequencyRatio);

  // Check if the difference is within the tolerance
  return Math.abs(cents);
}
