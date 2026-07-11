import { useEffect, useState } from "react";

import "./Inspector.css";

function Inspector({
  measurement,
  calibration,
  backgroundScaleMmPerPixel,
  onCalibrate,
  selectedFurnitureId,
  furniture,
  onUpdateFurnitureSize,
  onUpdateFurnitureRotation = () => {},
  onDeleteSelectedFurniture,
  selectedWallId,
  walls = [],
  onUpdateWallSize = () => {},
  selectedObject,
  doors = [],
  openings = [],
  background,
  backgroundScaleCompleted,
  showFloorplan,
  rooms = [],
  selectedRoomId,
  selectedRoomIds = [],
  onUpdateRectangleRoomSize = () => {},
  onUpdateRectangleRoomWalls = () => {},
  onSetRoomLocked = () => {},
  onToggleDoorDirection = () => {},
  onToggleDoorSwing = () => {},
  onUpdateDoorSize = () => {},
  onConvertOpeningToDoor = () => {},
  onConvertDoorToOpening = () => {},
  onToggleFloorplan = () => {},
  onStartBackgroundReplaceWorkflow = () => {},
  onStartBackgroundResizeWorkflow = () => {},
}) {
  const [realDistanceMm, setRealDistanceMm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [depthCm, setDepthCm] = useState("");
  const [rotationDegrees, setRotationDegrees] = useState("");
  const [wallLengthMm, setWallLengthMm] = useState("");
  const [wallThicknessMm, setWallThicknessMm] = useState("");
  const [wallColor, setWallColor] = useState("#374151");
  const [roomLengthMm, setRoomLengthMm] = useState("");
  const [roomWidthMm, setRoomWidthMm] = useState("");
  const [roomWallThicknessMm, setRoomWallThicknessMm] = useState("");
  const [roomWallColor, setRoomWallColor] = useState("#374151");
  const [doorWidthMm, setDoorWidthMm] = useState("");
  const [doorOpeningWidthMm, setDoorOpeningWidthMm] = useState("");

  const selectedFurniture = furniture.find(
    (item) => item.id === selectedFurnitureId,
  );
  const selectedWall = walls.find((wall) => wall.id === selectedWallId);
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
  const selectedRoomWalls = selectedRoom?.wallIds?.length
    ? walls.filter((wall) => selectedRoom.wallIds.includes(wall.id))
    : [];
  const firstSelectedRoomWall = selectedRoomWalls[0];
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

  const wallMmPerPixel = calibration?.mmPerPixel ?? 10;
  const selectedWallLengthMm = selectedWall
    ? Math.round(
        Math.sqrt(
          (selectedWall.endPoint.x - selectedWall.startPoint.x) ** 2 +
            (selectedWall.endPoint.y - selectedWall.startPoint.y) ** 2,
        ) * wallMmPerPixel,
      )
    : null;
  useEffect(() => {
    if (!selectedFurniture) {
      setWidthCm("");
      setDepthCm("");
      setRotationDegrees("");
      return;
    }

    setWidthCm(String(Math.round(selectedFurniture.widthMm)));
    setDepthCm(String(Math.round(selectedFurniture.depthMm)));
    setRotationDegrees(String(Math.round(selectedFurniture.rotation ?? 0)));
  }, [selectedFurniture]);

  useEffect(() => {
    if (!selectedWall) {
      setWallLengthMm("");
      setWallThicknessMm("");
      setWallColor("#374151");
      return;
    }

    setWallLengthMm(String(selectedWallLengthMm));
    setWallThicknessMm(String(Math.round(selectedWall.thicknessMm ?? 100)));
    setWallColor(selectedWall.color ?? "#374151");
  }, [selectedWall, selectedWallLengthMm]);

  useEffect(() => {
    if (!selectedRoom?.bounds) {
      setRoomLengthMm("");
      setRoomWidthMm("");
      setRoomWallThicknessMm("");
      setRoomWallColor("#374151");
      return;
    }

    setRoomLengthMm(String(selectedRoomLengthMm));
    setRoomWidthMm(String(selectedRoomWidthMm));
    setRoomWallThicknessMm(
      String(Math.round(firstSelectedRoomWall?.thicknessMm ?? 100)),
    );
    setRoomWallColor(firstSelectedRoomWall?.color ?? "#374151");
  }, [
    selectedRoom?.id,
    selectedRoomLengthMm,
    selectedRoomWidthMm,
    firstSelectedRoomWall?.id,
    firstSelectedRoomWall?.thicknessMm,
    firstSelectedRoomWall?.color,
  ]);

  useEffect(() => {
    if (!selectedDoor) {
      setDoorWidthMm("");
      setDoorOpeningWidthMm("");
      return;
    }

    setDoorWidthMm(String(Math.round(selectedDoor.doorWidthMm ?? selectedDoor.widthMm ?? 900)));
    setDoorOpeningWidthMm(
      String(
        Math.round(
          selectedDoor.sparingWidthMm ??
            selectedDoor.doorWidthMm ??
            selectedDoor.widthMm ??
            900,
        ),
      ),
    );
  }, [selectedDoor]);

  function handleUseAsScale() {
    if (!hasRealDistance) return;
    onCalibrate(enteredDistance);
  }

  function handleSaveFurnitureSize() {
    if (!selectedFurniture) return;

    onUpdateFurnitureSize(selectedFurniture.id, {
      widthMm: Number(widthCm),
      depthMm: Number(depthCm),
    });
  }

  function handleSaveFurnitureRotation(value = rotationDegrees) {
    if (!selectedFurniture) return;

    onUpdateFurnitureRotation(selectedFurniture.id, Number(value));
  }

  function formatDecimal(value) {
    return value.toFixed(1).replace(".", ",");
  }

  function formatScaleValue(value) {
    if (!Number.isFinite(value)) return null;

    return `${value.toFixed(3)} mm/px`;
  }

  function updateSelectedRoomSize(nextValues) {
    if (!selectedRoom?.bounds) return;
    if (selectedRoom.locked) return;

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

  function updateSelectedRoomWalls(nextValues) {
    if (!selectedRoom?.wallIds?.length) return;
    if (selectedRoom.locked) return;

    const nextThicknessMm = Number(
      String(nextValues.thicknessMm ?? roomWallThicknessMm).replace(",", "."),
    );
    const nextColor = nextValues.color ?? roomWallColor;

    onUpdateRectangleRoomWalls(selectedRoom.id, {
      thicknessMm: nextThicknessMm,
      color: nextColor,
    });
  }

  function updateSelectedWallSize(nextValues) {
    if (!selectedWall) return;

    const nextLengthMm = Number(
      String(nextValues.lengthMm ?? wallLengthMm).replace(",", "."),
    );
    const nextThicknessMm = Number(
      String(nextValues.thicknessMm ?? wallThicknessMm).replace(",", "."),
    );
    const nextColor = nextValues.color ?? wallColor;

    if (!Number.isFinite(nextLengthMm) || !Number.isFinite(nextThicknessMm)) {
      return;
    }

    onUpdateWallSize(selectedWall.id, {
      lengthMm: nextLengthMm,
      thicknessMm: nextThicknessMm,
      color: nextColor,
    });
  }

  function updateSelectedDoorSize(nextValues) {
    if (!selectedDoor) return;

    const nextDoorWidthMm = Number(
      String(nextValues.doorWidthMm ?? doorWidthMm).replace(",", "."),
    );
    const nextOpeningWidthMm = Number(
      String(nextValues.sparingWidthMm ?? doorOpeningWidthMm).replace(",", "."),
    );

    if (!Number.isFinite(nextDoorWidthMm) || nextDoorWidthMm <= 0) return;
    if (!Number.isFinite(nextOpeningWidthMm) || nextOpeningWidthMm <= 0) return;

    onUpdateDoorSize(selectedDoor.id, {
      doorWidthMm: nextDoorWidthMm,
      sparingWidthMm: nextOpeningWidthMm,
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

            <button
              className="primary-button"
              onClick={onStartBackgroundResizeWorkflow}
            >
              📏 Opnieuw op maat zetten
            </button>

            <button
              className="primary-button"
              onClick={onStartBackgroundReplaceWorkflow}
            >
              📂 Andere bouwtekening kiezen
            </button>

            <button className="primary-button" onClick={onToggleFloorplan}>
              {showFloorplan
                ? "👁 Bouwtekening verbergen"
                : "👁 Bouwtekening tonen"}
            </button>

            {backgroundScaleCompleted && backgroundScaleMmPerPixel && (
              <div className="current-scale-reference">
                <h4>Huidige schaal</h4>
                <p>✓ Bouwtekening staat op maat</p>
                <strong>{formatScaleValue(backgroundScaleMmPerPixel)}</strong>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="muted">Importeer eerst een bouwtekening.</p>

            <button
              className="primary-button"
              onClick={onStartBackgroundReplaceWorkflow}
            >
              📂 Andere bouwtekening kiezen
            </button>
          </>
        )}
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

          {selectedRoom.locked ? (
            <p className="muted">Deze ruimte staat op slot.</p>
          ) : (
            <>
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

              <label className="field-label">
                Muurdikte
                <input
                  inputMode="numeric"
                  value={roomWallThicknessMm}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setRoomWallThicknessMm(nextValue);
                    updateSelectedRoomWalls({ thicknessMm: nextValue });
                  }}
                  placeholder="bijv. 100 mm"
                />
              </label>

              <label className="field-label">
                Muurkleur
                <div className="color-field">
                  <input
                    type="color"
                    value={roomWallColor}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setRoomWallColor(nextValue);
                      updateSelectedRoomWalls({ color: nextValue });
                    }}
                    aria-label="Muurkleur"
                  />
                  <span>{roomWallColor}</span>
                </div>
              </label>
            </>
          )}

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

      {selectedWall && (
        <section className="inspector-section">
          <h3>Geselecteerde muur</h3>

          <label className="field-label">
            Lengte
            <input
              inputMode="numeric"
              value={wallLengthMm}
              onChange={(e) => {
                const nextValue = e.target.value;
                setWallLengthMm(nextValue);
                updateSelectedWallSize({ lengthMm: nextValue });
              }}
              placeholder="bijv. 3200 mm"
            />
          </label>

          <label className="field-label">
            Dikte
            <input
              inputMode="numeric"
              value={wallThicknessMm}
              onChange={(e) => {
                const nextValue = e.target.value;
                setWallThicknessMm(nextValue);
                updateSelectedWallSize({ thicknessMm: nextValue });
              }}
              placeholder="bijv. 100 mm"
            />
          </label>

          <label className="field-label">
            Kleur
            <div className="color-field">
              <input
                type="color"
                value={wallColor}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setWallColor(nextValue);
                  updateSelectedWallSize({ color: nextValue });
                }}
                aria-label="Muurkleur"
              />
              <span>{wallColor}</span>
            </div>
          </label>
        </section>
      )}

      <section className="inspector-section">
        <h3>Geselecteerd meubel</h3>

        {selectedFurniture ? (
          <>
            <strong>{selectedFurniture.name}</strong>

            <label className="field-label">
              Breedte (mm)
              <input
                inputMode="numeric"
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
              />
            </label>

            <label className="field-label">
              Diepte (mm)
              <input
                inputMode="numeric"
                value={depthCm}
                onChange={(e) => setDepthCm(e.target.value)}
              />
            </label>

            <label className="field-label">
              Rotatie
              <input
                inputMode="numeric"
                value={rotationDegrees}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setRotationDegrees(nextValue);
                  handleSaveFurnitureRotation(nextValue);
                }}
              />
            </label>

            <div className="inspector-button-row">
              <button
                className="secondary-button"
                onClick={() =>
                  handleSaveFurnitureRotation(
                    (selectedFurniture.rotation ?? 0) - 15,
                  )
                }
              >
                Linksom
              </button>
              <button
                className="secondary-button"
                onClick={() =>
                  handleSaveFurnitureRotation(
                    (selectedFurniture.rotation ?? 0) + 15,
                  )
                }
              >
                Rechtsom
              </button>
            </div>

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

            <label className="field-label">
              Deurbladbreedte
              <input
                inputMode="numeric"
                value={doorWidthMm}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setDoorWidthMm(nextValue);
                  updateSelectedDoorSize({ doorWidthMm: nextValue });
                }}
                placeholder="bijv. 830 mm"
              />
            </label>

            <label className="field-label">
              Openingbreedte
              <input
                inputMode="numeric"
                value={doorOpeningWidthMm}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setDoorOpeningWidthMm(nextValue);
                  updateSelectedDoorSize({ sparingWidthMm: nextValue });
                }}
                placeholder="bijv. 930 mm"
              />
            </label>

            <div className="door-direction-controls">
              <strong>Deurstand</strong>
              <p className="muted">
                Combineer beide keuzes voor de vier mogelijke deurstanden.
              </p>

              <button
                className="primary-button"
                onClick={() => onToggleDoorSwing(selectedDoor.id)}
              >
                Scharnier naar andere kant
              </button>

              <button
                className="primary-button"
                onClick={() => onToggleDoorDirection(selectedDoor.id)}
              >
                Deur naar andere zijde openen
              </button>
            </div>

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
