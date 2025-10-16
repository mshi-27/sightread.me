import { useState } from "react";
import "./StartGameButton.css";

interface StartGameButtonProps {
  startScroll: () => void;
  startVisible: boolean;
  setStartVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({
  startScroll,
  startVisible,
  setStartVisible,
}) => {
  const [pressedStart, setPressedStart] = useState(false);
  const startGame = () => {
    setPressedStart(true);
    setTimeout(() => {
      setStartVisible(false);
    }, 800);
    setTimeout(() => {
      // Group state updates within a requestAnimationFrame to ensure they occur together
      startScroll();
    }, 800);
  };
  return (
    <button
      className={`start-game-button ${pressedStart ? "fade-out" : ""} ${
        startVisible ? "visible" : ""
      }`}
      onClick={startGame}
    >
      <span>Start</span>
    </button>
  );
};

export default StartGameButton;
