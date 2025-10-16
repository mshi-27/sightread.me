import { Home } from "lucide-react";
import { AnimationContext } from "../MainScreen";
import { useContext } from "react";
import "./HomeButton.css";
const HomeButton = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw Error;
  }
  const { handleButtonClick } = context;

  return (
    <button onClick={() => handleButtonClick("/")} className="home-button">
      <Home className="home-button-icon" />
    </button>
  );
};

export default HomeButton;
