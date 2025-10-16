import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "./buttons/Dropdown";
import TempoSlider from "./buttons/TempoSlider";
import Slider from "./buttons/Slider";
import RhythmToggle from "./buttons/RhythmToggle";
import ClefSelector from "./buttons/ClefSelector";
import "./CustomSettingsPage.css";
import { toast } from "sonner";

const keySignatureMap = {
  "0#": "C",
  "1#": "G",
  "2#": "D",
  "3#": "A",
  "4#": "E",
  "5#": "B",
  "6#": "F#",
  "7#": "C#",
  "0♭": "C",
  "1♭": "F",
  "2♭": "B♭",
  "3♭": "E♭",
  "4♭": "A♭",
  "5♭": "D♭",
  "6♭": "G♭",
  "7♭": "C♭",
};

const clefRanges = {
  treble: { min: { note: "G", octave: 3 }, max: { note: "E", octave: 6 } },
  bass: { min: { note: "C", octave: 2 }, max: { note: "G", octave: 4 } },
  alto: { min: { note: "A", octave: 2 }, max: { note: "F", octave: 5 } },
  tenor: { min: { note: "F", octave: 2 }, max: { note: "D", octave: 5 } },
};

const comfortableClefRanges = {
  treble: { min: { note: "C", octave: 4 }, max: { note: "A", octave: 5 } },
  bass: { min: { note: "A", octave: 2 }, max: { note: "C", octave: 4 } },
  alto: { min: { note: "E", octave: 3 }, max: { note: "B", octave: 4 } },
  tenor: { min: { note: "C", octave: 3 }, max: { note: "G", octave: 4 } },
};

