import React, { useEffect, useState } from "react";

import "./CanvasEngine.css";

import { Stage, Layer, Text, Circle } from "react-konva";
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
import {
  createWall,
  snapToWallEndpoints,
  findSnapPoint,
} from "../../walls/wallUtils";

import SnapIndicatorLayer from "./Layers/SnapIndicatorLayer";

import DoorLayer from "./Layers/DoorLayer";
import { createDoor } from "../../doors/doorUtils";

import WindowLayer from "./Layers/WindowLayer";
import WallDimensionLayer from "./Layers/WallDimensionLayer";
import { createWindow } from "../../windows/windowUtils";

function getDistance(pointA, pointB) {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function snapPointWithShift(pointA, pointB, shiftKey) {
  if (!pointA) return pointB;

  // Shift = vrije richting
  if (shiftKey) {
    return pointB;
  }

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

function getWallCenter(wall) {
  return {
    x: (wall.startPoint.x + wall.endPoint.x) / 2,
    y: (wall.startPoint.y + wall.endPoint.y) / 2,
  };
}

function createPointAtDistance(startPoint, directionPoint, distancePx) {
  const dx = directionPoint.x - startPoint.x;
  const dy = directionPoint.y - startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (!length) return directionPoint;

  return {
    x: startPoint.x + (dx / length) * distancePx,
    y: startPoint.y + (dy / length) * distancePx,
  };
}

function CanvasEngine({
  furniture,
  walls,
  doors,
  windows,
  addWall,
  addDoor,
  addWindow,
  onUpdateDoorPosition,
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
  onUpdateWindowPosition,
  resetCanvasRequest,
  showWallDimensions,
  showFloorplan,
  onMoveWall,
  rooms,
  selectedRoomId,
  roomDraftWallIds,
  onToggleRoomDraftWall,
  onSelectRoomByWallId,
  onSelectRoom,
}) {
  const { containerRef, width, height } = useCanvasSize();
  const { camera, zoomAtPointer, updatePosition, resetCamera } =
    useCanvasCamera();
  const currentTool = temporaryTool ?? activeTool;
  const [shiftPressed, setShiftPressed] = useState(false);

  const [cursor, setCursor] = useState({ x: 100, y: 100 });
  const [wallStartPoint, setWallStartPoint] = useState(null);
  useEffect(() => {
    if (currentTool !== "wall") {
      setWallStartPoint(null);
    }
  }, [currentTool]);

  useEffect(() => {
    if (!resetCanvasRequest) return;
    resetCamera();
  }, [resetCanvasRequest, resetCamera]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Shift") {
        setShiftPressed(true);
      }
    }

    function handleKeyUp(e) {
      if (e.key === "Shift") {
        setShiftPressed(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function getWorldPointer(stage) {
    const pointer = stage.getRelativePointerPosition();

    if (!pointer) return null;

    return {
      x: pointer.x,
      y: pointer.y,
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

    if (currentTool === "wall" && selectedWallId && !wallStartPoint) {
      onSelectWall(null);
      return;
    }

    if (currentTool === "wall") {
      if (!wallStartPoint) {
        setWallStartPoint(snapToWallEndpoints(rawPointer, walls));
        return;
      }

      const snappedPoint = snapToWallEndpoints(rawPointer, walls);

      const endPoint = snapPointWithShift(
        wallStartPoint,
        snappedPoint,
        e.evt.shiftKey,
      );

      let finalEndPoint = endPoint;

      if (calibration?.mmPerPixel) {
        const requestedLength = window.prompt(
          "Lengte van deze muur in millimeters:",
        );

        const requestedLengthMm = Number(requestedLength);

        if (Number.isFinite(requestedLengthMm) && requestedLengthMm > 0) {
          const requestedLengthPx = requestedLengthMm / calibration.mmPerPixel;

          finalEndPoint = createPointAtDistance(
            wallStartPoint,
            endPoint,
            requestedLengthPx,
          );
        }
      }

      const wall = createWall(wallStartPoint, finalEndPoint);

      addWall(wall);

      // Sprint 31.2:
      // Na het plaatsen van een muur blijft RoomSketch in muurmodus.
      // De volgende muur start automatisch op het eindpunt van de vorige muur.
      setWallStartPoint(finalEndPoint);

      return;
    }

    if (currentTool === "placeFurniture") {
      onPlaceFurniture(rawPointer);
      return;
    }

    if (currentTool !== "measure") {
      onSelectFurniture(null);
      onSelectWall(null);
      onClearSelection();
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

  const liveMeasurementEndPoint =
    hasLiveMeasurement && livePointA
      ? snapPointWithShift(livePointA, cursor, shiftPressed)
      : cursor;

  const livePixelDistance =
    hasLiveMeasurement && livePointA
      ? getDistance(livePointA, liveMeasurementEndPoint)
      : null;

  const liveDistanceMm = getMeasuredDistanceMm(livePixelDistance, calibration);

  const snapPoint =
    currentTool === "wall" ? findSnapPoint(cursor, walls) : null;

  function handleWallClick(wall) {
    if (currentTool === "room") {
      onToggleRoomDraftWall(wall.id);
      return;
    }
    if (currentTool === "door") {
      addDoor(createDoor(wall.id, getWallCenter(wall)));

      onSelectTool("select");
      return;
    }
    if (currentTool === "window") {
      addWindow(createWindow(wall.id, getWallCenter(wall)));

      onSelectTool("select");
      return;
    }

    const roomWasSelected = onSelectRoomByWallId(wall.id);

    if (!roomWasSelected) {
      onSelectWall(wall.id);
      onSelectObject("wall", wall.id);
    }
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
        draggable={currentTool === "pan" && !selectedWallId}
        onDragEnd={(e) => {
          const stage = e.target.getStage();

          if (e.target !== stage) {
            return;
          }

          updatePosition({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onWheel={(e) => zoomAtPointer(e.target.getStage(), e)}
        onMouseMove={updateCursor}
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          {showFloorplan && <FloorplanLayer />}

          <WallLayer
            walls={walls}
            selectedWallId={selectedWallId}
            onWallClick={handleWallClick}
            onUpdateWallPoint={onUpdateWallPoint}
            onMoveWall={onMoveWall}
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            roomDraftWallIds={roomDraftWallIds}
          />
          {rooms.map((room) => (
            <React.Fragment key={room.id}>
              <Circle
                x={room.center?.x ?? 0}
                y={room.center?.y ?? 0}
                radius={60}
                fill="transparent"
                onClick={(e) => {
                  e.cancelBubble = true;
                  onSelectRoom(room.id);
                }}
              />

              <Text
                x={(room.center?.x ?? 0) - 45}
                y={(room.center?.y ?? 0) - 10}
                width={90}
                text={room.name}
                align="center"
                fontSize={16}
                fontStyle="bold"
                fill={room.id === selectedRoomId ? "#2563eb" : "#374151"}
                onClick={(e) => {
                  e.cancelBubble = true;
                  onSelectRoom(room.id);
                }}
              />
            </React.Fragment>
          ))}

          <DoorLayer
            doors={doors}
            walls={walls}
            calibration={calibration}
            selectedObject={selectedObject}
            onSelectObject={onSelectObject}
            onUpdateDoorPosition={onUpdateDoorPosition}
          />
          <WindowLayer
            windows={windows}
            walls={walls}
            calibration={calibration}
            selectedObject={selectedObject}
            onSelectObject={onSelectObject}
            onUpdateWindowPosition={onUpdateWindowPosition}
          />
          {showWallDimensions && (
            <WallDimensionLayer walls={walls} calibration={calibration} />
          )}

          <WallPreviewLayer
            startPoint={currentTool === "wall" ? wallStartPoint : null}
            endPoint={
              currentTool === "wall" && wallStartPoint
                ? snapPointWithShift(
                    wallStartPoint,
                    snapPoint ?? cursor,
                    shiftPressed,
                  )
                : cursor
            }
          />
          <SnapIndicatorLayer point={snapPoint} />

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
              endPoint={liveMeasurementEndPoint}
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
