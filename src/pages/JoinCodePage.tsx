import { Settings } from "lucide-react";
import JoinCodeButton from "./buttons/JoinCodeButton";
import { AnimationContext } from "./MainScreen";
import { useContext } from "react";

// Placeholder component for future multiplayer feature
const CustomSettingsPage = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("HomePage must be used within a Layout component");
  }
  const { handleButtonClick } = context;
  return (
    <>
      <JoinCodeButton />
      <button
        onClick={() => handleButtonClick("/custom/create")}
        className="main-button"
      >
        <Settings className="button-icon-main" />
        Create Your Own
      </button>
    </>
  );
};

export default CustomSettingsPage;