const noteRange = [
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
const noteRangeFlats = [
  "C",
  "D♭",
  "D",
  "E♭",
  "E",
  "F",
  "G♭",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];

const CustomSettingsPage = () => {
  const navigate = useNavigate();

  const [number, setNumber] = useState("0");
  const [accidental, setAccidental] = useState("#");
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [tempo, setTempo] = useState(60);
  const [strikes, setStrikes] = useState(3);
  const [rhythms, setRhythms] = useState([3]);
  const [keySignature, setKeySignature] = useState("");
  const [clef, setClef] = useState("treble");
  const [minNote, setMinNote] = useState({ note: "G", octave: 3 });
  const [maxNote, setMaxNote] = useState({ note: "E", octave: 5 });

  useEffect(() => {
    const keySignature = keySignatureMap[`${number}${accidental}`];
    setKeySignature(keySignature);
  }, [number, accidental]);

  useEffect(() => {
    // Reset min and max notes when clef changes
    setMinNote(comfortableClefRanges[clef].min);
    setMaxNote(comfortableClefRanges[clef].max);
  }, [clef]);

  const generateNoteOptions = () => {
    if (accidental === "♭") {
      return noteRangeFlats;
    }
    return noteRange;
  };

  const generateMinOctaveOptions = () => {
    const minOctave = clefRanges[clef].min.octave;
    const maxOctave = Math.min(maxNote.octave - 1, clefRanges[clef].max.octave);
    return generateOctaveOptions(minOctave, maxOctave);
  };

  const generateMaxOctaveOptions = () => {
    const minOctave = Math.max(minNote.octave + 1, clefRanges[clef].min.octave);
    const maxOctave = clefRanges[clef].max.octave;
    return generateOctaveOptions(minOctave, maxOctave);
  };

  const generateOctaveOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(i.toString());
    }
    return options;
  };

  const isAtLeastAnOctaveApart = (note1, note2) => {
    let index1 = noteRange.indexOf(note1.note);
    if (index1 === -1) {
      index1 = noteRangeFlats.indexOf(note1.note);
    }

    let index2 = noteRange.indexOf(note2.note);
    if (index2 === -1) {
      index2 = noteRangeFlats.indexOf(note2.note);
    }

    if (note2.octave - note1.octave > 1) {
      return true;
    } else if (note2.octave - note1.octave === 1) {
      return index2 >= index1;
    }
    return false;
  };

  const handleMinNoteChange = (newNote, newOctave) => {
    newOctave = newOctave ? parseInt(newOctave) : null;
    let updatedNote = minNote.note;
    let updatedOctave = minNote.octave;

    if (newNote) {
      updatedNote = newNote;
    }

    if (newOctave !== null) {
      updatedOctave = newOctave;
    }

    const newMinNote = { note: updatedNote, octave: updatedOctave };
    if (!isAtLeastAnOctaveApart(newMinNote, maxNote)) {
      toast.error(
        `Lowest note and highest note must be at least 1 octave apart`,
        {
          duration: 3000,
          style: {
            display: "flex",
            justifyContent: "center",
          },
        }
      );
      return;
    }

    if (compareNotes(newMinNote, clefRanges[clef].min) < 0) {
      toast.error(
        `Note Too Low. ${
          clef.charAt(0).toUpperCase() + clef.slice(1)
        } Clef Minimum Note: ${clefRanges[clef].min.note}${
          clefRanges[clef].min.octave
        }`,
        {
          duration: 3000,
          style: {
            display: "flex",
            justifyContent: "center",
          },
        }
      );
      return;
    }
    setMinNote(newMinNote);

    // Ensure max note is at least an octave higher than min note
    if (compareNotes(newMinNote, maxNote) >= 0) {
      const newMaxOctave = newMinNote.octave + 1;
      setMaxNote({ note: newMinNote.note, octave: newMaxOctave });
    }
  };

  const handleMaxNoteChange = (newNote, newOctave) => {
    newOctave = newOctave ? parseInt(newOctave) : null;
    let updatedNote = maxNote.note;
    let updatedOctave = maxNote.octave;

    if (newNote) {
      updatedNote = newNote;
    }

    if (newOctave !== null) {
      updatedOctave = newOctave;
    }

    const newMaxNote = { note: updatedNote, octave: updatedOctave };

    // Ensure max note is at least an octave higher than min note
    if (!isAtLeastAnOctaveApart(minNote, newMaxNote)) {
      toast.error(
        `Lowest note and highest note must be at least 1 octave apart`,
        {
          duration: 3000,
          style: {
            display: "flex",
            justifyContent: "center",
          },
        }
      );
      return;
    }
    // Adjust octave if necessary
    if (compareNotes(newMaxNote, clefRanges[clef].max) > 0) {
      toast.error(
        `Note Too High. ${
          clef.charAt(0).toUpperCase() + clef.slice(1)
        } Clef Maximum Note: ${clefRanges[clef].max.note}${
          clefRanges[clef].max.octave
        }`,
        {
          duration: 3000,
          style: {
            display: "flex",
            justifyContent: "center",
          },
        }
      );
      return;
    }
    setMaxNote(newMaxNote);
  };

  const compareNotes = (note1, note2) => {
    if (note1.octave !== note2.octave) {
      return note1.octave - note2.octave;
    }
    let index1 = noteRange.indexOf(note1.note);
    if (index1 === -1) {
      index1 = noteRangeFlats.indexOf(note1.note);
    }

    let index2 = noteRange.indexOf(note2.note);
    if (index2 === -1) {
      index2 = noteRangeFlats.indexOf(note2.note);
    }

    return index1 - index2;
  };

  const encodeFlats = (key) => {
    return key.replaceAll("♭", "b");
  };

  const startChallenge = () => {
    const params = new URLSearchParams({
      keySignature: encodeFlats(keySignature) || "C",
      tempo: tempo.toString() || "100",
      strikes: strikes.toString() || "3",
      timeSignature:
        encodeURIComponent(timeSignature) || encodeURIComponent("4/4"),
      rhythms: rhythms.join("") || "12345",
      minNote: `${encodeFlats(minNote.note)}${minNote.octave}`,
      maxNote: `${encodeFlats(maxNote.note)}${maxNote.octave}`,
      clef,
    });

    navigate(
      {
        pathname: "/challenge",
        search: `?${params.toString()}`,
      },
      { replace: true }
    );

    window.location.reload();
  };

  return (
    <div className="settings-container">
      <div className="settings-row">
        <span className="settings-label">Clef:</span>
        <ClefSelector selectedClef={clef} setClef={setClef} />
      </div>

      <div className="settings-row">
        <span className="settings-label">Lowest Note:</span>
        <Dropdown
          options={generateNoteOptions()}
          selected={minNote.note}
          onSelect={(note) => handleMinNoteChange(note, null)}
          narrow={false}
        />
        <Dropdown
          options={generateMinOctaveOptions()}
          selected={minNote.octave.toString()}
          onSelect={(octave) => handleMinNoteChange(null, octave)}
          narrow={true}
        />
        <span className="settings-label">Highest Note:</span>
        <Dropdown
          options={generateNoteOptions()}
          selected={maxNote.note}
          onSelect={(note) => handleMaxNoteChange(note, null)}
          narrow={false}
        />
        <Dropdown
          options={generateMaxOctaveOptions()}
          selected={maxNote.octave.toString()}
          onSelect={(octave) => handleMaxNoteChange(null, octave)}
          narrow={true}
        />
      </div>

      <div className="settings-row">
        <span className="settings-label">Key Signature:</span>
        <Dropdown
          options={["0", "1", "2", "3", "4", "5", "6", "7"]}
          selected={number}
          onSelect={setNumber}
          narrow={true}
        />
        <Dropdown
          options={["#", "♭"]}
          selected={accidental}
          onSelect={setAccidental}
          narrow={true}
        />
        <span className="settings-label colored">
          {keySignature + " Major"}
        </span>
      </div>

      <div className="settings-row">
        <span className="settings-label">Time Signature:</span>
        <Dropdown
          options={["4/4", "3/4"]}
          selected={timeSignature}
          onSelect={setTimeSignature}
          narrow={false}
        />
      </div>

      <div className="settings-row">
        <span className="settings-label">Tempo:</span>
        <TempoSlider tempo={tempo} setTempo={setTempo} />
      </div>

      <div className="settings-row">
        <span className="settings-label">Strikes:</span>
        <Slider value={strikes} setValue={setStrikes} />
      </div>

      <div className="settings-row">
        <span className="settings-label">Rhythms:</span>
        <RhythmToggle
          timeSignature={timeSignature}
          selectedRhythms={rhythms}
          setRhythms={setRhythms}
        />
      </div>

      <button onClick={startChallenge} className="create-button">
        Create Challenge
      </button>
    </div>
  );
};

export default CustomSettingsPage;
