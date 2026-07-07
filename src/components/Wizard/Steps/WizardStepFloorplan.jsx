import WizardCoachMessage from "../WizardCoachMessage";

function WizardStepFloorplan({ onBack, onNext }) {
  return (
    <>
      <div className="roomsketch-wizard-step">Stap 2 van 5</div>

      <WizardCoachMessage title="Bouwtekening importeren">
        Gebruik links de knop <strong>Bouwtekening importeren</strong>. Die
        werkt voor SVG en PNG.
      </WizardCoachMessage>

      <button className="roomsketch-wizard-button" onClick={onBack}>
        Terug
      </button>

      <button className="roomsketch-wizard-button is-active" onClick={onNext}>
        Verder
      </button>
    </>
  );
}

export default WizardStepFloorplan;
