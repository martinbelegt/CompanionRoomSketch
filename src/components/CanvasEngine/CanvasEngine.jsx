import { useState } from "react";

import "./CanvasEngine.css";

import { Stage, Layer } from "react-konva";
import CursorLayer from "./Layers/CursorLayer";

function CanvasEngine() {
  const [cursor, setCursor] = useState({
    x: 100,
    y: 100,
  });

  function handleStageClick(e) {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    setCursor(pointer);
  }

  return (
    <div className="canvas-engine">
      <Stage width={900} height={900} onClick={handleStageClick}>
        <Layer>
          <CursorLayer cursor={cursor} onMove={setCursor} />
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasEngine;
