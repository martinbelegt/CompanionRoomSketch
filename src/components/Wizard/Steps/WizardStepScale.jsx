import WizardCoachMessage from "../WizardCoachMessage";

function WizardStepScale({ onBack }) {
  return (
    <>
      <div className="roomsketch-wizard-step">Stap 3 van 5</div>

      <WizardCoachMessage title="De plattegrond staat nu op het canvas">
        Zoom eerst in met het <strong>muiswieltje van je muis</strong>, totdat
        je de muur goed kunt zien.
        <br />
        <br />
        Wil je de plattegrond verschuiven? Houd dan de{" "}
        <strong>spatiebalk</strong> ingedrukt en sleep met je muis.
        <br />
        <br />
        Klik daarna op het <strong>begin van een muur</strong>. Dat is punt A.
        <br />
        <br />
        Klik vervolgens op het <strong>einde van dezelfde muur</strong>. Dat is
        punt B.
        <br />
        <br />
        <p>Na punt B vraagt RoomSketch naar de echte lengte van die muur.</p>
        <br />
        <strong>Tip:</strong> Houd bij punt B eventueel de{" "}
        <strong>Shift-toets</strong> ingedrukt om een kaarsrechte lijn te maken.
      </WizardCoachMessage>

      <button className="roomsketch-wizard-button" onClick={onBack}>
        ← Terug
      </button>
    </>
  );
}

export default WizardStepScale;
