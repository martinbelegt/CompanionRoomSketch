import "./WizardCoachMessage.css";

function WizardCoachMessage({ title, children }) {
  return (
    <div className="wizard-coach-message">
      <div className="wizard-coach-title">🧙 RoomSketch Coach</div>

      <div className="wizard-coach-body">
        <strong>{title}</strong>

        <div className="wizard-coach-text">{children}</div>
      </div>
    </div>
  );
}

export default WizardCoachMessage;
