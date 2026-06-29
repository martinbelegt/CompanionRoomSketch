import { useState } from "react";

import "./CanvasEngine.css";

import { Stage, Layer } from "react-konva";
import CursorLayer from "./Layers/CursorLayer";
import FurnitureLayer from "./Layers/FurnitureLayer";

function CanvasEngine() {
  const [cursor, setCursor] = useState({
    x: 100,
    y: 100,
  });

  const [furniture, setFurniture] = useState([
    {
      id: "sofa-001",
      type: "sofa",
      name: "Bank",
      x: 260,
      y: 260,
      width: 220,
      height: 90,
    },
  ]);

  function handleStageClick(e) {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    setCursor(pointer);
  }

  function moveFurniture(id, position) {
    setFurniture((current) =>
      current.map((item) => (item.id === id ? { ...item, ...position } : item)),
    );
  }

  return (
    <div className="canvas-engine">
      <Stage width={900} height={900} onClick={handleStageClick}>
        <Layer>
          <FurnitureLayer furniture={furniture} onMove={moveFurniture} />
          <CursorLayer cursor={cursor} onMove={setCursor} />
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasEngine;
