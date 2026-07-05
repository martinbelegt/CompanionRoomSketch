import WizardCoachMessage from "../WizardCoachMessage";

function WizardStepFloorplan({ onBack, onNext }) {
  return (
    <>
      <div className="roomsketch-wizard-step">Stap 2 van 5</div>

      <WizardCoachMessage title="Selecteer je plattegrond">
        Zoek de plattegrond op je computer. Meestal staat deze in de map
        <strong> Documenten</strong> of <strong>Downloads</strong>.
      </WizardCoachMessage>

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

        <strong>Selecteer je plattegrond op je pc</strong>

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

      <button className="roomsketch-wizard-button" onClick={onBack}>
        ← Terug
      </button>

      <button className="roomsketch-wizard-button is-active" onClick={onNext}>
        Verder →
      </button>
    </>
  );
}

export default WizardStepFloorplan;
