import "./WizardProgress.css";

function WizardProgress({ currentStep }) {
  const steps = ["Welkom", "Plattegrond", "Maten kloppen", "Muren", "Klaar"];

  const percentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <>
      <div className="wizard-progress-bar">
        <div
          className="wizard-progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="wizard-progress-steps">
        {steps.map((step, index) => {
          const number = index + 1;

          let icon = "○";

          if (number < currentStep) icon = "✓";
          if (number === currentStep) icon = "►";

          return (
            <div key={step} className="wizard-progress-step">
              {icon} {step}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default WizardProgress;
