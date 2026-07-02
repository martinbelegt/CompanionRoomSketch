/**
 * ============================================================================
 * Companion RoomSketch
 * ============================================================================
 *
 * Bestand:
 * components/Canvas/Canvas.jsx
 *
 * Verantwoordelijkheid:
 * Verbindt AppLayout met CanvasEngine.
 *
 * Toekomst:
 * - Walls
 * - Rooms
 * - Dimensions
 * - Selectie
 * ============================================================================
 */

import "./Canvas.css";

import CanvasEngine from "../CanvasEngine/CanvasEngine";

function Canvas({
  furniture,
  walls,
  doors,
  addWall,
  addDoor,
  selectedFurnitureId,
  onSelectFurniture,
  onMoveFurniture,
  measurement,
  onMeasurementChange,
  calibration,
  activeTool,
  pendingFurniture,
  onPlaceFurniture,
  temporaryTool,
  onResizeFurniture,
  selectedWallId,
  onSelectWall,
  onUpdateWallPoint,
}) {
  return (
    <CanvasEngine
      furniture={furniture}
      walls={walls}
      doors={doors}
      addWall={addWall}
      addDoor={addDoor}
      selectedFurnitureId={selectedFurnitureId}
      onSelectFurniture={onSelectFurniture}
      onMoveFurniture={onMoveFurniture}
      measurement={measurement}
      onMeasurementChange={onMeasurementChange}
      calibration={calibration}
      activeTool={activeTool}
      pendingFurniture={pendingFurniture}
      onPlaceFurniture={onPlaceFurniture}
      temporaryTool={temporaryTool}
      onResizeFurniture={onResizeFurniture}
      selectedWallId={selectedWallId}
      onSelectWall={onSelectWall}
      onUpdateWallPoint={onUpdateWallPoint}
    />
  );
}

export default Canvas;
