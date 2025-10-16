import "./ClefSelector.css";

const clefs = [
  { id: "treble", image: "treble_clef.svg" },
  { id: "bass", image: "bass_clef.svg" },
  { id: "alto", image: "alto_clef.svg" },
  { id: "tenor", image: "tenor_clef.svg" },
];

const ClefSelector = ({ selectedClef, setClef }) => {
  const handleSelect = (id) => {
    setClef(id);
  };

  return (
    <div className="clef-selector">
      <div className="clef-boxes">
        {clefs.map((clef) => (
          <div
            key={clef.id}
            className={`clef-box ${
              selectedClef === clef.id ? "selected" : "unselected"
            }`}
            onClick={() => handleSelect(clef.id)}
          >
            <img
              src={`/images/${clef.image}`}
              className={`clef-image ${clef.id === "alto" ? "alto-image" : ""}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClefSelector;
