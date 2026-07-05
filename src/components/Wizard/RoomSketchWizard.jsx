import { useState } from "react";

import WizardStepWelcome from "./Steps/WizardStepWelcome";
import WizardStepFloorplan from "./Steps/WizardStepFloorplan";
import WizardStepScale from "./Steps/WizardStepScale";
import WizardProgress from "./WizardProgress";

import "./RoomSketchWizard.css";

function RoomSketchWizard({ onSelectTool }) {
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState("");

  function renderStep() {
    switch (step) {
      case 1:
        return (
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
        );

      case 2:
        return (
          <WizardStepFloorplan
            onBack={() => setStep(1)}
            onNext={() => {
              onSelectTool("measure");
              setStep(3);
            }}
          />
        );

      case 3:
        return (
          <WizardStepScale
            onBack={() => setStep(2)}
            onStartMeasuring={() => onSelectTool("measure")}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="roomsketch-wizard">
      <div className="roomsketch-wizard-header">🧙 RoomSketch Coach</div>

      <div className="roomsketch-wizard-body">
        <WizardProgress currentStep={step} />

        {renderStep()}
      </div>
    </div>
  );
}

export default RoomSketchWizard;
