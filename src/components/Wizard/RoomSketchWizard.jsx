import { useState } from "react";

import "./RoomSketchWizard.css";

function RoomSketchWizard() {
  const [selectedMode, setSelectedMode] = useState("");

  return (
    <div className="roomsketch-wizard">
      <div className="roomsketch-wizard-header">🧙 RoomSketch Wizard</div>

      <div className="roomsketch-wizard-body">
        <div className="roomsketch-wizard-step">Stap 1 van 5</div>

        <p>Hoe wil je beginnen?</p>

        <label className="roomsketch-wizard-option">
          <input
            type="radio"
            name="wizardMode"
            value="known"
            checked={selectedMode === "known"}
            onChange={(e) => setSelectedMode(e.target.value)}
          />{" "}
          Ik heb een plattegrond met maten
        </label>

        <label className="roomsketch-wizard-option">
          <input
            type="radio"
            name="wizardMode"
            value="unknown"
            checked={selectedMode === "unknown"}
            onChange={(e) => setSelectedMode(e.target.value)}
          />{" "}
          Ik heb een plattegrond zonder maten
        </label>

        <label className="roomsketch-wizard-option">
          <input
            type="radio"
            name="wizardMode"
            value="measure"
            checked={selectedMode === "measure"}
            onChange={(e) => setSelectedMode(e.target.value)}
          />{" "}
          Ik ga mijn woning opmeten
        </label>

        <button
          disabled={!selectedMode}
          className={`roomsketch-wizard-button ${
            selectedMode ? "is-active" : "is-disabled"
          }`}
        >
          Volgende →
        </button>
      </div>
    </div>
  );
}

export default RoomSketchWizard;
