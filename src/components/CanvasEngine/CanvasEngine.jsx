import { useEffect, useState } from "react";

import "./CanvasEngine.css";

import { Stage, Layer } from "react-konva";
import useCanvasSize from "../../hooks/useCanvasSize";
import useCanvasCamera from "./Hooks/useCanvasCamera";

import CursorLayer from "./Layers/CursorLayer";
import FurnitureLayer from "./Layers/FurnitureLayer";
import FloorplanLayer from "./Layers/FloorplanLayer";
import MeasurementLayer from "./Layers/MeasurementLayer";
import PendingFurnitureLayer from "./Layers/PendingFurnitureLayer";
import WallLayer from "./Layers/WallLayer";

import { DimensionLine } from "../../measurement";

import WallPreviewLayer from "./Layers/WallPreviewLayer";
import { createWall } from "../../walls/wallUtils";

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

function getMeasuredDistanceMm(pixelDistance, calibration) {
  if (pixelDistance == null || !calibration?.mmPerPixel) {
    return null;
  }

  return pixelDistance * calibration.mmPerPixel;
}

function CanvasEngine({
  furniture,
  walls,
  addWall,
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
}) {
  const { containerRef, width, height } = useCanvasSize();
  const { camera, zoomAtPointer, updatePosition } = useCanvasCamera();
  const currentTool = temporaryTool ?? activeTool;

  const [cursor, setCursor] = useState({ x: 100, y: 100 });
  const [wallStartPoint, setWallStartPoint] = useState(null);
  useEffect(() => {
    if (currentTool !== "wall") {
      setWallStartPoint(null);
    }
  }, [currentTool]);

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

    if (
      currentTool !== "measure" &&
      currentTool !== "wall" &&
      e.target !== stage
    ) {
      return;
    }

    const rawPointer = getWorldPointer(stage);

    if (!rawPointer) return;

    setCursor(rawPointer);
    if (currentTool === "wall") {
      if (!wallStartPoint) {
        setWallStartPoint(rawPointer);
        return;
      }

      const endPoint = snapPointWithShift(
        wallStartPoint,
        rawPointer,
        e.evt.shiftKey,
      );

      const wall = createWall(wallStartPoint, endPoint);

      addWall(wall);

      setWallStartPoint(null);

      return;
    }

    if (currentTool === "placeFurniture") {
      onPlaceFurniture(rawPointer);
      return;
    }

    if (currentTool !== "measure") {
      onSelectFurniture(null);
      return;
    }

    const currentPoints = measurement.points ?? [];

    if (currentPoints.length >= 2) {
      onMeasurementChange({
        points: [rawPointer],
        pixelDistance: null,
        distanceMm: null,
      });
      return;
    }

    const pointA = currentPoints[0];

    const worldPointer =
      currentPoints.length === 1
        ? snapPointWithShift(pointA, rawPointer, e.evt.shiftKey)
        : rawPointer;

    const nextPoints = [...currentPoints, worldPointer];

    const pixelDistance =
      nextPoints.length === 2
        ? getDistance(nextPoints[0], nextPoints[1])
        : null;

    onMeasurementChange({
      points: nextPoints,
      pixelDistance,
      distanceMm: getMeasuredDistanceMm(pixelDistance, calibration),
    });
  }

  const measurementPoints = measurement.points ?? [];
  const livePointA = measurementPoints[0];
  const hasLiveMeasurement =
    currentTool === "measure" &&
    measurementPoints.length === 1 &&
    calibration?.mmPerPixel;

  const livePixelDistance =
    hasLiveMeasurement && livePointA ? getDistance(livePointA, cursor) : null;

  const liveDistanceMm = getMeasuredDistanceMm(livePixelDistance, calibration);

  return (
    <div className="canvas-engine" ref={containerRef}>
      <Stage
        width={width}
        height={height}
        x={camera.x}
        y={camera.y}
        scaleX={camera.scale}
        scaleY={camera.scale}
        draggable={currentTool === "pan"}
        onDragEnd={(e) =>
          updatePosition({
            x: e.target.x(),
            y: e.target.y(),
          })
        }
        onWheel={(e) => zoomAtPointer(e.target.getStage(), e)}
        onMouseMove={updateCursor}
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          <FloorplanLayer canvasWidth={width} canvasHeight={height} />

          <WallLayer walls={walls} />
          <WallPreviewLayer
            startPoint={currentTool === "wall" ? wallStartPoint : null}
            endPoint={
              currentTool === "wall" && wallStartPoint
                ? snapPointWithShift(
                    wallStartPoint,
                    cursor,
                    false, // straks vervangen
                  )
                : cursor
            }
          />

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
            onResize={onResizeFurniture}
          />

          {currentTool === "measure" && (
            <MeasurementLayer points={measurementPoints} />
          )}

          {hasLiveMeasurement && liveDistanceMm != null && (
            <DimensionLine
              startPoint={livePointA}
              endPoint={cursor}
              distanceMm={liveDistanceMm}
            />
          )}

          {measurementPoints.length === 2 && measurement.distanceMm != null && (
            <DimensionLine
              startPoint={measurementPoints[0]}
              endPoint={measurementPoints[1]}
              distanceMm={measurement.distanceMm}
            />
          )}

          {currentTool === "measure" && (
            <CursorLayer cursor={cursor} onMove={setCursor} />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasEngine;
