import "./Canvas.css";

import CanvasEngine from "../CanvasEngine/CanvasEngine";

function Canvas({
  furniture,
  walls,
  doors,
  windows,
  addWall,
  addDoor,
  addWindow,
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
  onSelectTool,
  selectedObject,
  onSelectObject,
  onClearSelection,
  onUpdateDoorPosition,
  onUpdateWindowPosition,
  resetCanvasRequest,
  showWallDimensions,
}) {
  return (
    <CanvasEngine
      furniture={furniture}
      walls={walls}
      doors={doors}
      windows={windows}
      addWall={addWall}
      addDoor={addDoor}
      addWindow={addWindow}
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
      onSelectTool={onSelectTool}
      selectedObject={selectedObject}
      onSelectObject={onSelectObject}
      onClearSelection={onClearSelection}
      onUpdateDoorPosition={onUpdateDoorPosition}
      onUpdateWindowPosition={onUpdateWindowPosition}
      resetCanvasRequest={resetCanvasRequest}
      showWallDimensions={showWallDimensions}
    />
  );
}

export default Canvas;
