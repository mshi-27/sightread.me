import { Link } from "react-router-dom";
import "./ChallengeOverScreen.css";

interface ChallengeOverScreenProps {
  show: boolean;
  score: { total: number; correct: number };
  setReviewMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChallengeOverScreen = ({
  show,
  score,
  setReviewMode,
}: ChallengeOverScreenProps) => {
  const handlePlayAgain = () => {
    window.location.reload();
  };

  const handleReviewGame = () => {
    setReviewMode(true);
  };

  return (
    <div className="challengeOverContainer">
      <div className={`challenge-over-overlay ${show ? "show" : ""}`}></div>
      <div className={`challenge-over-content ${show ? "show" : ""}`}>
        <span className="challenge-over-title">Challenge Over</span>
        <span className="challenge-over-score">Score: {score.correct}</span>
        <button className="challenge-over-button" onClick={handleReviewGame}>
          Review
        </button>
        <button className="challenge-over-button" onClick={handlePlayAgain}>
          Play Again
        </button>
        <Link to="/" className="challenge-over-button">
          Home
        </Link>
      </div>
    </div>
  );
};

export default ChallengeOverScreen;
