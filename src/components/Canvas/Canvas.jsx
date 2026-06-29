import "./Canvas.css";

import CanvasEngine from "../CanvasEngine/CanvasEngine";

function Canvas({
  furniture,
  onMoveFurniture,
  measurement,
  onMeasurementChange,
}) {
  return (
    <CanvasEngine
      furniture={furniture}
      onMoveFurniture={onMoveFurniture}
      measurement={measurement}
      onMeasurementChange={onMeasurementChange}
    />
  );
}

export default Canvas;
