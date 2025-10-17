import { useEffect, useRef, useState, useCallback } from "react";
import SheetMusicDisplay from "./SheetMusicDisplay.js";
import { StaveNote } from "vexflow";
import useAudio from "./useAudio.js";
import useScroll from "./useScroll.js";
import { fetchMelodyFromPython, NoteCheck } from "./utilFunctions.js";
import { useLocation, useNavigate } from "react-router-dom";
import "./GameScreen.css";
import StartGameButton from "./GameScreenButtons/StartGameButton.js";
import ChallengeOverScreen from "./ChallengeOverScreen.js";
import { Home } from "lucide-react";
import "../pages/buttons/HomeButton.css";
import Metronome_2 from "./Metronome_2.js";
function useUrlQueryParams() {
  return new URLSearchParams(useLocation().search);
}

// SightReading component manages states for current sight reading session, handles game start, stop, scroll.
export default function SightReading() {
  const query = useUrlQueryParams();
  const navigate = useNavigate();

  // Get values from query parameters or default
  let initialKey = decodeURIComponent(query.get("keySignature") || "C");
  let initialTempo = query.get("tempo") || 100;
  let initialTimeSignature = decodeURIComponent(
    query.get("timeSignature") || "4/4"
  );
  let initialRhythms = query.get("rhythms") || "1234567";
  let totalStrikes = query.get("strikes") || 3;
  const minNote = decodeURIComponent(query.get("minNote") || "C4");
  const maxNote = decodeURIComponent(query.get("maxNote") || "C5");
  const clef = query.get("clef") || "treble";

  // Ensure that initialTempo and totalStrikes are numbers
  if (typeof initialTempo === "string") {
    initialTempo = parseInt(initialTempo, 10) || 100; // Converts to number or defaults to 100 if NaN
  }

  if (typeof totalStrikes === "string") {
    totalStrikes = parseInt(totalStrikes, 10) || 3; // Converts to number or defaults to 3 if NaN
  }
  // Divs
  const sheetMusicDivRef = useRef<HTMLDivElement>(null); // Contains the VexFlow renderer
  const noteInfoRef = useRef<HTMLDivElement>(null); // Contains info about note detected through microphone for debugging
  const debugRef = useRef<HTMLDivElement>(null); // Contains misc. info for debugging
  const scoreRef = useRef<HTMLDivElement>(null); // Contains sight reading game score
  const viewportRef = useRef<HTMLDivElement>(null); // Viewport div contains sheetmusicdivref
  const countdownRef = useRef<HTMLDivElement>(null); // Div for metronome countdown
  const strikesRef = useRef<HTMLDivElement>(null); // Div for displaying strikes (mistakes)
  const lastRenderedMeasureRef = useRef<number>(0); // To render notes without repetition
  // States
  const [notes, setNotes] = useState<StaveNote[]>([]); // VexFlow StaveNotes
  const [noteElements, setNoteElements] = useState<SVGGElement[]>([]); // SVG Rendered Note Elements
  const [melody, setMelody] = useState<
    { pitch: string; octave: number; duration: string }[]
  >([]);
  const [activeNotes, setActiveNotes] = useState<NoteCheck[]>([]); // NoteCheck objects {note, startTime, endTime, isCorrect}
  const [keySignature, setKeySignature] = useState<string>(initialKey);
  const [tempo, setTempo] = useState<number>(initialTempo); // Beats per minute
  const [timeSignature] = useState<string>(initialTimeSignature);
  const [rhythms] = useState<string>(initialRhythms);
  const [totalMeasures, setTotalMeasures] = useState<number>(0); // For renderNotes and checkScroll
  const [configured, setConfigured] = useState<boolean>(false); // For configurations before initialization of audioContext and VexFlow
  const [initializedAudio, setInitializedAudio] = useState<boolean>(false);
  const [startVisible, setStartVisible] = useState(true); // For rendering in UI with smooth ordered animations
  const [strikes, setStrikes] = useState<number>(0); // For tracking mistakes
  const [coloredXs, setColoredXs] = useState("X ".repeat(strikes).trim());
  const [emptyXs, setEmptyXs] = useState(
    "X ".repeat(totalStrikes - strikes).trim()
  );
  const [challengeOver, setChallengeOver] = useState<boolean>(false);
  const [reviewMode, setReviewMode] = useState<boolean>(false);
  const [score, setScore] = useState({ total: 0, correct: 0 });
  const [initialRender, setInitialRender] = useState(true);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [resetMetronome, setResetMetronome] = useState(0);
  // Constants
  const bufferMeasures = 8; // Measures per melody fetch
  
  // Custom hooks
  const { audioContext, initializeAudio } = useAudio({
    notes,
    noteElements,
    activeNotes,
    setActiveNotes,
    scoreElementRef: scoreRef,
    setStrikes,
    challengeOver,
    score,
    setScore,
  }); // AudioContext for time and audio input
  const { startScroll, pauseScroll } = useScroll({
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
    challengeOver,
    setMetronomeOn,
    setResetMetronome,
    minNote,
    maxNote,
  });

  const initializeMelody = useCallback(async () => {
    if (keySignature) {
      const randomMelody = await fetchMelodyFromPython(
        bufferMeasures,
        keySignature,
        timeSignature.replace("/", "slash"),
        rhythms,
        minNote,
        maxNote
      );
      setMelody(randomMelody);
      setTotalMeasures(bufferMeasures);
    }
  }, [bufferMeasures, keySignature]);

  const handleHome = () => {
    pauseScroll();
    navigate("/");
  };

  const handlePlayAgain = () => {
    window.location.reload();
  };

  // Create colored Xs according to strikes
  useEffect(() => {
    setColoredXs("X ".repeat(strikes).trim());
    setEmptyXs("X ".repeat(totalStrikes - strikes).trim());
    if (strikes === totalStrikes) {
      pauseScroll();
      setChallengeOver(true);
      setMetronomeOn(false);
    }
  }, [strikes, totalStrikes]);
  // Configure all settings before initialization
  useEffect(() => {
    setKeySignature(initialKey);
    setTempo(initialTempo);
    setConfigured(true);
  }, []);

  useEffect(() => {
    if (configured) {
      initializeMelody();
      if (!audioContext) {
        initializeAudio();
        setInitializedAudio(true);
      }
    }
  }, [configured]);

  return (
    <div className="game-screen-container">
      <div
        className={`metronome-container ${
          !startVisible && !reviewMode ? "fade-in" : ""
        }`}
      >
        <Metronome_2
          metronomeOn={metronomeOn}
          tempo={tempo}
          audioContext={audioContext}
          initializedAudio={initializedAudio}
          resetMetronome={resetMetronome}
        />
      </div>
      <button className="home-button" onClick={handleHome}>
        <Home className="home-button-icon" />{" "}
      </button>
      <ChallengeOverScreen
        show={challengeOver && !reviewMode}
        score={score}
        setReviewMode={setReviewMode}
      />
      <div className={`score-display ${!startVisible ? "fade-in" : ""}`}>
        Score: <span ref={scoreRef} className="score-display-score"></span>
      </div>
      <div
        className={`viewport ${reviewMode ? "review-mode" : ""}`}
        ref={viewportRef}
      >
        <SheetMusicDisplay
          keySignature={keySignature}
          timeSignature={timeSignature}
          notes={notes}
          setNotes={setNotes}
          setNoteElements={setNoteElements}
          melody={melody}
          sheetMusicDivRef={sheetMusicDivRef}
          lastRenderedMeasureRef={lastRenderedMeasureRef}
          totalMeasures={totalMeasures}
          initialRender={initialRender}
          setInitialRender={setInitialRender}
          clef={clef}
        />
      </div>
      {!initialRender ? (
        <div className="below-notes-container-start-button">
          <StartGameButton
            startScroll={startScroll}
            startVisible={startVisible}
            setStartVisible={setStartVisible}
          />
        </div>
      ) : (
        <div className="below-notes-container loading-display">Loading...</div>
      )}
      {!startVisible && !reviewMode && (
        <div className="below-notes-container">
          <div ref={countdownRef} className={`countdown-display`}>
            <span>{"Starting in"}</span>
          </div>
          <div ref={strikesRef} className={`strikes-display`}>
            <span className="colored-Xs">{coloredXs}</span>{" "}
            <span className="empty-Xs">{emptyXs}</span>
          </div>
        </div>
      )}
      <div ref={noteInfoRef}></div>
      <button
        className={`review-mode-play-again-button ${reviewMode ? "show" : ""}`}
        onClick={handlePlayAgain}
      >
        Play Again
      </button>
      <div ref={debugRef}></div>
    </div>
  );
}
