import { useState } from "react";

import WizardStepWelcome from "./Steps/WizardStepWelcome";
import WizardProgress from "./WizardProgress";

import "./RoomSketchWizard.css";

function RoomSketchWizard({ onSelectTool }) {
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState("");

  if (step === 2) {
    return (
      <div className="roomsketch-wizard">
        <div className="roomsketch-wizard-header">🧙 RoomSketch Wizard</div>

        <div className="roomsketch-wizard-body">
          <WizardProgress currentStep={1} />
          <WizardProgress currentStep={2} />
          <div className="roomsketch-wizard-step">Stap 2 van 5</div>

          <p>
            <strong>Upload je plattegrond</strong>
          </p>

          <div
            style={{
              border: "2px dashed #94a3b8",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              marginBottom: "12px",
              cursor: "pointer",
              background: "#f8fafc",
            }}
          >
            <div style={{ fontSize: 34 }}>📄</div>

            <strong>Kies een plattegrond</strong>

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#64748b",
              }}
            >
              PNG • JPG • PDF
            </div>
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Heb je nog geen digitale plattegrond? Geen probleem, de wizard helpt
            je straks met het opmeten.
          </p>

          <button
            className="roomsketch-wizard-button is-disabled"
            onClick={() => setStep(1)}
          >
            ← Terug
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="roomsketch-wizard">
      <div className="roomsketch-wizard-header">🧙 RoomSketch Wizard</div>

      <div className="roomsketch-wizard-body">
        <WizardStepWelcome
          selectedMode={selectedMode}
          onChange={setSelectedMode}
          onNext={() => {
            if (selectedMode === "known") {
              onSelectTool("measure");
            }

            setStep(2);
          }}
        />
      </div>
    </div>
  );
}

export default RoomSketchWizard;
