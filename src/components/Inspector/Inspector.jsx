import { useEffect, useState } from "react";

import "./Inspector.css";

function Inspector({
  measurement,
  calibration,
  onCalibrate,
  selectedFurnitureId,
  furniture,
  onUpdateFurnitureSize,
  onDeleteSelectedFurniture,
  selectedObject,
  doors = [],
  openings = [],
  onToggleDoorDirection = () => {},
  onConvertOpeningToDoor = () => {},
  onConvertDoorToOpening = () => {},
}) {
  const [realDistanceMm, setRealDistanceMm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [depthCm, setDepthCm] = useState("");

  const selectedFurniture = furniture.find(
    (item) => item.id === selectedFurnitureId,
  );

  const selectedDoor =
    selectedObject?.type === "door"
      ? doors.find((door) => door.id === selectedObject.id)
      : null;
  const selectedOpening =
    selectedObject?.type === "opening"
      ? openings.find((opening) => opening.id === selectedObject.id)
      : null;

  const hasValidCalibration =
    calibration?.mmPerPixel != null && !Number.isNaN(calibration.mmPerPixel);

  const measuredMm =
    hasValidCalibration && measurement.pixelDistance
      ? measurement.pixelDistance * calibration.mmPerPixel
      : null;

  const expectedMm = Number(realDistanceMm.replace(",", "."));
  const hasExpectedMm = expectedMm > 0 && !Number.isNaN(expectedMm);

  const differenceMm =
    measuredMm != null && hasExpectedMm ? measuredMm - expectedMm : null;

  const differencePercent =
    differenceMm != null && hasExpectedMm
      ? Math.abs(differenceMm / expectedMm) * 100
      : null;

  useEffect(() => {
    if (!selectedFurniture) {
      setWidthCm("");
      setDepthCm("");
      return;
    }

    setWidthCm(String(Math.round(selectedFurniture.widthMm / 10)));
    setDepthCm(String(Math.round(selectedFurniture.depthMm / 10)));
  }, [selectedFurniture]);

  function handleCalibrate() {
    if (!hasExpectedMm) return;
    onCalibrate(expectedMm);
  }

  function handleSaveFurnitureSize() {
    if (!selectedFurniture) return;

    onUpdateFurnitureSize(selectedFurniture.id, {
      widthMm: Number(widthCm) * 10,
      depthMm: Number(depthCm) * 10,
    });
  }

  function getScaleCheckText() {
    if (differencePercent == null) return "";

    if (differencePercent <= 1) return "🟢 Uitstekend";
    if (differencePercent <= 3) return "🟠 Bruikbaar";
    return "🔴 Controleer opnieuw";
  }

  return (
    <aside className="inspector">
      <h2>Eigenschappen</h2>

      <section className="inspector-section">
        <h3>📏 Afstand meten</h3>

        <div className="info-row">
          <span>Gemeten afstand</span>
          <strong>
            {measurement.pixelDistance
              ? `${Math.round(measurement.pixelDistance)} px`
              : "Nog geen meting"}
          </strong>
        </div>

        <label className="field-label">
          Hoe lang is dit in het echt? (mm)
          <input
            value={realDistanceMm}
            onChange={(e) => setRealDistanceMm(e.target.value)}
            placeholder="bijv. 7555"
          />
        </label>

        <button
          className="primary-button"
          onClick={handleCalibrate}
          disabled={!measurement.pixelDistance || !hasExpectedMm}
        >
          Gebruik als schaal
        </button>
      </section>

      <section className="inspector-section">
        <h3>📐 Schaalcontrole</h3>

        {hasValidCalibration ? (
          <>
            <p className="muted">De plattegrond staat op schaal.</p>

            <div className="info-row">
              <span>Schaal</span>
              <strong>{calibration.mmPerPixel.toFixed(3)} mm/px</strong>
            </div>

            {measuredMm != null &&
            hasExpectedMm &&
            differencePercent != null ? (
              <>
                <div className="info-row">
                  <span>Volgens huidige schaal</span>
                  <strong>{Math.round(measuredMm)} mm</strong>
                </div>

                <div className="info-row">
                  <span>Verwachte maat</span>
                  <strong>{Math.round(expectedMm)} mm</strong>
                </div>

                <div className="info-row">
                  <span>Verschil</span>
                  <strong>
                    {Math.round(differenceMm)} mm /{" "}
                    {differencePercent.toFixed(2)}%
                  </strong>
                </div>

                <p className="muted">{getScaleCheckText()}</p>
              </>
            ) : (
              <p className="muted">
                Meet een tweede bekende afstand en vul de echte maat in om te
                controleren.
              </p>
            )}
          </>
        ) : (
          <p className="muted">
            Meet eerst een bekende afstand en klik op Gebruik als schaal.
          </p>
        )}
      </section>

      <section className="inspector-section">
        <h3>🛋️ Geselecteerd meubel</h3>

        {selectedFurniture ? (
          <>
            <strong>{selectedFurniture.name}</strong>

            <label className="field-label">
              Breedte in cm
              <input
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
              />
            </label>

            <label className="field-label">
              Diepte in cm
              <input
                value={depthCm}
                onChange={(e) => setDepthCm(e.target.value)}
              />
            </label>

            <button
              className="primary-button"
              onClick={handleSaveFurnitureSize}
            >
              Afmetingen toepassen
            </button>

            <button
              className="danger-button"
              onClick={onDeleteSelectedFurniture}
            >
              Verwijder meubel
            </button>
          </>
        ) : (
          <p className="muted">Klik op een meubel om het te selecteren.</p>
        )}
      </section>
      <section className="inspector-section">
        <h3>🚪 Geselecteerde deur</h3>

        {selectedDoor ? (
          <>
            <div className="info-row">
              <span>Deurblad</span>
              <strong>{selectedDoor.doorWidthMm ?? selectedDoor.widthMm} mm</strong>
            </div>

            <button
              className="primary-button"
              onClick={() => onToggleDoorDirection(selectedDoor.id)}
            >
              Draairichting wisselen
            </button>

            {selectedDoor.openingId && (
              <button
                className="primary-button"
                onClick={() => onConvertDoorToOpening(selectedDoor.id)}
              >
                Terug naar open doorgang
              </button>
            )}
          </>
        ) : selectedOpening ? (
          <>
            <div className="info-row">
              <span>Opening</span>
              <strong>{selectedOpening.widthMm} mm</strong>
            </div>

            <button
              className="primary-button"
              onClick={() => onConvertOpeningToDoor(selectedOpening.id)}
            >
              Omzetten naar draaideur
            </button>
          </>
        ) : (
          <p className="muted">Klik op een deur of open doorgang.</p>
        )}
      </section>
    </aside>
  );
}

export default Inspector;
