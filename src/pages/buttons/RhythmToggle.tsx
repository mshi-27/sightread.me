import { useEffect } from "react";
import { toast } from "sonner";
import "./RhythmToggle.css";

const rhythms = [
  { id: 1, image: "whole_note.svg" },
  { id: 2, image: "half_note.svg" },
  { id: 3, image: "quarter_note.svg" },
  { id: 4, image: "eighth_note.svg" },
  { id: 5, image: "sixteenth_note.svg" },
  { id: 6, image: "dotted_half_note.svg" },
  { id: 7, image: "dotted_quarter_note.svg" },
];

const RhythmToggle = ({ timeSignature, selectedRhythms, setRhythms }) => {
  const handleSelect = (id) => {
    let alertShown = false;
    setRhythms((prevRhythms) => {
      if (prevRhythms.length === 1 && prevRhythms.includes(id)) {
        if (!alertShown) {
          toast.error("At least one rhythm must be selected.", {
            duration: 2000,
            style: {
              display: "flex",
              justifyContent: "center",
            },
          });
          alertShown = true;
        }
        return prevRhythms;
      }

      if (selectedRhythms)
        if (id === 7) {
          // If dotted quarter note (id 7) is selected
          if (prevRhythms.includes(7)) {
            // If already selected, deselect id 7 and keep/remove id 4 as needed
            return prevRhythms.filter((rhythmId) => rhythmId !== 7);
          } else {
            // If not already selected, select id 7 and ensure id 4 is also selected
            return [...prevRhythms, 7, 4].filter(
              (value, index, self) => self.indexOf(value) === index
            );
          }
        }
        // If dotted half note (id 6) is selected
        else if (id === 6 && timeSignature == "4/4") {
          if (prevRhythms.includes(6)) {
            // If already selected, deselect id 6 and keep/remove id 3 as needed
            return prevRhythms.filter((rhythmId) => rhythmId !== 6);
          } else {
            // If not already selected, select id 6 and ensure id 3 is also selected
            return [...prevRhythms, 6, 3].filter(
              (value, index, self) => self.indexOf(value) === index
            );
          }
        }
        // If attempting to deselect eighth note (id 4) while dotted quarter note (id 7) is selected
        else if (id === 4 && prevRhythms.includes(7)) {
          if (!alertShown) {
            toast.error(
              "Cannot remove eighth note while dotted quarter note is selected.",
              {
                duration: 3000,
                style: {
                  display: "flex",
                  justifyContent: "center",
                },
              }
            );
            alertShown = true;
          }
          return prevRhythms;
        } else if (
          id === 3 &&
          prevRhythms.includes(6) &&
          timeSignature == "4/4"
        ) {
          if (!alertShown) {
            toast.error(
              "Cannot remove quarter note while dotted half note is selected in 4/4.",
              {
                duration: 3000,
                style: {
                  display: "flex",
                  justifyContent: "center",
                },
              }
            );
            alertShown = true;
          }
          return prevRhythms;
        } else {
          return prevRhythms.includes(id)
            ? prevRhythms.filter((rhythmId) => rhythmId !== id)
            : [...prevRhythms, id];
        }
    });
  };

  useEffect(() => {
    if (timeSignature == "4/4") {
      if (selectedRhythms.includes(6)) {
        if (!selectedRhythms.includes(3)) {
          setRhythms((prevRhythms) => {
            return [...prevRhythms, 3];
          });
        }
      }
    }
    if (timeSignature == "3/4") {
      if (selectedRhythms.includes(1)) {
        setRhythms((prevRhythms) => {
          if (prevRhythms.length === 1) {
            return [3];
          }
          return prevRhythms.filter((rhythmId) => rhythmId !== 1);
        });
      }
    }
  }, [timeSignature, selectedRhythms]);

  return (
    <div className="rhythm-selector">
      <div className="rhythm-boxes">
        {rhythms.map((rhythm) => (
          <div
            key={rhythm.id}
            className={`rhythm-box ${rhythm.id == 1 ? "whole-note" : ""} 
              ${selectedRhythms.includes(rhythm.id) ? "selected" : "unselected"}
              ${rhythm.id == 2 ? "half-note" : ""}
              ${rhythm.id == 1 && timeSignature == "3/4" ? "disabled" : ""}
              `}
            onClick={() => {
              if (!(rhythm.id == 1 && timeSignature == "3/4")) {
                handleSelect(rhythm.id);
              }
            }}
          >
            <img
              src={`/images/music-images/${rhythm.image}`}
              alt={`Rhythm ${rhythm.id}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RhythmToggle;
