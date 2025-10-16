import "./TempoSlider.css";

const TempoSlider = ({ tempo, setTempo }) => {
  const handleSliderChange = (event: any) => {
    setTempo(event.target.value);
  };

  return (
    <div className="tempo-slider-container">
      <label className="tempo-label">
        <span className="tempo-value">{tempo}</span>
      </label>
      <div className="slider-wrapper">
        <img src="/images/turtle.svg" className="tempo-icon"></img>
        <input
          type="range"
          min="40"
          max="140"
          value={tempo}
          onChange={handleSliderChange}
          className="tempo-slider"
        />
        <img src="/images/rabbit.svg" className="tempo-icon"></img>
      </div>
    </div>
  );
};

export default TempoSlider;
