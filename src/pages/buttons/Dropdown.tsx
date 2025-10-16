import { useState } from "react";
import "./Dropdown.css";
import { ChevronDown } from "lucide-react";

const Dropdown = ({ options, selected, onSelect, narrow }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: any) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className={`dropdown`}>
      <button
        className={`dropdown-toggle ${narrow ? "narrow" : ""}`}
        onClick={handleToggle}
      >
        <span className="selected-text">{selected}</span>
        <ChevronDown className="dropdown-icon" />
      </button>
      <ul
        className={`dropdown-menu ${isOpen ? "open" : ""} ${
          narrow ? "narrow" : ""
        }`}
      >
        {options.map((option) => (
          <li
            key={option}
            onClick={() => handleOptionClick(option)}
            className={`dropdown-item ${narrow ? "narrow" : ""}`}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dropdown;
