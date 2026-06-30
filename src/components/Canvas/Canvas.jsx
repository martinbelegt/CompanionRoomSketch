import "./Canvas.css";

import CanvasEngine from "../CanvasEngine/CanvasEngine";

function Canvas({
  furniture,
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
}) {
  return (
    <CanvasEngine
      furniture={furniture}
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
    />
  );
}

export default Canvas;
