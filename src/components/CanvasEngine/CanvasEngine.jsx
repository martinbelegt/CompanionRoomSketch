import { useEffect, useRef, useState } from "react";

import "./CanvasEngine.css";

import { Stage, Layer, Rect } from "react-konva";
import useCanvasSize from "../../hooks/useCanvasSize";
import useCanvasCamera from "./Hooks/useCanvasCamera";

import PrecisionCursorLayer from "./Layers/PrecisionCursorLayer";
import FurnitureLayer from "./Layers/FurnitureLayer";
import FloorplanLayer from "./Layers/FloorplanLayer";
import BackgroundLayer from "./Layers/BackgroundLayer";
import GridLayer from "./Layers/GridLayer";
import MeasurementLayer from "./Layers/MeasurementLayer";
import PendingFurnitureLayer from "./Layers/PendingFurnitureLayer";
import WallLayer from "./Layers/WallLayer";
import WallSuggestionLayer from "./Layers/WallSuggestionLayer";

import {
  buildWorldMeasurementPoints,
  DimensionLine,
  getConstrainedWorldPoint,
  getWorldDistance,
  measurePixelsWithCalibration,
} from "../../measurement";

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

import RoomLayer from "./Layers/RoomLayer";
import RoomSnapGuideLayer from "./Layers/RoomSnapGuideLayer";
import OpeningLayer from "./Layers/OpeningLayer";

