import { useRef, useState } from "react";

import "./RoomSketchWizard.css";

function RoomSketchWizard({
  background,
  backgroundScaleCompleted,
  onImportBackground,
  onSelectTool,
}) {
  const [step, setStep] = useState(1);
  const [dismissed, setDismissed] = useState(false);
  const fileInputRef = useRef(null);
  const visibleStep = backgroundScaleCompleted && step === 5 ? 6 : step;

  function startDrawing() {
    onSelectTool("wall");
    setDismissed(true);
  }

  function renderStep() {
    switch (visibleStep) {
      case 1:
        return (
          <>
            <h2>👋 Welkom bij Companion RoomSketch</h2>
            <p>Binnen enkele minuten teken je jouw eigen woning op de computer.</p>
            <p>Daarvoor heb je géén ervaring met tekenprogramma's nodig.</p>
            <p>RoomSketch helpt je stap voor stap.</p>
            <p>Jij hoeft alleen maar te doen wat ik vraag.</p>

            <button className="roomsketch-wizard-button" onClick={() => setStep(2)}>
              Begin
            </button>
          </>
        );

      case 2:
        return (
          <>
            <h2>Stap 1 - Plattegrond</h2>
            <p>Importeer de plattegrond van jouw woning.</p>
            <p>Dat mag een:</p>
            <ul>
              <li>SVG</li>
              <li>PNG</li>
              <li>JPG</li>
              <li>PDF</li>
            </ul>
            <p>zijn.</p>
            <p>Heb je geen plattegrond?</p>
            <p>Geen probleem.</p>
            <p>Je kunt ook direct zelf een woning tekenen.</p>

            <input
              ref={fileInputRef}
              className="roomsketch-wizard-file"
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,application/pdf,.svg,.png,.jpg,.jpeg,.pdf"
              onChange={(event) => {
                onImportBackground(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <button
              className="roomsketch-wizard-button"
              onClick={() => fileInputRef.current?.click()}
            >
              📂 Bouwtekening importeren
            </button>

            {background && (
              <button
                className="roomsketch-wizard-button roomsketch-wizard-button-secondary"
                onClick={() => setStep(3)}
              >
                Volgende →
              </button>
            )}
          </>
        );

      case 3:
        return (
          <>
            <h2>Stap 2 - Bouwtekening op maat zetten</h2>
            <p>Nu zorgen we ervoor dat alle afmetingen precies kloppen.</p>
            <p>Dat hoeft maar één keer.</p>
            <p>Vanaf dat moment kun je erop vertrouwen dat:</p>
            <ul>
              <li>meubels op de juiste maat zijn</li>
              <li>afstanden kloppen</li>
              <li>alle maten betrouwbaar zijn</li>
            </ul>

            <button className="roomsketch-wizard-button" onClick={() => setStep(4)}>
              Volgende →
            </button>
          </>
        );

      case 4:
        return (
          <>
            <h2>Meet een bekende afstand</h2>
            <p>Gebruik hiervoor bij voorkeur de grootste kamer.</p>
            <p>Hoe groter de afstand, hoe nauwkeuriger de meting.</p>
            <p>Zoom gerust eerst even in.</p>

            <div className="roomsketch-wizard-tip">
              <strong>TIP</strong>
              <span>🖱 Muiswiel = in- en uitzoomen</span>
              <span>⌨ Houd de spatiebalk ingedrukt om het canvas te verschuiven.</span>
            </div>

            <button className="roomsketch-wizard-button" onClick={() => setStep(5)}>
              Volgende →
            </button>
          </>
        );

      case 5:
        return (
          <>
            <h2>Bijna klaar</h2>
            <p>
              Klik eerst rechts op <strong>Afstand kiezen</strong>.
            </p>
            <p>Klik daarna twee tegenoverliggende muren aan.</p>
            <p>Vul rechts de werkelijke afstand in.</p>
            <p>Bijvoorbeeld:</p>
            <p className="roomsketch-wizard-example">4074</p>
            <p>Klik daarna op:</p>
            <p>
              <strong>Zet bouwtekening op maat</strong>
            </p>
          </>
        );

      case 6:
        return (
          <>
            <h2>🎉 Klaar!</h2>
            <p>Je bouwtekening staat nu op schaal.</p>
            <p>Vanaf nu kun je je volledig richten op het leukste deel:</p>
            <p>🏡 het indelen van jouw woning.</p>
            <p>Veel plezier!</p>

            <button className="roomsketch-wizard-button" onClick={startDrawing}>
              Begin met tekenen
            </button>
          </>
        );

      default:
        return null;
    }
  }

  if (dismissed) return null;

  return (
    <div
      className={`roomsketch-wizard ${
        visibleStep >= 4 && visibleStep <= 5 ? "is-measuring-step" : ""
      }`}
      role="dialog"
      aria-live="polite"
    >
      {renderStep()}
    </div>
  );
}

export default RoomSketchWizard;
