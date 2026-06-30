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
    />
  );
}

export default Canvas;
