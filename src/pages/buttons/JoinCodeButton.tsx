import { Play } from "lucide-react";
import "./JoinCodeButton.css";
import { useState } from "react";
// Placeholder component for future multiplayer feature
const JoinCodeButton = () => {
  const [joinCode, setJoinCode] = useState("");

  const handleInputChange = (event: any) => {
    setJoinCode(event.target.value);
  };

  const handleJoinClick = () => {
    if (joinCode) {
      // Implement logic for handling the join code here
    } else {
      alert("Please enter a join code");
    }
  };

  return (
    <div className="join-code-input-wrapper">
      <span className="join-code-input-wrapper-text">Join</span>
      <input
        type="text"
        value={joinCode}
        onChange={handleInputChange}
        placeholder="Type Join Code Here..."
        className="join-code-input"
      />
      <button onClick={handleJoinClick} className="join-code-button">
        <Play className="join-button-icon" />
      </button>
    </div>
  );
};

export default JoinCodeButton;
