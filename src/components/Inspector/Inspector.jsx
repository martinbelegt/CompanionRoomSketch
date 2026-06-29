import { useState } from "react";

import "./Inspector.css";

function Inspector({ measurement, calibration, onCalibrate }) {
  const [realDistanceMm, setRealDistanceMm] = useState("");

  function handleCalibrate() {
    onCalibrate(Number(realDistanceMm));
  }

  return (
    <aside className="inspector">
      <h2>Eigenschappen</h2>

      <section className="inspector-section">
        <h3>📏 Meting</h3>

        <div className="info-row">
          <span>Gemeten afstand</span>
          <strong>
            {measurement.pixelDistance
              ? `${Math.round(measurement.pixelDistance)} px`
              : "Nog geen meting"}
          </strong>
        </div>

        <label className="field-label">
          Werkelijke afstand in mm
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
          Kalibreren
        </button>
      </section>

      <section className="inspector-section">
        <h3>⚙️ Kalibratie</h3>

        {calibration ? (
          <>
            <div className="info-row">
              <span>Pixels</span>
              <strong>{Math.round(calibration.pixels)}</strong>
            </div>

            <div className="info-row">
              <span>Millimeters</span>
              <strong>{calibration.millimeters}</strong>
            </div>

            <div className="info-row">
              <span>mm per pixel</span>
              <strong>{calibration.mmPerPixel.toFixed(3)}</strong>
            </div>
          </>
        ) : (
          <p className="muted">Nog niet gekalibreerd.</p>
        )}
      </section>
    </aside>
  );
}

export default Inspector;
