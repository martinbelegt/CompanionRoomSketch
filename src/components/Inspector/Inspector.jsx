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
}) {
  const [realDistanceMm, setRealDistanceMm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [depthCm, setDepthCm] = useState("");

  const selectedFurniture = furniture.find(
    (item) => item.id === selectedFurnitureId,
  );

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
    onCalibrate(Number(realDistanceMm));
  }

  function handleSaveFurnitureSize() {
    if (!selectedFurniture) return;

    onUpdateFurnitureSize(selectedFurniture.id, {
      widthMm: Number(widthCm) * 10,
      depthMm: Number(depthCm) * 10,
    });
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
          disabled={!measurement.pixelDistance || !realDistanceMm}
        >
          Gebruik deze maat
        </button>
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
        <h3>⚙️ Schaal</h3>

        {calibration ? (
          <p className="muted">De plattegrond staat op schaal.</p>
        ) : (
          <p className="muted">
            Meet eerst een bekende afstand op de plattegrond.
          </p>
        )}
      </section>
    </aside>
  );
}

export default Inspector;
