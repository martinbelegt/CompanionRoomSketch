import { useEffect, useRef, useState } from "react";

import "./RoomSketchWizard.css";

/* eslint-disable react-hooks/set-state-in-effect */

function RoomSketchWizard({
  background,
  backgroundScaleCompleted,
  backgroundCalibrationActive,
  backgroundCalibrationMeasurement,
  backgroundCalibrationPointCount = 0,
  backgroundScaleMmPerPixel,
  onImportBackground,
  onStartBackgroundCalibration,
  onApplyBackgroundCalibration,
  onCancelBackgroundCalibration,
  onSelectTool,
  workflowRequest,
}) {
  const [step, setStep] = useState(1);
  const [dismissed, setDismissed] = useState(() => backgroundScaleCompleted);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [scaleComparison, setScaleComparison] = useState(null);
  const [realDistanceMm, setRealDistanceMm] = useState("");
  const fileInputRef = useRef(null);
  const distanceInputRef = useRef(null);
  const previousBackgroundRef = useRef(background);
  const hasMeasuredDistance = Boolean(backgroundCalibrationMeasurement);
  const enteredDistance = Number(realDistanceMm.replace(",", "."));
  const canApplyDistance =
    hasMeasuredDistance && Number.isFinite(enteredDistance) && enteredDistance > 0;

  useEffect(() => {
    if (previousBackgroundRef.current !== background && background && step === 2) {
      setStep(3);
    }

    previousBackgroundRef.current = background;
  }, [background, step]);

  useEffect(() => {
    if (!workflowRequest) return;

    setActiveRequestId(workflowRequest.id);
    setDismissed(false);
    setScaleComparison(null);
    setRealDistanceMm("");
    setStep(workflowRequest.startStep);
  }, [workflowRequest]);

  useEffect(() => {
    if (hasMeasuredDistance && step === 7) {
      setStep(8);
    }
  }, [hasMeasuredDistance, step]);

  useEffect(() => {
    if (backgroundScaleCompleted && step < 8 && !activeRequestId) {
      setDismissed(true);
      return;
    }

    if (backgroundScaleCompleted && step >= 8 && step !== 9 && step !== 10) {
      setStep(9);
    }
  }, [activeRequestId, backgroundScaleCompleted, step]);

  useEffect(() => {
    if (step === 8) {
      distanceInputRef.current?.focus();
    }
  }, [step]);

  function startDrawing() {
    onSelectTool("wall");
    setActiveRequestId(null);
    setScaleComparison(null);
    setDismissed(true);
  }

  function applyDistance() {
    if (!canApplyDistance) return;

    const nextComparison = onApplyBackgroundCalibration(enteredDistance);
    setRealDistanceMm("");

    if (nextComparison?.previousScaleMmPerPixel) {
      setScaleComparison(nextComparison);
      setStep(10);
      return;
    }

    setStep(9);
  }

  function formatScaleValue(value) {
    if (!Number.isFinite(value)) return "-";

    return `${value.toFixed(3)} mm/px`;
  }

  function getScaleComparisonMessage(difference) {
    if (!Number.isFinite(difference)) {
      return "De maatvoering is opnieuw gecontroleerd.";
    }

    if (difference <= 0.01) {
      return "Vrijwel gelijk. De maatvoering is opnieuw gecontroleerd.";
    }

    if (difference <= 0.1) {
      return "Kleine correctie toegepast.";
    }

    return "Er is een grotere afwijking gevonden. Controleer eventueel nog een tweede bekende maat.";
  }

  function goBack(targetStep) {
    if (backgroundCalibrationActive) {
      onCancelBackgroundCalibration();
    }

    setStep(targetStep);
  }

  function previousButton(targetStep) {
    return (
      <button
        className="roomsketch-wizard-back-button"
        onClick={() => goBack(targetStep)}
      >
        ← Vorige
      </button>
    );
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <>
            <h2>👋 Welkom bij Companion RoomSketch</h2>
            <p>Binnen enkele minuten teken je jouw eigen woning op de computer.</p>
            <p>Daarvoor heb je geen ervaring met tekenprogramma's nodig.</p>
            <p>RoomSketch helpt je stap voor stap.</p>

            <button className="roomsketch-wizard-button" onClick={() => setStep(2)}>
              Begin
            </button>
          </>
        );

      case 2:
        return (
          <>
            <h2>Stap 1 - Plattegrond kiezen</h2>
            <p>Importeer de plattegrond van jouw woning.</p>
            <p>Dat mag een SVG, PNG, JPG of PDF zijn.</p>

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

            {previousButton(1)}
          </>
        );

      case 3:
        return (
          <>
            <h2>✅ Bouwtekening geïmporteerd</h2>
            <p>Je bouwtekening staat klaar.</p>
            <p>Nu zorgen we ervoor dat alle maten kloppen.</p>

            <button className="roomsketch-wizard-button" onClick={() => setStep(4)}>
              Volgende →
            </button>

            {previousButton(2)}
          </>
        );

      case 4:
        return (
          <>
            <h2>Bouwtekening op maat zetten</h2>
            <p>We zetten de bouwtekening één keer op maat.</p>
            <p>
              Daarna kun je erop vertrouwen dat jouw meubels straks precies
              passen in jouw plattegrond.
            </p>

            <button className="roomsketch-wizard-button" onClick={() => setStep(5)}>
              Volgende →
            </button>

            {previousButton(3)}
          </>
        );

      case 5:
        return (
          <>
            <h2>Stap 2 - Meet een bekende afstand</h2>
            <p>Kies bij voorkeur een grote kamer.</p>
            <p>Hoe groter de afstand, hoe nauwkeuriger de meting.</p>
            <p>Zoom gerust eerst even in.</p>

            <div className="roomsketch-wizard-tip">
              <strong>Tip</strong>
              <span>Muiswiel = in- en uitzoomen.</span>
              <span>Spatiebalk ingedrukt houden = canvas verschuiven.</span>
            </div>

            <button className="roomsketch-wizard-button" onClick={() => setStep(6)}>
              Volgende →
            </button>

            {previousButton(4)}
          </>
        );

      case 6:
        return (
          <>
            <h2>Stap 3 - Afstand kiezen</h2>
            <p>Klik twee tegenover elkaar liggende muren aan.</p>

            <button
              className="roomsketch-wizard-button"
              onClick={() => {
                onStartBackgroundCalibration();
                setStep(7);
              }}
            >
              Volgende →
            </button>

            {previousButton(5)}
          </>
        );

      case 7:
        return (
          <>
            <h2>
              {backgroundCalibrationPointCount > 0
                ? "Kies de tegenoverliggende muur"
                : "Kies de eerste muur"}
            </h2>
            <p>
              {backgroundCalibrationPointCount > 0
                ? "Klik op de binnenkant van de muur er recht tegenover."
                : "Klik op de binnenkant van de eerste muur."}
            </p>

            {backgroundCalibrationActive && (
              <p className="roomsketch-wizard-status">
                {backgroundCalibrationPointCount > 0
                  ? "Punt A is gekozen."
                  : "Ik wacht op je eerste klik."}
              </p>
            )}

            {previousButton(6)}
          </>
        );

      case 8:
        return (
          <>
            <h2>Stap 4 - Werkelijke afstand</h2>
            <p>Voer hieronder de lengte in die op de plattegrond staat.</p>
            <p>Gebruik millimeters.</p>
            <p>Voorbeeld:</p>
            <p className="roomsketch-wizard-example">4074</p>

            <label className="roomsketch-wizard-field">
              <span>Werkelijke lengte in mm</span>
              <input
                ref={distanceInputRef}
                inputMode="numeric"
                value={realDistanceMm}
                onChange={(event) => setRealDistanceMm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyDistance();
                  }
                }}
                placeholder="4074"
              />
            </label>

            <button
              className="roomsketch-wizard-button"
              onClick={applyDistance}
              disabled={!canApplyDistance}
            >
              Volgende →
            </button>

            {previousButton(6)}
          </>
        );

      case 9:
        return (
          <>
            <h2>🎉 Klaar!</h2>
            <p>Je bouwtekening staat nu op maat.</p>
            <p>Je kunt nu beginnen met tekenen.</p>

            <button className="roomsketch-wizard-button" onClick={startDrawing}>
              Begin met tekenen
            </button>
          </>
        );

      case 10: {
        const previousScale = scaleComparison?.previousScaleMmPerPixel;
        const newScale =
          scaleComparison?.newScaleMmPerPixel ?? backgroundScaleMmPerPixel;
        const difference =
          Number.isFinite(previousScale) && Number.isFinite(newScale)
            ? Math.abs(previousScale - newScale)
            : null;
        const isLargeDifference =
          Number.isFinite(difference) && difference > 0.1;

        return (
          <>
            <h2>✓ Bouwtekening opnieuw op maat gezet</h2>

            <div className="roomsketch-scale-comparison">
              <span>Vorige schaal</span>
              <strong>{formatScaleValue(previousScale)}</strong>
              <span className="roomsketch-scale-arrow">↓</span>
              <span>Nieuwe schaal</span>
              <strong>{formatScaleValue(newScale)}</strong>
              <span>Verschil</span>
              <strong>{formatScaleValue(difference)}</strong>
            </div>

            <p className="roomsketch-scale-interpretation">
              {isLargeDifference ? "⚠ " : "✓ "}
              {getScaleComparisonMessage(difference)}
            </p>

            <button className="roomsketch-wizard-button" onClick={startDrawing}>
              Begin met tekenen
            </button>
          </>
        );
      }

      default:
        return null;
    }
  }

  if (dismissed) return null;

  return (
    <div
      className={`roomsketch-wizard ${
        step === 7 && backgroundCalibrationActive ? "is-measuring-step" : ""
      }`}
      role="dialog"
      aria-live="polite"
    >
      {renderStep()}
    </div>
  );
}

export default RoomSketchWizard;
