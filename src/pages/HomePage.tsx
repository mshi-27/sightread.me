// src/components/HomePage.js
import { Play } from "lucide-react";
import "./HomePage.css";
import { AnimationContext } from "./MainScreen";
import { useContext } from "react";

const HomePage = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("HomePage must be used within a Layout component");
  }
  const { handleButtonClick } = context;

  return (
    <>
      <button
        onClick={() => handleButtonClick("/custom/create")}
        className="main-button"
      >
        <Play className="button-icon-main" />
        Start
      </button>
    </>
  );
};

export default HomePage;
