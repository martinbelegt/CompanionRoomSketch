import "./Canvas.css";

import CanvasEngine from "../CanvasEngine/CanvasEngine";

function Canvas({ furniture, onMoveFurniture }) {
  return (
    <CanvasEngine furniture={furniture} onMoveFurniture={onMoveFurniture} />
  );
}

export default Canvas;
