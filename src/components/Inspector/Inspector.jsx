import { useEffect, useRef, useState } from "react";

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
  background,
  showFloorplan,
  backgroundCalibrationActive,
  backgroundRoomAlignActive,
  backgroundCalibrationMeasurement,
  rooms = [],
  selectedRoomId,
  selectedRoomIds = [],
  onUpdateRectangleRoomSize = () => {},
  onSetRoomLocked = () => {},
  onToggleDoorDirection = () => {},
  onConvertOpeningToDoor = () => {},
  onConvertDoorToOpening = () => {},
  onUpdateBackground = () => {},
  onImportBackground = () => {},
  onRemoveBackground = () => {},
  onToggleFloorplan = () => {},
  onStartBackgroundCalibration = () => {},
  onApplyBackgroundCalibration = () => {},
  onStartBackgroundRoomAlign = () => {},
  onSelectBackground = () => {},
}) {
  const backgroundFileInputRef = useRef(null);
  const [realDistanceMm, setRealDistanceMm] = useState("");
  const [backgroundDistanceMm, setBackgroundDistanceMm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [depthCm, setDepthCm] = useState("");
  const [roomLengthMm, setRoomLengthMm] = useState("");
  const [roomWidthMm, setRoomWidthMm] = useState("");

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
  const selectedRoomIdsForReference = selectedRoomIds.length
    ? selectedRoomIds
    : selectedRoomId
      ? [selectedRoomId]
      : [];
  const selectedRoom =
    selectedRoomIdsForReference.length === 1
      ? rooms.find((room) => room.id === selectedRoomIdsForReference[0])
      : null;
  const roomMmPerPixel = calibration?.mmPerPixel ?? 10;
  const selectedRoomLengthMm =
    selectedRoom?.bounds?.width != null
      ? Math.round(selectedRoom.bounds.width * roomMmPerPixel)
      : null;
  const selectedRoomWidthMm =
    selectedRoom?.bounds?.height != null
      ? Math.round(selectedRoom.bounds.height * roomMmPerPixel)
      : null;
  const selectedRoomAreaM2 =
    selectedRoomLengthMm != null && selectedRoomWidthMm != null
      ? (selectedRoomLengthMm * selectedRoomWidthMm) / 1_000_000
      : null;
  const selectedRoomVolumeM3 =
    selectedRoomAreaM2 != null ? selectedRoomAreaM2 * 2.64 : null;

  const enteredDistance = Number(realDistanceMm.replace(",", "."));
  const hasRealDistance =
    Number.isFinite(enteredDistance) && enteredDistance > 0;
  const measuredDistanceText =
    measurement.pixelDistance && calibration?.mmPerPixel
      ? `${Math.round(measurement.pixelDistance * calibration.mmPerPixel)} mm`
      : "Nog geen meting";
  const enteredBackgroundDistance = Number(
    backgroundDistanceMm.replace(",", "."),
  );
  const hasBackgroundDistance =
    Number.isFinite(enteredBackgroundDistance) && enteredBackgroundDistance > 0;
  const backgroundMeasuredDistanceMm =
    backgroundCalibrationMeasurement?.pixelDistance && calibration?.mmPerPixel
      ? Math.round(
          backgroundCalibrationMeasurement.pixelDistance *
            calibration.mmPerPixel,
        )
      : null;
  const backgroundDistanceDeltaMm =
    backgroundMeasuredDistanceMm != null && hasBackgroundDistance
      ? Math.round(enteredBackgroundDistance - backgroundMeasuredDistanceMm)
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

  useEffect(() => {
    if (!selectedRoom?.bounds) {
      setRoomLengthMm("");
      setRoomWidthMm("");
      return;
    }

    setRoomLengthMm(String(selectedRoomLengthMm));
    setRoomWidthMm(String(selectedRoomWidthMm));
  }, [selectedRoom?.id, selectedRoomLengthMm, selectedRoomWidthMm, selectedRoom]);

  function handleUseAsScale() {
    if (!hasRealDistance) return;
    onCalibrate(enteredDistance);
  }

  function handleSetBackgroundScale() {
    if (!hasBackgroundDistance) return;

    onApplyBackgroundCalibration(enteredBackgroundDistance);
    setBackgroundDistanceMm("");
  }

  function handleSaveFurnitureSize() {
    if (!selectedFurniture) return;

    onUpdateFurnitureSize(selectedFurniture.id, {
      widthMm: Number(widthCm) * 10,
      depthMm: Number(depthCm) * 10,
    });
  }

  function formatDecimal(value) {
    return value.toFixed(1).replace(".", ",");
  }

  function updateSelectedRoomSize(nextValues) {
    if (!selectedRoom?.bounds) return;

    const nextLengthMm = Number(
      String(nextValues.lengthMm ?? roomLengthMm).replace(",", "."),
    );
    const nextWidthMm = Number(
      String(nextValues.widthMm ?? roomWidthMm).replace(",", "."),
    );

    if (!Number.isFinite(nextLengthMm) || !Number.isFinite(nextWidthMm)) {
      return;
    }

    onUpdateRectangleRoomSize(selectedRoom.id, {
      lengthMm: nextLengthMm,
      widthMm: nextWidthMm,
    });
  }

  return (
    <aside className="inspector">
      <h2>Eigenschappen</h2>

      <section className="inspector-section">
        <h3>Bouwtekening</h3>

        {background ? (
          <>
            <div className="info-row">
              <span>Bestand</span>
              <strong>{background.name ?? background.type}</strong>
            </div>

            <label className="field-label">
              Transparantie
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round((background.opacity ?? 0.5) * 100)}
                onChange={(e) =>
                  onUpdateBackground({
                    opacity: Number(e.target.value) / 100,
                  })
                }
              />
            </label>

            <button
              className="primary-button"
              onClick={() => backgroundFileInputRef.current?.click()}
            >
              📂 Andere bouwtekening kiezen
            </button>

            <button
              className="primary-button"
              onClick={() => onUpdateBackground({ locked: !background.locked })}
            >
              {background.locked
                ? "Bouwtekening ontgrendelen"
                : "Bouwtekening vastzetten"}
            </button>

            <button className="primary-button" onClick={onToggleFloorplan}>
              {showFloorplan
                ? "👁 Bouwtekening verbergen"
                : "👁 Bouwtekening tonen"}
            </button>

            <button
              className="primary-button"
              onClick={() => {
                onSelectBackground();
                onStartBackgroundCalibration();
              }}
            >
              📏 Afstand kiezen
            </button>

            <button
              className="primary-button"
              onClick={handleSetBackgroundScale}
              disabled={!backgroundCalibrationMeasurement || !hasBackgroundDistance}
            >
              📏 Opnieuw op maat zetten
            </button>

            {backgroundCalibrationActive && (
              <p className="muted">
                Klik twee punten aan op een bekende afstand.
              </p>
            )}

            {backgroundCalibrationMeasurement && (
              <>
                <div className="info-row">
                  <span>Volgens huidige schaal</span>
                  <strong>{backgroundMeasuredDistanceMm} mm</strong>
                </div>

                <label className="field-label">
                  Bekende afstand in millimeters
                  <input
                    inputMode="numeric"
                    value={backgroundDistanceMm}
                    onChange={(e) => setBackgroundDistanceMm(e.target.value)}
                    placeholder="Bijvoorbeeld 4074"
                  />
                </label>

                {backgroundDistanceDeltaMm != null && (
                  <div className="info-row">
                    <span>Verschil</span>
                    <strong>
                      {backgroundDistanceDeltaMm > 0 ? "+" : ""}
                      {backgroundDistanceDeltaMm} mm
                    </strong>
                  </div>
                )}
              </>
            )}

            {selectedRoom?.bounds && (
              <>
                <div className="info-row inspector-subtle-row">
                  <span>Referentieruimte</span>
                  <strong>{selectedRoom.name}</strong>
                </div>

                <button
                  className="primary-button"
                  onClick={onStartBackgroundRoomAlign}
                >
                  Gebruik deze ruimte als referentie
                </button>

                {backgroundRoomAlignActive && (
                  <p className="muted">
                    Klik in dezelfde ruimte op de bouwtekening.
                  </p>
                )}
              </>
            )}

            <button
              className="primary-button inspector-destructive-button"
              onClick={onRemoveBackground}
            >
              🗑 Bouwtekening verwijderen
            </button>
          </>
        ) : (
          <>
            <p className="muted">Importeer eerst een bouwtekening.</p>

            <button
              className="primary-button"
              onClick={() => backgroundFileInputRef.current?.click()}
            >
              📂 Andere bouwtekening kiezen
            </button>
          </>
        )}

        <input
          ref={backgroundFileInputRef}
          type="file"
          accept="image/svg+xml,image/png,image/jpeg,application/pdf,.svg,.png,.jpg,.jpeg,.pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            onImportBackground(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </section>

      {selectedRoom?.bounds && (
        <section className="inspector-section">
          <h3>Geselecteerde ruimte</h3>

          <div className="info-row">
            <span>Naam</span>
            <strong>{selectedRoom.name}</strong>
          </div>

          <button
            className="primary-button"
            onClick={() => onSetRoomLocked(selectedRoom.id, !selectedRoom.locked)}
          >
            {selectedRoom.locked
              ? "Ruimte ontgrendelen"
              : "Ruimte vergrendelen"}
          </button>

          <label className="field-label">
            Lengte
            <input
              inputMode="numeric"
              value={roomLengthMm}
              onChange={(e) => {
                const nextValue = e.target.value;
                setRoomLengthMm(nextValue);
                updateSelectedRoomSize({ lengthMm: nextValue });
              }}
              placeholder="bijv. 7555 mm"
            />
          </label>

          <label className="field-label">
            Breedte
            <input
              inputMode="numeric"
              value={roomWidthMm}
              onChange={(e) => {
                const nextValue = e.target.value;
                setRoomWidthMm(nextValue);
                updateSelectedRoomSize({ widthMm: nextValue });
              }}
              placeholder="bijv. 4074 mm"
            />
          </label>

          {selectedRoomAreaM2 != null && selectedRoomVolumeM3 != null && (
            <>
              <div className="info-row">
                <span>Oppervlakte</span>
                <strong>{formatDecimal(selectedRoomAreaM2)} m²</strong>
              </div>

              <div className="info-row">
                <span>Inhoud</span>
                <strong>{formatDecimal(selectedRoomVolumeM3)} m³</strong>
              </div>
            </>
          )}
        </section>
      )}

      {!background && (
        <section className="inspector-section">
          <h3>Afstand meten</h3>

          {!measurement.pixelDistance ? (
            <p className="muted">
              Meet eerst een bekende afstand op de bouwtekening.
            </p>
          ) : (
            <div className="info-row">
              <span>Gemeten afstand</span>
              <strong>{measuredDistanceText}</strong>
            </div>
          )}

          <label className="field-label">
            Werkelijke lengte
            <input
              value={realDistanceMm}
              onChange={(e) => setRealDistanceMm(e.target.value)}
              placeholder="bijv. 4074 mm"
            />
          </label>

          <button
            className="primary-button"
            onClick={handleUseAsScale}
            disabled={!measurement.pixelDistance || !hasRealDistance}
          >
            Zet bouwtekening op maat
          </button>
        </section>
      )}

      <section className="inspector-section">
        <h3>Geselecteerd meubel</h3>

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
        <h3>Geselecteerde deur</h3>

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
