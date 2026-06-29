import { useState } from "react";

import "./CanvasEngine.css";

import { Stage, Layer } from "react-konva";
import useCanvasSize from "../../hooks/useCanvasSize";
import useCanvasCamera from "./Hooks/useCanvasCamera";

import CursorLayer from "./Layers/CursorLayer";
import FurnitureLayer from "./Layers/FurnitureLayer";
import FloorplanLayer from "./Layers/FloorplanLayer";
import MeasurementLayer from "./Layers/MeasurementLayer";

function getDistance(pointA, pointB) {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function CanvasEngine({
  furniture,
  onMoveFurniture,
  measurement,
  onMeasurementChange,
}) {
  const { containerRef, width, height } = useCanvasSize();
  const { camera, zoomAtPointer, updatePosition } = useCanvasCamera();

  const [cursor, setCursor] = useState({
    x: 100,
    y: 100,
  });

  function getWorldPointer(stage) {
    const pointer = stage.getPointerPosition();

    if (!pointer) return null;

    return {
      x: (pointer.x - camera.x) / camera.scale,
      y: (pointer.y - camera.y) / camera.scale,
    };
  }

  function handleStageClick(e) {
    const stage = e.target.getStage();
    const worldPointer = getWorldPointer(stage);

    if (!worldPointer) return;

    setCursor(worldPointer);

    const currentPoints = measurement.points ?? [];

    if (currentPoints.length >= 2) {
      onMeasurementChange({
        points: [worldPointer],
        pixelDistance: null,
      });

      return;
    }

    const nextPoints = [...currentPoints, worldPointer];

    onMeasurementChange({
      points: nextPoints,
      pixelDistance:
        nextPoints.length === 2
          ? getDistance(nextPoints[0], nextPoints[1])
          : null,
    });
  }

  return (
    <div className="canvas-engine" ref={containerRef}>
      <Stage
        width={width}
        height={height}
        x={camera.x}
        y={camera.y}
        scaleX={camera.scale}
        scaleY={camera.scale}
        draggable
        onDragEnd={(e) =>
          updatePosition({
            x: e.target.x(),
            y: e.target.y(),
          })
        }
        onWheel={(e) => zoomAtPointer(e.target.getStage(), e)}
        onClick={handleStageClick}
      >
        <Layer>
          <FloorplanLayer canvasWidth={width} canvasHeight={height} />

          <FurnitureLayer furniture={furniture} onMove={onMoveFurniture} />

          <MeasurementLayer points={measurement.points} />

          <CursorLayer cursor={cursor} onMove={setCursor} />
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasEngine;
