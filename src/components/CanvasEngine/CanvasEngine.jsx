import { useState } from "react";

import "./CanvasEngine.css";

import { Stage, Layer } from "react-konva";
import useCanvasSize from "../../hooks/useCanvasSize";
import useCanvasCamera from "./Hooks/useCanvasCamera";

import CursorLayer from "./Layers/CursorLayer";
import FurnitureLayer from "./Layers/FurnitureLayer";
import FloorplanLayer from "./Layers/FloorplanLayer";
import MeasurementLayer from "./Layers/MeasurementLayer";
import PendingFurnitureLayer from "./Layers/PendingFurnitureLayer";

function getDistance(pointA, pointB) {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function snapPointWithShift(pointA, pointB, shiftKey) {
  if (!shiftKey || !pointA) return pointB;

  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;

  return Math.abs(dx) >= Math.abs(dy)
    ? { x: pointB.x, y: pointA.y }
    : { x: pointA.x, y: pointB.y };
}

function CanvasEngine({
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
  const { containerRef, width, height } = useCanvasSize();
  const { camera, zoomAtPointer } = useCanvasCamera();

  const [cursor, setCursor] = useState({ x: 100, y: 100 });

  function getWorldPointer(stage) {
    const pointer = stage.getPointerPosition();

    if (!pointer) return null;

    return {
      x: (pointer.x - camera.x) / camera.scale,
      y: (pointer.y - camera.y) / camera.scale,
    };
  }

  function updateCursor(e) {
    const stage = e.target.getStage();
    const pointer = getWorldPointer(stage);

    if (pointer) setCursor(pointer);
  }

  function handleStageMouseDown(e) {
    const stage = e.target.getStage();

    if (e.target !== stage) return;

    const rawPointer = getWorldPointer(stage);

    if (!rawPointer) return;

    setCursor(rawPointer);

    if (activeTool === "placeFurniture") {
      onPlaceFurniture(rawPointer);
      return;
    }

    if (activeTool !== "measure") {
      onSelectFurniture(null);
      return;
    }

    const currentPoints = measurement.points ?? [];
    const pointA = currentPoints[0];

    const worldPointer =
      currentPoints.length === 1
        ? snapPointWithShift(pointA, rawPointer, e.evt.shiftKey)
        : rawPointer;

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
        draggable={false}
        onWheel={(e) => zoomAtPointer(e.target.getStage(), e)}
        onMouseMove={updateCursor}
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          <FloorplanLayer canvasWidth={width} canvasHeight={height} />

          {activeTool === "placeFurniture" && (
            <PendingFurnitureLayer
              pendingFurniture={pendingFurniture}
              cursor={cursor}
              calibration={calibration}
            />
          )}

          <FurnitureLayer
            furniture={furniture}
            calibration={calibration}
            selectedFurnitureId={selectedFurnitureId}
            onSelectFurniture={onSelectFurniture}
            onMove={onMoveFurniture}
          />

          {activeTool === "measure" && (
            <MeasurementLayer points={measurement.points} />
          )}

          {activeTool === "measure" && (
            <CursorLayer cursor={cursor} onMove={setCursor} />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasEngine;
