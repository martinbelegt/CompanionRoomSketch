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
  backgroundCalibration,
  candidateBackgroundCalibration,
  onImportBackground,
  onStartBackgroundCalibration,
  onApplyBackgroundCalibration,
  onFinishBackgroundCalibrationChoice,
  onCancelBackgroundCalibration,
  onSelectTool,
  workflowRequest,
}) {
  const [step, setStep] = useState(1);
  const [dismissed, setDismissed] = useState(() => backgroundScaleCompleted);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [scaleComparison, setScaleComparison] = useState(null);
  const [realDistanceMm, setRealDistanceMm] = useState("");
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);
  const distanceInputRef = useRef(null);
  const previousBackgroundRef = useRef(background);
  const hasMeasuredDistance = Boolean(backgroundCalibrationMeasurement);
  const enteredDistance = Number(realDistanceMm.replace(",", "."));
  const canApplyDistance =
    hasMeasuredDistance && Number.isFinite(enteredDistance) && enteredDistance > 0;
  const showCalibrationComparison = Boolean(
    backgroundCalibration && candidateBackgroundCalibration,
  );

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
    setValidationError("");
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
    if (!canApplyDistance) {
      setValidationError("Vul een geldige, positieve afstand in millimeters in.");
      return;
    }

    const isResizeWorkflow =
      workflowRequest?.id === activeRequestId && workflowRequest.startStep === 5;
    const nextComparison = onApplyBackgroundCalibration(enteredDistance, {
      showComparison: isResizeWorkflow,
      previousScaleMmPerPixel: workflowRequest?.previousScaleMmPerPixel,
    });
    if (nextComparison?.error) {
      setValidationError(nextComparison.error);
      return;
    }

    setValidationError("");
    setRealDistanceMm("");

    if (nextComparison?.shouldShowComparison) {
      setScaleComparison(nextComparison);
      setStep(10);
      return;
    }

    setStep(9);
  }

  function formatScaleValue(value) {
    if (!Number.isFinite(value)) return "-";

    return `${value.toFixed(4).replace(".", ",")} mm per pixel`;
  }

  function formatPixelDistance(value) {
    return Number.isFinite(value)
      ? `${value.toFixed(2).replace(".", ",")} pixels`
      : "Niet beschikbaar";
  }

  function formatDistanceMm(value) {
    return Number.isFinite(value)
      ? `${new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 12 }).format(value)} mm`
      : "Niet beschikbaar";
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
    switch (showCalibrationComparison ? 10 : step) {
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
                inputMode="decimal"
                value={realDistanceMm}
                onChange={(event) => {
                  const value = event.target.value;
                  const parsedValue = Number(value.replace(",", "."));

                  setRealDistanceMm(value);
                  setValidationError(
                    value && (!Number.isFinite(parsedValue) || parsedValue <= 0)
                      ? "Vul een geldige, positieve afstand in millimeters in."
                      : "",
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyDistance();
                  }
                }}
                placeholder="4074"
              />
            </label>

            {validationError && (
              <p className="roomsketch-wizard-error" role="alert">
                {validationError}
              </p>
            )}

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
        const current =
          backgroundCalibration ?? scaleComparison?.currentCalibration;
        const candidate =
          candidateBackgroundCalibration ?? scaleComparison?.candidateCalibration;
        const previousScale = current?.mmPerPixel;
        const newScale = candidate?.mmPerPixel ?? backgroundScaleMmPerPixel;
        const difference = Number.isFinite(previousScale) && Number.isFinite(newScale)
          ? newScale - previousScale
          : null;
        const percentage = Number.isFinite(difference) && previousScale > 0
          ? (difference / previousScale) * 100
          : null;
        const isLargeDifference =
          Number.isFinite(difference) && Math.abs(difference) > 0.1;
        const signedDifference = Number.isFinite(difference)
          ? `${difference >= 0 ? "+" : ""}${difference.toFixed(4).replace(".", ",")} mm per pixel`
          : "-";
        const signedPercentage = Number.isFinite(percentage)
          ? `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2).replace(".", ",")}%`
          : "-";

        function closeComparison(applyCandidate) {
          onFinishBackgroundCalibrationChoice(applyCandidate);
          setActiveRequestId(null);
          setScaleComparison(null);
          setDismissed(true);
        }

        return (
          <>
            <h2>Kalibraties vergelijken</h2>

            <p>Bekijk het verschil en kies welke schaal actief blijft.</p>

            <div className="roomsketch-scale-comparison">
              <section>
                <h3>Huidige kalibratie</h3>
                <span>Gemeten pixelafstand</span>
                <strong>{formatPixelDistance(current?.pixelDistance)}</strong>
                <span>Werkelijke afstand</span>
                <strong>{formatDistanceMm(current?.realDistanceMm)}</strong>
                <span>Schaal</span>
                <strong>{formatScaleValue(previousScale)}</strong>
              </section>
              <section>
                <h3>Nieuwe meting</h3>
                <span>Gemeten pixelafstand</span>
                <strong>{formatPixelDistance(candidate?.pixelDistance)}</strong>
                <span>Werkelijke afstand</span>
                <strong>{formatDistanceMm(candidate?.realDistanceMm)}</strong>
                <span>Schaal</span>
                <strong>{formatScaleValue(newScale)}</strong>
              </section>
              <section className="roomsketch-scale-difference">
                <h3>Verschil</h3>
                <strong>{signedDifference} ({signedPercentage})</strong>
              </section>
            </div>

            <p className="roomsketch-scale-interpretation">
              {isLargeDifference ? "⚠ " : "✓ "}
              {getScaleComparisonMessage(Math.abs(difference))}
            </p>

            <div className="roomsketch-comparison-actions">
              <button
                className="roomsketch-wizard-button secondary"
                onClick={() => closeComparison(false)}
              >
                Huidige schaal behouden
              </button>
              <button
                className="roomsketch-wizard-button"
                onClick={() => closeComparison(true)}
              >
                Nieuwe schaal toepassen
              </button>
              <button
                className="roomsketch-wizard-cancel-button"
                onClick={() => closeComparison(false)}
              >
                Annuleren
              </button>
            </div>
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
