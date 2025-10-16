import { useEffect, useState, createContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import HomeButton from "./buttons/HomeButton";

export const AnimationContext = createContext<{
  handleButtonClick: (targetRoute: string) => void;
} | null>(null);

const MainScreen = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const handleButtonClick = (
    targetRoute: string,
    state: object | null = null
  ) => {
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      navigate(targetRoute, { state: state });
    }, 300);
  };
  useEffect(() => {
    const notes = document.querySelectorAll(".note");

    notes.forEach((note) => {
      const randomX = `${Math.random() * 140 - 20}vw`; // Random value between 0 and 100 vw
      const randomX_2 = `${Math.random() * 140 - 20}vw`;

      const randomY = `${Math.random() * 140 - 20}vh`; // Random value between 0 and 100 vh
      const randomY_2 = `${Math.random() * 140 - 20}vh`;

      const randomDelay = `${Math.random() * 3}s`; // Random delay between 0 and 5 seconds
      const randomDuration = `${Math.random() * 2 + 3}s`; // Random delay between 0 and 5 seconds

      const randomRotation = `${Math.random() * 720 - 360}deg`;

      (note as HTMLElement).style.setProperty("--randomX", randomX);
      (note as HTMLElement).style.setProperty("--randomX_2", randomX_2);

      (note as HTMLElement).style.setProperty("--randomY", randomY);
      (note as HTMLElement).style.setProperty("--randomY_2", randomY_2);

      (note as HTMLElement).style.animationDelay = randomDelay;
      (note as HTMLElement).style.animationDuration = randomDuration;
      (note as HTMLElement).style.setProperty(
        "--randomRotation",
        randomRotation
      );
    });
  }, []);

  return (
    <AnimationContext.Provider value={{ handleButtonClick }}>
      <HomeButton />
      <header>
        <div className="notes-container">
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/eighth_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/quarter_note.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
          <img
            src="/images/music-images/beamed_eighth_notes.svg"
            className="note"
          ></img>
        </div>
      </header>
      <main>
        <div className={"container"}>
          <h1 className="title">
            <span className="brand-name">sightread</span>
            <img
              src="/images/music-images/sightreadmedotpurple.svg"
              className="logo-dot"
            ></img>
            <span className="brand-extension">me</span>
          </h1>
          <div className={`button-container ${isAnimating ? "slide-out" : ""}`}>
            <Outlet />
          </div>
        </div>
      </main>
    </AnimationContext.Provider>
  );
};

export default MainScreen;
