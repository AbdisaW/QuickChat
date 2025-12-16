import Button from "../ui/Button/Button";
import "./PersonalizationSettings.css"
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
  function PersonalizationSettings() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("Light");

    const themes = ["Light", "Dark", "System"];

  return (
      <div className="personal-settings">
        <h6>Appearance</h6>

        <label>Theme</label>

        <div className="custom-select">
        
          <div className="select-box" onClick={() => setOpen(!open)}>
            <span>{value}</span>
            {open ? (
              <FaChevronUp className="arrow-icon" />
            ) : (
              <FaChevronDown className="arrow-icon" />
            )}
          </div>

    
          {open && (
            <div className="select-options">
              {themes.map((t) => (
                <div
                  key={t}
                  className="option"
                  onClick={() => {
                    setValue(t);
                    setOpen(false);
                  }}
                >
                  <span>{t}</span>

                  {value === t && <FaCheck className="check-icon" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <Button className="save-btn">Save Changes</Button>
      </div>
    );
  }


export default PersonalizationSettings;