function getMeasuredDistanceMm(pixelDistance, calibration) {
  return measurePixelsWithCalibration(pixelDistance, calibration);
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
  wallSuggestions,
  doors,
  windows,
  openings,
  background,
  backgroundCalibrationActive,
  backgroundRoomAlignActive,
  addWall,
  onRemoveWallSuggestion,
  addDoor,
  addWindow,
  onStartDoorMove,
  onUpdateDoorPosition,
  onUpdateDoorSize,
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
  onStartBackgroundMove,
  onUpdateBackground,
  onFinishBackgroundCalibration,
  onBackgroundCalibrationPointCountChange,
  onFinishBackgroundRoomAlign,
  onUpdateWindowPosition,
  resetCanvasRequest,
  canvasCamera,
  canvasCameraRestoreRequest,
  onCanvasCameraChange,
  showWallDimensions,
  showFloorplan,
  onMoveWall,
  rooms,
  selectedRoomId,
  selectedRoomIds,
  roomDraftWallIds,
  onToggleRoomDraftWall,
  onSelectRoomByWallId,
  onSelectRoom,
  onMoveRoom,
  onMarqueeSelect,
  activeSnapGuides,
  onClearSnapGuides,
  onToggleDoorDirection,
  onToggleDoorSwing,
  onSelectOpeningWall,
  onConvertOpeningToDoor,
  onPlaceDoorInWallGap,
}) {
  const { containerRef, width, height } = useCanvasSize();
  const { camera, zoomAtPointer, updatePosition, resetCamera, restoreCamera } =
    useCanvasCamera(canvasCamera);
  const currentTool =
    temporaryTool === "pan"
      ? "pan"
      : backgroundCalibrationActive
        ? "measure"
        : temporaryTool ?? activeTool;
  const visibleBounds =
    camera.scale > 0
      ? {
          x: -camera.x / camera.scale,
          y: -camera.y / camera.scale,
          width: width / camera.scale,
          height: height / camera.scale,
        }
      : null;
  const isPanning = currentTool === "pan";
  const [shiftPressed, setShiftPressed] = useState(false);

  const [cursor, setCursor] = useState({ x: 100, y: 100 });

  const [marqueeStart, setMarqueeStart] = useState(null);
  const [marqueeEnd, setMarqueeEnd] = useState(null);
  const [isMarqueeDragging, setIsMarqueeDragging] = useState(false);
  const lastCameraRestoreRequestRef = useRef(canvasCameraRestoreRequest);
  const [backgroundCalibrationPoints, setBackgroundCalibrationPoints] =
    useState([]);

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
    if (!canvasCameraRestoreRequest) return;
    if (lastCameraRestoreRequestRef.current === canvasCameraRestoreRequest) {
      return;
    }

    lastCameraRestoreRequestRef.current = canvasCameraRestoreRequest;
    restoreCamera(canvasCamera);
  }, [canvasCamera, canvasCameraRestoreRequest, restoreCamera]);

  useEffect(() => {
    onCanvasCameraChange?.(camera);
  }, [camera, onCanvasCameraChange]);

  useEffect(() => {
    if (!backgroundCalibrationActive) {
      setBackgroundCalibrationPoints([]);
      onBackgroundCalibrationPointCountChange?.(0);
    }
  }, [backgroundCalibrationActive, onBackgroundCalibrationPointCountChange]);

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

    if (!pointer) return;

    if (isPanning) return;

    setCursor(pointer);

    if (isMarqueeDragging) {
      setMarqueeEnd(pointer);
    }
  }

  function handleStageMouseDown(e) {
    const stage = e.target.getStage();

    const rawPointer = getWorldPointer(stage);

    if (!rawPointer) return;

    if (isPanning) return;

    if (backgroundRoomAlignActive) {
      onFinishBackgroundRoomAlign?.(rawPointer);
      return;
    }

    if (backgroundCalibrationActive) {
      const nextPoints = buildWorldMeasurementPoints({
        points: backgroundCalibrationPoints,
        pointer: rawPointer,
        shiftKey: e.evt.shiftKey,
      });

      setBackgroundCalibrationPoints(nextPoints);
      onBackgroundCalibrationPointCountChange?.(nextPoints.length);

      if (nextPoints.length === 2) {
        onFinishBackgroundCalibration?.(nextPoints);
      }

      return;
    }

    if (currentTool === "select" && e.target === stage) {
      setMarqueeStart(rawPointer);
      setMarqueeEnd(rawPointer);
      setIsMarqueeDragging(true);
    }

    if (currentTool === "select" && e.target !== stage) {
      return;
    }

    if (
      currentTool !== "measure" &&
      currentTool !== "wall" &&
      currentTool !== "select" &&
      e.target !== stage
    ) {
      return;
    }

    setCursor(rawPointer);

    if (currentTool === "wall") {
      if (!wallStartPoint) {
        setWallStartPoint(snapToWallEndpoints(rawPointer, walls));
        return;
      }

      const snappedPoint = snapToWallEndpoints(rawPointer, walls);

      const endPoint = getConstrainedWorldPoint(
        wallStartPoint,
        snappedPoint,
        true,
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

    if (currentTool === "door" && e.target === stage) {
      onPlaceDoorInWallGap?.(rawPointer);
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

    const nextPoints = buildWorldMeasurementPoints({
      points: currentPoints,
      pointer: rawPointer,
      shiftKey: e.evt.shiftKey,
    });

    const pixelDistance =
      nextPoints.length === 2
        ? getWorldDistance(nextPoints[0], nextPoints[1])
        : null;

    onMeasurementChange({
      points: nextPoints,
      pixelDistance,
      distanceMm: getMeasuredDistanceMm(pixelDistance, calibration),
    });
  }

  const measurementPoints = measurement.points ?? [];
  const activeMeasurementPoints = backgroundCalibrationActive
    ? backgroundCalibrationPoints
    : measurementPoints;
  const livePointA = activeMeasurementPoints[0];
  const isMeasuring =
    !isPanning && (currentTool === "measure" || backgroundCalibrationActive);
  const hasLiveMeasurement =
    isMeasuring &&
    activeMeasurementPoints.length === 1;

  const liveMeasurementEndPoint =
    hasLiveMeasurement && livePointA
      ? getConstrainedWorldPoint(livePointA, cursor, shiftPressed)
      : cursor;

  const visibleMeasurementPoints =
    hasLiveMeasurement && livePointA
      ? [livePointA, liveMeasurementEndPoint]
      : activeMeasurementPoints;

  const livePixelDistance =
    hasLiveMeasurement && livePointA
      ? getWorldDistance(livePointA, liveMeasurementEndPoint)
      : null;

  const liveDistanceMm = getMeasuredDistanceMm(livePixelDistance, calibration);

  const snapPoint =
    currentTool === "wall" ? findSnapPoint(cursor, walls) : null;

  function handleStageMouseUp() {
    if (!isMarqueeDragging) return;

    if (marqueeStart && marqueeEnd) {
      const marqueeBounds = {
        x: Math.min(marqueeStart.x, marqueeEnd.x),
        y: Math.min(marqueeStart.y, marqueeEnd.y),
        width: Math.abs(marqueeEnd.x - marqueeStart.x),
        height: Math.abs(marqueeEnd.y - marqueeStart.y),
      };

      if (marqueeBounds.width > 3 && marqueeBounds.height > 3) {
        onMarqueeSelect?.(marqueeBounds);
      }
    }

    setIsMarqueeDragging(false);
  }

  function handleWallClick(wall, event) {
    const wallRoom = rooms.find((room) => room.wallIds?.includes(wall.id));
    const isLockedRoomWall = Boolean(wallRoom?.locked);

    if (currentTool === "opening") {
      onSelectOpeningWall(wall.id);
      return;
    }

    if (currentTool === "room") {
      onToggleRoomDraftWall(wall.id);
      return;
    }
    if (currentTool === "door") {
      const stage = event?.target?.getStage();
      const clickPosition = stage ? getWorldPointer(stage) : getWallCenter(wall);

      addDoor(
        createDoor(wall, clickPosition, {
          calibration,
          rooms,
        }),
      );

      onSelectTool("select");
      return;
    }
    if (currentTool === "window") {
      addWindow(createWindow(wall.id, getWallCenter(wall)));

      onSelectTool("select");
      return;
    }

    if (currentTool === "wall" || isLockedRoomWall) {
      return;
    }

    const roomWasSelected = onSelectRoomByWallId(wall.id);

    if (!roomWasSelected) {
      onSelectWall(wall.id);
      onSelectObject("wall", wall.id);
    }
  }

  function handleWallMouseDown(wall) {
    if (currentTool !== "opening" || wall.id !== selectedWallId) return;

    onSelectOpeningWall(wall.id);
  }

  return (
    <div
      className={`canvas-engine ${isMeasuring ? "is-precision-mode" : ""}`}
      ref={containerRef}
    >
      <Stage
        width={width}
        height={height}
        x={camera.x}
        y={camera.y}
        scaleX={camera.scale}
        scaleY={camera.scale}
        draggable={currentTool === "pan"}
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
        onMouseUp={() => {
          handleStageMouseUp();
          setMarqueeStart(null);
          setMarqueeEnd(null);
        }}
      >
        <Layer>
          {showFloorplan && !background && <FloorplanLayer />}
          <BackgroundLayer
            background={background}
            visible={showFloorplan}
            backgroundCalibrationActive={
              backgroundCalibrationActive || backgroundRoomAlignActive
            }
            selectedObject={selectedObject}
            onSelectObject={onSelectObject}
            onStartBackgroundMove={onStartBackgroundMove}
            onUpdateBackground={onUpdateBackground}
          />
          {showWallDimensions && (
            <GridLayer calibration={calibration} visibleBounds={visibleBounds} />
          )}
          <WallSuggestionLayer
            suggestions={wallSuggestions}
            currentTool={currentTool}
            onRemoveSuggestion={onRemoveWallSuggestion}
          />
          <WallLayer
            walls={walls}
            selectedWallId={selectedWallId}
            onWallClick={handleWallClick}
            onWallMouseDown={handleWallMouseDown}
            onUpdateWallPoint={onUpdateWallPoint}
            onMoveWall={onMoveWall}
            calibration={calibration}
            currentTool={currentTool}
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            selectedRoomIds={selectedRoomIds}
            roomDraftWallIds={roomDraftWallIds}
          />
          <RoomLayer
            rooms={rooms}
            calibration={calibration}
            selectedRoomId={selectedRoomId}
            selectedRoomIds={selectedRoomIds}
            onSelectRoom={onSelectRoom}
            onMoveRoom={onMoveRoom}
            currentTool={currentTool}
            onClearSnapGuides={onClearSnapGuides}
          />
          <RoomSnapGuideLayer guides={activeSnapGuides} />

          <DoorLayer
            doors={doors}
            walls={walls}
            openings={openings}
            calibration={calibration}
            selectedObject={selectedObject}
            onSelectObject={onSelectObject}
            onStartDoorMove={onStartDoorMove}
            onUpdateDoorPosition={onUpdateDoorPosition}
            onUpdateDoorSize={onUpdateDoorSize}
            onToggleDoorDirection={onToggleDoorDirection}
            onToggleDoorSwing={onToggleDoorSwing}
          />
          <OpeningLayer
            openings={openings}
            walls={walls}
            calibration={calibration}
            selectedObject={selectedObject}
            onSelectObject={onSelectObject}
            currentTool={currentTool}
            onConvertOpeningToDoor={onConvertOpeningToDoor}
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
                ? getConstrainedWorldPoint(
                    wallStartPoint,
                    snapPoint ?? cursor,
                    true,
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

          {isMeasuring && (
            <MeasurementLayer points={visibleMeasurementPoints} />
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

          {isMeasuring && (
            <PrecisionCursorLayer cursor={cursor} />
          )}
          {marqueeStart && marqueeEnd && (
            <Rect
              x={Math.min(marqueeStart.x, marqueeEnd.x)}
              y={Math.min(marqueeStart.y, marqueeEnd.y)}
              width={Math.abs(marqueeEnd.x - marqueeStart.x)}
              height={Math.abs(marqueeEnd.y - marqueeStart.y)}
              fill="rgba(37, 99, 235, 0.08)"
              stroke="#2563eb"
              strokeWidth={1}
              dash={[6, 4]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default CanvasEngine;
