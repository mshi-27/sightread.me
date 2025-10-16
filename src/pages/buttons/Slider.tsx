import "./TempoSlider.css";

const Slider = ({ value, setValue }) => {
  const handleSliderChange = (event: any) => {
    setValue(event.target.value);
  };

  return (
    <div className="tempo-slider-container">
      <label className="tempo-label">
        <span className="tempo-value">{value}</span>
      </label>
      <div className="slider-wrapper">
        <input
          type="range"
          min="1"
          max="16"
          value={value}
          onChange={handleSliderChange}
          className="tempo-slider"
        />
      </div>
    </div>
  );
};

export default Slider;
