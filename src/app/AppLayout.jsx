import { useCallback, useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

import Toolbar from "../components/Toolbar/Toolbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Canvas from "../components/Canvas/Canvas";
import Inspector from "../components/Inspector/Inspector";
import StatusBar from "../components/StatusBar/StatusBar";
import furnitureCatalog from "../data/furnitureCatalog";
import NewFurnitureDialog from "../components/NewFurnitureDialog/NewFurnitureDialog";
import RectangleRoomDialog from "../components/RectangleRoomDialog/RectangleRoomDialog";
import OpeningDialog from "../components/OpeningDialog/OpeningDialog";

import "../styles/AppLayout.css";
import { createCalibration, getWorldDistance } from "../measurement";

import { createWall } from "../walls/wallUtils";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

const STORAGE_KEYS = {
  project: "companion-roomsketch-project",
  manualProject: "companion-roomsketch-manual-project",
  furniture: "companion-roomsketch-placed-furniture",
  calibration: "companion-roomsketch-calibration",
  myFurniture: "companion-roomsketch-my-furniture",
  walls: "companion-roomsketch-walls",
  doors: "companion-roomsketch-doors",
  windows: "companion-roomsketch-windows",
  rooms: "companion-roomsketch-rooms",
  showFloorplan: "companion-roomsketch-show-floorplan",
  openings: "companion-roomsketch-openings",
  background: "companion-roomsketch-background",
};

const SNAP_DISTANCE = 20;
const PROJECT_TITLE = "Appartement Hank";
const PROJECT_SAVE_VERSION = 1;
const DEFAULT_CANVAS_CAMERA = {
  x: 0,
  y: 0,
  scale: 1,
};
const EMPTY_BULK_SELECTION = {
  roomIds: [],
  wallIds: [],
  doorIds: [],
  windowIds: [],
  furnitureIds: [],
};

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // LocalStorage can be full or unavailable; keep the app usable.
  }
}

function getSavedProject() {
  return loadFromStorage(STORAGE_KEYS.project, null);
}

function hasMeaningfulSavedProject(project) {
  if (!project?.data) return false;

  const data = project.data;

  return Boolean(
    data.walls?.length ||
      data.rooms?.length ||
      data.doors?.length ||
      data.windows?.length ||
      data.openings?.length ||
      data.furniture?.length ||
      data.background ||
      data.calibration,
  );
}

function createEmptyProjectState() {
  return {
    furniture: [],
    walls: [],
    doors: [],
    windows: [],
    openings: [],
    background: null,
    calibration: null,
    backgroundScaleCompleted: false,
    backgroundScaleMmPerPixel: null,
    showFloorplan: true,
    showWallDimensions: true,
    canvasCamera: DEFAULT_CANVAS_CAMERA,
    myFurniture: loadFromStorage(STORAGE_KEYS.myFurniture, []),
  };
}

function cloneCanvasState(snapshot) {
  return JSON.parse(JSON.stringify(snapshot));
}

async function renderPdfFirstPage(file) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;

  return canvas.toDataURL("image/png");
}

function rangesOverlap(startA, endA, startB, endB) {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

function getSnappedRoomPosition({ room, proposedBounds, rooms, snapDistance }) {
  const fallback = {
    x: proposedBounds?.x ?? 0,
    y: proposedBounds?.y ?? 0,
    snapped: false,
    axis: null,
    snapLines: [],
  };

  if (!room?.bounds || !proposedBounds) {
    return fallback;
  }

  const proposedRight = proposedBounds.x + proposedBounds.width;
  const proposedBottom = proposedBounds.y + proposedBounds.height;

  let snapX = null;
  let snapY = null;

  for (const otherRoom of rooms) {
    if (otherRoom.id === room.id || !otherRoom.bounds) continue;

    const otherBounds = otherRoom.bounds;
    const otherRight = otherBounds.x + otherBounds.width;
    const otherBottom = otherBounds.y + otherBounds.height;

    if (
      rangesOverlap(
        proposedBounds.y,
        proposedBottom,
        otherBounds.y,
        otherBottom,
      )
    ) {
      const xCandidates = [
        {
          offset: otherBounds.x - proposedRight,
          line: {
            orientation: "vertical",
            x: otherBounds.x,
            y1: Math.min(proposedBounds.y, otherBounds.y),
            y2: Math.max(proposedBottom, otherBottom),
          },
        },
        {
          offset: otherRight - proposedBounds.x,
          line: {
            orientation: "vertical",
            x: otherRight,
            y1: Math.min(proposedBounds.y, otherBounds.y),
            y2: Math.max(proposedBottom, otherBottom),
          },
        },
      ];

      for (const { offset, line } of xCandidates) {
        const distance = Math.abs(offset);

        if (
          distance <= snapDistance &&
          (!snapX || distance < snapX.distance)
        ) {
          snapX = { offset, distance, line };
        }
      }
    }

    if (
      rangesOverlap(
        proposedBounds.x,
        proposedBounds.x + proposedBounds.width,
        otherBounds.x,
        otherRight,
      )
    ) {
      const yCandidates = [
        {
          offset: otherBounds.y - proposedBottom,
          line: {
            orientation: "horizontal",
            y: otherBounds.y,
            x1: Math.min(proposedBounds.x, otherBounds.x),
            x2: Math.max(proposedBounds.x + proposedBounds.width, otherRight),
          },
        },
        {
          offset: otherBottom - proposedBounds.y,
          line: {
            orientation: "horizontal",
            y: otherBottom,
            x1: Math.min(proposedBounds.x, otherBounds.x),
            x2: Math.max(proposedBounds.x + proposedBounds.width, otherRight),
          },
        },
      ];

      for (const { offset, line } of yCandidates) {
        const distance = Math.abs(offset);

        if (
          distance <= snapDistance &&
          (!snapY || distance < snapY.distance)
        ) {
          snapY = { offset, distance, line };
        }
      }
    }
  }

  const snapLines = [snapX?.line, snapY?.line].filter(Boolean);
  const axis =
    snapX && snapY ? "both" : snapX ? "x" : snapY ? "y" : null;

  return {
    x: proposedBounds.x + (snapX?.offset ?? 0),
    y: proposedBounds.y + (snapY?.offset ?? 0),
    snapped: Boolean(axis),
    axis,
    snapLines,
  };
}

function getRectIntersectionArea(rectA, rectB) {
  const left = Math.max(rectA.x, rectB.x);
  const right = Math.min(rectA.x + rectA.width, rectB.x + rectB.width);
  const top = Math.max(rectA.y, rectB.y);
  const bottom = Math.min(rectA.y + rectA.height, rectB.y + rectB.height);

  if (right <= left || bottom <= top) return 0;

  return (right - left) * (bottom - top);
}

function pointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function getPointAtWallRatio(oldWall, newWall, position) {
  if (!oldWall || !newWall || !position) return position;

  const oldDx = oldWall.endPoint.x - oldWall.startPoint.x;
  const oldDy = oldWall.endPoint.y - oldWall.startPoint.y;
  const oldLengthSq = oldDx * oldDx + oldDy * oldDy;

  if (!oldLengthSq) return newWall.startPoint;

  const ratio =
    ((position.x - oldWall.startPoint.x) * oldDx +
      (position.y - oldWall.startPoint.y) * oldDy) /
    oldLengthSq;
  const clampedRatio = Math.min(1, Math.max(0, ratio));

  return {
    x:
      newWall.startPoint.x +
      (newWall.endPoint.x - newWall.startPoint.x) * clampedRatio,
    y:
      newWall.startPoint.y +
      (newWall.endPoint.y - newWall.startPoint.y) * clampedRatio,
  };
}

function getRectangleWallUpdates(room, widthPx, heightPx) {
  if (!room?.bounds || room.wallIds?.length !== 4) return null;

  const { x, y } = room.bounds;
  const topLeft = { x, y };
  const topRight = { x: x + widthPx, y };
  const bottomRight = { x: x + widthPx, y: y + heightPx };
  const bottomLeft = { x, y: y + heightPx };

  return new Map([
    [room.wallIds[0], { startPoint: topLeft, endPoint: topRight }],
    [room.wallIds[1], { startPoint: topRight, endPoint: bottomRight }],
    [room.wallIds[2], { startPoint: bottomRight, endPoint: bottomLeft }],
    [room.wallIds[3], { startPoint: bottomLeft, endPoint: topLeft }],
  ]);
}

function isTextEditingTarget(target) {
  if (!target) return false;

  const tagName = target.tagName?.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

function rectMatchesMarquee(rect, marqueeBounds) {
  const area = rect.width * rect.height;
  const intersectionArea = getRectIntersectionArea(rect, marqueeBounds);
  const center = {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };

  return (
    intersectionArea > 0 &&
    (intersectionArea >= area * 0.45 || pointInRect(center, marqueeBounds))
  );
}

function getLineSide(point, start, end) {
  return (
    (point.x - start.x) * (end.y - start.y) -
    (point.y - start.y) * (end.x - start.x)
  );
}

function lineSegmentsIntersect(startA, endA, startB, endB) {
  const sideA = getLineSide(startA, startB, endB);
  const sideB = getLineSide(endA, startB, endB);
  const sideC = getLineSide(startB, startA, endA);
  const sideD = getLineSide(endB, startA, endA);

  return sideA * sideB <= 0 && sideC * sideD <= 0;
}

function lineIntersectsRect(startPoint, endPoint, rect) {
  if (pointInRect(startPoint, rect) || pointInRect(endPoint, rect)) return true;

  const rectPoints = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];

  return rectPoints.some((point, index) =>
    lineSegmentsIntersect(
      startPoint,
      endPoint,
      point,
      rectPoints[(index + 1) % rectPoints.length],
    ),
  );
}

function getFurnitureBounds(item, calibration) {
  const mmPerPixel = calibration?.mmPerPixel ?? 10;

  return {
    x: item.x,
    y: item.y,
    width: item.widthMm / mmPerPixel,
    height: item.depthMm / mmPerPixel,
  };
}

function getObjectsInMarquee({
  marqueeBounds,
  rooms,
  walls,
  doors,
  windows,
  furniture,
  calibration,
}) {
  const roomIds = rooms
    .filter(
      (room) =>
        !room.locked &&
        room.bounds &&
        rectMatchesMarquee(room.bounds, marqueeBounds),
    )
    .map((room) => room.id);
  const roomWallIds = new Set(
    rooms
      .filter((room) => roomIds.includes(room.id))
      .flatMap((room) => room.wallIds ?? []),
  );
  const wallToRoomId = new Map(
    rooms.flatMap((room) =>
      (room.wallIds ?? []).map((wallId) => [wallId, room.id]),
    ),
  );

  const wallIds = walls
    .filter((wall) => {
      const roomId = wallToRoomId.get(wall.id);

      if (roomId && !roomIds.includes(roomId)) return false;
      if (roomWallIds.has(wall.id)) return false;

      return lineIntersectsRect(wall.startPoint, wall.endPoint, marqueeBounds);
    })
    .map((wall) => wall.id);

  const doorIds = doors
    .filter((door) => door.position && pointInRect(door.position, marqueeBounds))
    .map((door) => door.id);
  const windowIds = windows
    .filter(
      (windowItem) =>
        windowItem.position && pointInRect(windowItem.position, marqueeBounds),
    )
    .map((windowItem) => windowItem.id);
  const furnitureIds = furniture
    .filter((item) =>
      rectMatchesMarquee(getFurnitureBounds(item, calibration), marqueeBounds),
    )
    .map((item) => item.id);

  return {
    roomIds,
    wallIds,
    doorIds,
    windowIds,
    furnitureIds,
  };
}

function hasBulkSelection(selection) {
  return Object.values(selection).some((ids) => ids.length > 0);
}

function getWallDirection(wall) {
  const dx = wall.endPoint.x - wall.startPoint.x;
  const dy = wall.endPoint.y - wall.startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;

  return {
    x: dx / length,
    y: dy / length,
  };
}

function getWallNormal(wall) {
  const direction = getWallDirection(wall);

  return {
    x: -direction.y,
    y: direction.x,
  };
}

function getOpeningFillDirection(wall, opening, rooms) {
  const normal = getWallNormal(wall);
  const room = rooms.find((item) => item.wallIds?.includes(wall.id));

  if (!room?.center) return normal;

  const toRoomCenter = {
    x: room.center.x - opening.position.x,
    y: room.center.y - opening.position.y,
  };
  const pointsTowardRoom =
    toRoomCenter.x * normal.x + toRoomCenter.y * normal.y >= 0;

  return pointsTowardRoom
    ? normal
    : {
        x: -normal.x,
        y: -normal.y,
      };
}

function AppLayout() {
  const [savedProject] = useState(() => getSavedProject());
  const [manualSavedProject, setManualSavedProject] = useState(() =>
    loadFromStorage(STORAGE_KEYS.manualProject, null),
  );
  const [showRestorePrompt, setShowRestorePrompt] = useState(() =>
    hasMeaningfulSavedProject(savedProject),
  );
  const [manualSaveVisible, setManualSaveVisible] = useState(false);

  const [furniture, setFurniture] = useState([]);

  const [walls, setWalls] = useState([]);

  const [doors, setDoors] = useState([]);

  const [windows, setWindows] = useState([]);

  const [openings, setOpenings] = useState([]);

  const [background, setBackground] = useState(null);

  const [selectedWallId, setSelectedWallId] = useState(null);

  const [selectedObject, setSelectedObject] = useState(null);

  const [showWallDimensions, setShowWallDimensions] = useState(true);
  const [showFloorplan, setShowFloorplan] = useState(true);

  const [resetCanvasRequest, setResetCanvasRequest] = useState(0);
  const [canvasCamera, setCanvasCamera] = useState(DEFAULT_CANVAS_CAMERA);
  const [canvasCameraRestoreRequest, setCanvasCameraRestoreRequest] =
    useState(0);
  const updateCanvasCamera = useCallback((nextCamera) => {
    setCanvasCamera((current) => {
      if (
        current.x === nextCamera.x &&
        current.y === nextCamera.y &&
        current.scale === nextCamera.scale
      ) {
        return current;
      }

      return nextCamera;
    });
  }, []);

  const [rooms, setRooms] = useState([]);

  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const [selectedRoomIds, setSelectedRoomIds] = useState([]);

  const [roomDraftWallIds, setRoomDraftWallIds] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [activeSnapGuides, setActiveSnapGuides] = useState([]);
  const [bulkSelection, setBulkSelection] = useState(EMPTY_BULK_SELECTION);
  const [backgroundCalibrationActive, setBackgroundCalibrationActive] =
    useState(false);
  const [backgroundRoomAlignActive, setBackgroundRoomAlignActive] =
    useState(false);
  const [backgroundScaleCompleted, setBackgroundScaleCompleted] =
    useState(false);
  const [backgroundCalibrationMeasurement, setBackgroundCalibrationMeasurement] =
    useState(null);
  const [backgroundCalibrationPointCount, setBackgroundCalibrationPointCount] =
    useState(0);
  const [backgroundWorkflowRequest, setBackgroundWorkflowRequest] =
    useState(null);
  const [backgroundScaleMmPerPixel, setBackgroundScaleMmPerPixel] =
    useState(null);

  function captureUndoState() {
    return cloneCanvasState({
      walls,
      rooms,
      doors,
      windows,
      openings,
      background,
      furniture,
    });
  }

  function pushUndoSnapshot() {
    const snapshot = captureUndoState();

    setUndoStack((current) => [...current, snapshot].slice(-30));
    setRedoStack([]);
  }

  function restoreUndoState(snapshot) {
    setWalls(snapshot.walls);
    setRooms(snapshot.rooms);
    setDoors(snapshot.doors);
    setWindows(snapshot.windows);
    setOpenings(snapshot.openings ?? []);
    setBackground(snapshot.background ?? null);
    setFurniture(snapshot.furniture);

    setSelectedWallId(null);
    setSelectedObject(null);
    setSelectedRoomId(null);
    setSelectedRoomIds([]);
    setSelectedFurnitureId(null);
    setBulkSelection(EMPTY_BULK_SELECTION);
    setBackgroundCalibrationActive(false);
    setBackgroundRoomAlignActive(false);
  }

  function undoLastCanvasChange() {
    const snapshot = undoStack[undoStack.length - 1];

    if (!snapshot) return;

    setRedoStack((current) => [...current, captureUndoState()].slice(-30));
    restoreUndoState(snapshot);
    setUndoStack((current) => current.slice(0, -1));
  }

  function redoLastCanvasChange() {
    const snapshot = redoStack[redoStack.length - 1];

    if (!snapshot) return;

    setUndoStack((current) => [...current, captureUndoState()].slice(-30));
    restoreUndoState(snapshot);
    setRedoStack((current) => current.slice(0, -1));
  }

  function addWall(wall) {
    pushUndoSnapshot();
    setWalls((current) => [...current, wall]);
    setSelectedWallId(wall.id);
    setSelectedObject(null);
    setSelectedRoomId(null);
    setSelectedRoomIds([]);
    setSelectedFurnitureId(null);
    setBulkSelection(EMPTY_BULK_SELECTION);
  }
  function addDoor(door) {
    pushUndoSnapshot();
    setDoors((current) => [...current, door]);
  }
  function addWindow(windowItem) {
    pushUndoSnapshot();
    setWindows((current) => [...current, windowItem]);
  }

  function updateWindowPosition(id, position) {
    pushUndoSnapshot();
    setWindows((current) =>
      current.map((windowItem) =>
        windowItem.id === id
          ? {
              ...windowItem,
              position,
            }
          : windowItem,
      ),
    );
  }

  function updateDoorPosition(id, position, options = {}) {
    if (!options.skipUndo) {
      pushUndoSnapshot();
    }

    const movingDoor = doors.find((door) => door.id === id);

    setDoors((current) =>
      current.map((door) =>
        door.id === id
          ? {
              ...door,
              position,
            }
        : door,
      ),
    );

    if (movingDoor?.openingId) {
      setOpenings((current) =>
        current.map((opening) =>
          opening.id === movingDoor.openingId
            ? {
                ...opening,
                position,
              }
            : opening,
        ),
      );
    }
  }

  function startDoorMove() {
    pushUndoSnapshot();
  }

  function toggleDoorDirection(id) {
    pushUndoSnapshot();
    setDoors((current) =>
      current.map((door) =>
        door.id === id
          ? {
              ...door,
              openDirection: door.openDirection
                ? {
                    x: -door.openDirection.x,
                    y: -door.openDirection.y,
                  }
                : door.openDirection,
              direction: door.direction === "inside" ? "outside" : "inside",
            }
          : door,
      ),
    );
  }

  function toggleDoorSwing(id) {
    pushUndoSnapshot();
    setDoors((current) =>
      current.map((door) =>
        door.id === id
          ? {
              ...door,
              hingeSide:
                door.hingeSide === "start"
                  ? "end"
                  : door.hingeSide === "end"
                    ? "start"
                    : door.hingeSide,
              swing: door.swing === "left" ? "right" : "left",
            }
          : door,
      ),
    );
  }

  function selectObject(type, id) {
    setBulkSelection(EMPTY_BULK_SELECTION);
    setSelectedObject({ type, id });
  }

  function selectFurniture(id) {
    setBulkSelection(EMPTY_BULK_SELECTION);
    setSelectedFurnitureId(id);
  }

  function clearSelection() {
    setSelectedObject(null);
    setSelectedWallId(null);
    setSelectedRoomId(null);
    setSelectedRoomIds([]);
    setSelectedFurnitureId(null);
    setBulkSelection(EMPTY_BULK_SELECTION);
    setActiveSnapGuides([]);
    setBackgroundRoomAlignActive(false);
  }

  function clearWalls() {
    if (!walls.length) return;

    pushUndoSnapshot();
    setWalls([]);
  }

  function resetCanvasView() {
    setCanvasCamera(DEFAULT_CANVAS_CAMERA);
    setCanvasCameraRestoreRequest((current) => current + 1);
    setResetCanvasRequest((current) => current + 1);
  }

  function toggleWallDimensions() {
    setShowWallDimensions((current) => !current);
  }

  function toggleFloorplan() {
    setShowFloorplan((current) => {
      const nextVisible = !current;

      setBackground((currentBackground) =>
        currentBackground
          ? {
              ...currentBackground,
              visible: nextVisible,
            }
          : currentBackground,
      );

      return nextVisible;
    });
  }

  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);
  const [activeTool, setActiveTool] = useState("select");

  const [pendingFurniture, setPendingFurniture] = useState(null);
  const [pendingOpening, setPendingOpening] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rectangleRoomDialogOpen, setRectangleRoomDialogOpen] = useState(false);
  const [openingDialogOpen, setOpeningDialogOpen] = useState(false);

  useEffect(() => {
    if (activeTool === "rectangleRoom") {
      setRectangleRoomDialogOpen(true);
      setActiveTool("select");
    }
  }, [activeTool]);

  const [measurement, setMeasurement] = useState({
    points: [],
    pixelDistance: null,
    distanceMm: null,
  });

  const [calibration, setCalibration] = useState(null);

  const [temporaryTool, setTemporaryTool] = useState(null);

  const [myFurniture, setMyFurniture] = useState(() =>
    loadFromStorage(STORAGE_KEYS.myFurniture, []),
  );

  function getProjectSnapshot() {
    return {
      version: PROJECT_SAVE_VERSION,
      projectTitle: PROJECT_TITLE,
      savedAt: new Date().toISOString(),
      data: {
        furniture,
        rooms,
        walls,
        doors,
        windows,
        openings,
        background,
        calibration,
        backgroundScaleCompleted,
        backgroundScaleMmPerPixel,
        showFloorplan,
        showWallDimensions,
        canvasCamera,
        myFurniture,
      },
    };
  }

  function saveProjectSnapshot({ showConfirmation = false } = {}) {
    const snapshot = getProjectSnapshot();

    saveToStorage(STORAGE_KEYS.project, snapshot);
    saveToStorage(STORAGE_KEYS.myFurniture, myFurniture);

    if (showConfirmation) {
      saveToStorage(STORAGE_KEYS.manualProject, snapshot);
      setManualSavedProject(snapshot);
      setManualSaveVisible(true);
    }
  }

  function resetTransientState() {
    setSelectedWallId(null);
    setSelectedObject(null);
    setSelectedRoomId(null);
    setSelectedRoomIds([]);
    setRoomDraftWallIds([]);
    setUndoStack([]);
    setRedoStack([]);
    setActiveSnapGuides([]);
    setBulkSelection(EMPTY_BULK_SELECTION);
    setBackgroundCalibrationActive(false);
    setBackgroundRoomAlignActive(false);
    setBackgroundScaleCompleted(false);
    setBackgroundScaleMmPerPixel(null);
    setBackgroundCalibrationMeasurement(null);
    setBackgroundCalibrationPointCount(0);
    setSelectedFurnitureId(null);
    setActiveTool("select");
    setPendingFurniture(null);
    setPendingOpening(null);
    setMeasurement({
      points: [],
      pixelDistance: null,
      distanceMm: null,
    });
    setTemporaryTool(null);
    setDialogOpen(false);
    setRectangleRoomDialogOpen(false);
    setOpeningDialogOpen(false);
  }

  function applyProjectState(projectState) {
    resetTransientState();
    setFurniture(projectState.furniture ?? []);
    setRooms(projectState.rooms ?? []);
    setWalls(projectState.walls ?? []);
    setDoors(projectState.doors ?? []);
    setWindows(projectState.windows ?? []);
    setOpenings(projectState.openings ?? []);
    setBackground(projectState.background ?? null);
    setCalibration(projectState.calibration ?? null);
    setBackgroundScaleCompleted(projectState.backgroundScaleCompleted ?? false);
    setBackgroundScaleMmPerPixel(
      projectState.backgroundScaleMmPerPixel ?? null,
    );
    setShowFloorplan(projectState.showFloorplan ?? true);
    setShowWallDimensions(projectState.showWallDimensions ?? true);
    setCanvasCamera(projectState.canvasCamera ?? DEFAULT_CANVAS_CAMERA);
    setCanvasCameraRestoreRequest((current) => current + 1);
    setMyFurniture(projectState.myFurniture ?? []);
  }

  function continueSavedProject() {
    applyProjectState(savedProject?.data ?? createEmptyProjectState());
    setShowRestorePrompt(false);
  }

  function startNewProject() {
    applyProjectState(createEmptyProjectState());
    setShowRestorePrompt(false);
  }

  function restoreManualSavedProject() {
    const latestManualProject =
      loadFromStorage(STORAGE_KEYS.manualProject, null) ?? manualSavedProject;

    if (!hasMeaningfulSavedProject(latestManualProject)) return;

    const shouldRestore = window.confirm(
      "Terug naar de laatste handmatige opslag? Je huidige wijzigingen worden vervangen.",
    );

    if (!shouldRestore) return;

    applyProjectState(latestManualProject.data);
    setManualSavedProject(latestManualProject);
    setShowRestorePrompt(false);
  }

  useEffect(() => {
    if (showRestorePrompt) return;

    const saveTimer = window.setTimeout(() => {
      saveProjectSnapshot();
    }, 250);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [
    furniture,
    rooms,
    walls,
    doors,
    windows,
    openings,
    background,
    calibration,
    backgroundScaleCompleted,
    backgroundScaleMmPerPixel,
    showFloorplan,
    showWallDimensions,
    canvasCamera,
    myFurniture,
    showRestorePrompt,
  ]);

  useEffect(() => {
    if (!manualSaveVisible) return;

    const messageTimer = window.setTimeout(() => {
      setManualSaveVisible(false);
    }, 2000);

    return () => {
      window.clearTimeout(messageTimer);
    };
  }, [manualSaveVisible]);

  useEffect(() => {
    if (showRestorePrompt) {
      return;
    }

    saveToStorage(STORAGE_KEYS.furniture, furniture);
    saveToStorage(STORAGE_KEYS.walls, walls);
    saveToStorage(STORAGE_KEYS.doors, doors);
    saveToStorage(STORAGE_KEYS.windows, windows);
    saveToStorage(STORAGE_KEYS.rooms, rooms);
    saveToStorage(STORAGE_KEYS.openings, openings);
    saveToStorage(STORAGE_KEYS.background, background);
    saveToStorage(STORAGE_KEYS.calibration, calibration);
    saveToStorage(STORAGE_KEYS.showFloorplan, showFloorplan);
  }, [
    furniture,
    walls,
    doors,
    windows,
    rooms,
    openings,
    background,
    calibration,
    showFloorplan,
    showRestorePrompt,
  ]);

  async function importBackground(file) {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isSvg = file.type === "image/svg+xml" || lowerName.endsWith(".svg");
    const isPng = file.type === "image/png" || lowerName.endsWith(".png");
    const isJpg =
      file.type === "image/jpeg" ||
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg");
    const isPdf =
      file.type === "application/pdf" || lowerName.endsWith(".pdf");

    if (!isSvg && !isPng && !isJpg && !isPdf) {
      window.alert("Kies een SVG-, PNG-, JPG- of PDF-bestand.");
      return;
    }

    if (isPdf) {
      try {
        const source = await renderPdfFirstPage(file);

        pushUndoSnapshot();
        setShowFloorplan(true);
        setBackground({
          visible: true,
          locked: true,
          opacity: 0.5,
          scale: 1,
          x: 30,
          y: 30,
          type: "pdf",
          source,
          name: file.name,
        });
        setBackgroundScaleCompleted(false);
        setBackgroundScaleMmPerPixel(null);
        setSelectedObject({ type: "background", id: "background" });
      } catch {
        window.alert("Deze PDF kan niet worden geopend.");
      }

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      pushUndoSnapshot();
      setShowFloorplan(true);
      setBackground({
        visible: true,
        locked: true,
        opacity: 0.5,
        scale: 1,
        x: 30,
        y: 30,
        type: isSvg ? "svg" : isJpg ? "jpg" : "png",
        source: reader.result,
        name: file.name,
      });
      setBackgroundScaleCompleted(false);
      setBackgroundScaleMmPerPixel(null);
      setSelectedObject({ type: "background", id: "background" });
    };

    reader.readAsDataURL(file);
  }

  function updateBackground(updates, options = {}) {
    if (!background) return;

    if (!options.skipUndo) {
      pushUndoSnapshot();
    }

    setBackground((current) =>
      current
        ? {
            ...current,
            ...updates,
          }
        : current,
    );
  }

  function startBackgroundMove() {
    pushUndoSnapshot();
  }

  function removeBackground() {
    if (!background) return;

    pushUndoSnapshot();
    setBackground(null);
    setBackgroundScaleCompleted(false);
    setBackgroundScaleMmPerPixel(null);
    setBackgroundCalibrationMeasurement(null);
    setBackgroundCalibrationPointCount(0);
    setBackgroundCalibrationActive(false);
    setBackgroundRoomAlignActive(false);
    setSelectedObject(null);
  }

  function startBackgroundCalibration() {
    if (!background) return;

    setShowFloorplan(true);
    setActiveTool("select");
    setTemporaryTool("measure");
    setBackground((current) =>
      current
        ? {
            ...current,
            visible: true,
          }
        : current,
    );
    setSelectedObject({ type: "background", id: "background" });
    setBackgroundRoomAlignActive(false);
    setBackgroundCalibrationMeasurement(null);
    setBackgroundCalibrationPointCount(0);
    setBackgroundCalibrationActive(true);
  }

  function cancelBackgroundCalibration() {
    setBackgroundCalibrationActive(false);
    setBackgroundCalibrationMeasurement(null);
    setBackgroundCalibrationPointCount(0);
    setTemporaryTool(null);
  }

  function startBackgroundWorkflow(startStep) {
    cancelBackgroundCalibration();
    setShowFloorplan(true);

    if (background) {
      setBackground((current) =>
        current
          ? {
              ...current,
              visible: true,
            }
          : current,
      );
      setSelectedObject({ type: "background", id: "background" });
    }

    setBackgroundWorkflowRequest({
      id: crypto.randomUUID(),
      startStep,
      previousScaleMmPerPixel:
        startStep === 5 ? backgroundScaleMmPerPixel : null,
    });
  }

  function getSingleSelectedRoom() {
    const selectedIds = selectedRoomIds.length
      ? selectedRoomIds
      : selectedRoomId
        ? [selectedRoomId]
        : [];

    if (selectedIds.length !== 1) return null;

    return rooms.find((room) => room.id === selectedIds[0]) ?? null;
  }

  function startBackgroundRoomAlign() {
    const room = getSingleSelectedRoom();

    if (!background || !room?.bounds) return;

    setBackgroundCalibrationActive(false);
    setBackgroundCalibrationMeasurement(null);
    setBackgroundRoomAlignActive(true);
  }

  function finishBackgroundRoomAlign(point) {
    const room = getSingleSelectedRoom();

    if (!background || !room?.bounds || !point) {
      setBackgroundRoomAlignActive(false);
      return;
    }

    const roomCenter = {
      x: room.bounds.x + room.bounds.width / 2,
      y: room.bounds.y + room.bounds.height / 2,
    };

    pushUndoSnapshot();
    setBackground((current) =>
      current
        ? {
            ...current,
            x: (current.x ?? 0) + roomCenter.x - point.x,
            y: (current.y ?? 0) + roomCenter.y - point.y,
          }
        : current,
    );
    setBackgroundRoomAlignActive(false);
  }

  function finishBackgroundCalibration(points) {
    if (!background || points.length !== 2) return;

    const [pointA, pointB] = points;
    const pixelDistance = getWorldDistance(pointA, pointB);

    if (!pixelDistance) return;

    setBackgroundCalibrationMeasurement({
      points,
      pixelDistance,
    });
    setBackgroundCalibrationPointCount(points.length);
  }

  function applyBackgroundCalibration(realDistanceMm, options = {}) {
    if (!background || !backgroundCalibrationMeasurement) return null;

    if (!Number.isFinite(realDistanceMm) || realDistanceMm <= 0) {
      return null;
    }

    const previousScaleMmPerPixel = Number.isFinite(
      options.previousScaleMmPerPixel,
    )
      ? options.previousScaleMmPerPixel
      : backgroundScaleMmPerPixel;
    const mmPerPixel = calibration?.mmPerPixel ?? 10;
    const currentBackgroundScale = background.scale ?? 1;
    const measuredWorldDistance =
      backgroundCalibrationMeasurement.pixelDistance;
    const measuredSourceDistance =
      measuredWorldDistance / currentBackgroundScale;

    if (
      !Number.isFinite(measuredSourceDistance) ||
      measuredSourceDistance <= 0
    ) {
      return null;
    }

    const desiredWorldDistance = realDistanceMm / mmPerPixel;
    const nextScale = desiredWorldDistance / measuredSourceDistance;
    const nextBackgroundScaleMmPerPixel =
      realDistanceMm / measuredSourceDistance;

    pushUndoSnapshot();
    setBackground((current) =>
      current
        ? {
            ...current,
            scale: nextScale,
          }
        : current,
    );
    setBackgroundScaleCompleted(true);
    setBackgroundScaleMmPerPixel(nextBackgroundScaleMmPerPixel);
    setBackgroundCalibrationMeasurement(null);
    setBackgroundCalibrationPointCount(0);
    setBackgroundCalibrationActive(false);
    setTemporaryTool(null);

    return {
      shouldShowComparison: Boolean(options.showComparison),
      previousScaleMmPerPixel,
      newScaleMmPerPixel: nextBackgroundScaleMmPerPixel,
    };
  }

  function addFurniture(catalogId) {
    const template =
      furnitureCatalog[catalogId] ??
      myFurniture.find((item) => item.id === catalogId);

    if (!template) return;

    setPendingFurniture(template);
    setActiveTool("placeFurniture");
  }

  function saveNewFurniture(item) {
    setMyFurniture((current) => {
      const next = [...current, item];

      saveToStorage(STORAGE_KEYS.myFurniture, next);

      return next;
    });
  }

  function placePendingFurniture(position) {
    if (!pendingFurniture) return;

    pushUndoSnapshot();

    const mmPerPixel = calibration?.mmPerPixel ?? 10;
    const width = pendingFurniture.widthMm / mmPerPixel;
    const height = pendingFurniture.depthMm / mmPerPixel;

    const newItem = {
      id: crypto.randomUUID(),
      ...pendingFurniture,
      x: position.x - width / 2,
      y: position.y - height / 2,
      rotation: pendingFurniture.rotation ?? 0,
    };

    setFurniture((current) => [...current, newItem]);
    setSelectedFurnitureId(newItem.id);
    setPendingFurniture(null);
    setActiveTool("select");
  }

  function snap(value, grid = 10) {
    return Math.round(value / grid) * grid;
  }

  function snapNear(value, targets, threshold = 12) {
    for (const target of targets) {
      if (Math.abs(value - target) <= threshold) {
        return target;
      }
    }

    return value;
  }

  function getFurniturePixelSize(item) {
    const mmPerPixel = calibration?.mmPerPixel ?? 10;

    return {
      width: item.widthMm / mmPerPixel,
      height: item.depthMm / mmPerPixel,
    };
  }

  function deleteMyFurniture(id) {
    setMyFurniture((current) => {
      const next = current.filter((item) => item.id !== id);

      saveToStorage(STORAGE_KEYS.myFurniture, next);

      return next;
    });
  }

  function moveFurniture(id, position) {
    pushUndoSnapshot();

    setFurniture((current) => {
      const movingItem = current.find((item) => item.id === id);

      if (!movingItem) return current;

      const movingSize = getFurniturePixelSize(movingItem);
      const otherItems = current.filter((item) => item.id !== id);

      const snapTargetsX = [];
      const snapTargetsY = [];

      otherItems.forEach((item) => {
        const size = getFurniturePixelSize(item);

        const left = item.x;
        const right = item.x + size.width;
        const top = item.y;
        const bottom = item.y + size.height;

        snapTargetsX.push(
          left,
          right,
          left - movingSize.width,
          right - movingSize.width,
        );
        snapTargetsY.push(
          top,
          bottom,
          top - movingSize.height,
          bottom - movingSize.height,
        );
      });

      const gridX = snap(position.x);
      const gridY = snap(position.y);

      const finalX = snapNear(gridX, snapTargetsX);
      const finalY = snapNear(gridY, snapTargetsY);

      return current.map((item) =>
        item.id === id
          ? {
              ...item,
              x: finalX,
              y: finalY,
            }
          : item,
      );
    });
  }

  function resizeFurniture(id, size) {
    pushUndoSnapshot();

    setFurniture((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              widthMm: Math.max(300, size.widthMm),
              depthMm: Math.max(300, size.depthMm),
            }
          : item,
      ),
    );
  }

  function calibrate(realDistanceMm) {
    const startPoint = measurement.points?.[0];
    const endPoint = measurement.points?.[1];

    const nextCalibration = createCalibration({
      startPoint,
      endPoint,
      realDistanceMm,
    });

    if (!nextCalibration) return;

    setCalibration(nextCalibration);

    saveToStorage(STORAGE_KEYS.calibration, nextCalibration);
  }

  function deleteSelectedObjects(selection, options = {}) {
    if (!hasBulkSelection(selection)) return;

    const selectedRoomIds = new Set(selection.roomIds);
    const roomWallIds = new Set(
      rooms
        .filter((room) => selectedRoomIds.has(room.id))
        .flatMap((room) => room.wallIds ?? []),
    );
    const roomProtectedWallIds = new Set(
      rooms
        .filter((room) => !selectedRoomIds.has(room.id))
        .flatMap((room) => room.wallIds ?? []),
    );
    const looseWallIds = new Set(
      selection.wallIds.filter(
        (wallId) => options.allowRoomWallDelete || !roomProtectedWallIds.has(wallId),
      ),
    );
    const wallIdsToDelete = new Set([...roomWallIds, ...looseWallIds]);
    const doorIdsToDelete = new Set(selection.doorIds);
    const windowIdsToDelete = new Set(selection.windowIds);
    const roomFurnitureIds = new Set(
      furniture
        .filter((item) => item.roomId && selectedRoomIds.has(item.roomId))
        .map((item) => item.id),
    );
    const furnitureIdsToDelete = new Set([
      ...selection.furnitureIds,
      ...roomFurnitureIds,
    ]);

    doors.forEach((door) => {
      if (wallIdsToDelete.has(door.wallId)) {
        doorIdsToDelete.add(door.id);
      }
    });
    windows.forEach((windowItem) => {
      if (wallIdsToDelete.has(windowItem.wallId)) {
        windowIdsToDelete.add(windowItem.id);
      }
    });
    const openingIdsToDelete = new Set(
      openings
        .filter((opening) =>
          opening.wallIds?.some((wallId) => wallIdsToDelete.has(wallId)),
        )
        .map((opening) => opening.id),
    );

    pushUndoSnapshot();

    setRooms((current) =>
      current.filter((room) => !selectedRoomIds.has(room.id)),
    );
    setWalls((current) =>
      current.filter((wall) => !wallIdsToDelete.has(wall.id)),
    );
    setDoors((current) =>
      current.filter((door) => !doorIdsToDelete.has(door.id)),
    );
    setWindows((current) =>
      current.filter((windowItem) => !windowIdsToDelete.has(windowItem.id)),
    );
    setOpenings((current) =>
      current.filter((opening) => !openingIdsToDelete.has(opening.id)),
    );
    setFurniture((current) =>
      current.filter((item) => !furnitureIdsToDelete.has(item.id)),
    );

    clearSelection();
  }

  function deleteSelectedFurniture() {
    if (!selectedFurnitureId) return;

    deleteSelectedObjects({
      ...EMPTY_BULK_SELECTION,
      furnitureIds: [selectedFurnitureId],
    });
  }
  function deleteSelectedWall() {
    if (!selectedWallId) return;

    deleteSelectedObjects(
      {
        ...EMPTY_BULK_SELECTION,
        wallIds: [selectedWallId],
      },
      { allowRoomWallDelete: true },
    );
  }

  function deleteSelectedDoor() {
    if (selectedObject?.type !== "door") return;

    deleteSelectedObjects({
      ...EMPTY_BULK_SELECTION,
      doorIds: [selectedObject.id],
    });
  }

  function deleteSelectedWindow() {
    if (selectedObject?.type !== "window") return;

    deleteSelectedObjects({
      ...EMPTY_BULK_SELECTION,
      windowIds: [selectedObject.id],
    });
  }

  function updateWallPoint(id, pointName, position) {
    pushUndoSnapshot();

    setWalls((current) =>
      current.map((wall) =>
        wall.id === id
          ? {
              ...wall,
              [pointName]: position,
            }
          : wall,
      ),
    );
  }

  function moveWall(id, delta) {
    pushUndoSnapshot();

    setWalls((current) =>
      current.map((wall) =>
        wall.id !== id
          ? wall
          : {
              ...wall,
              startPoint: {
                x: wall.startPoint.x + delta.x,
                y: wall.startPoint.y + delta.y,
              },
              endPoint: {
                x: wall.endPoint.x + delta.x,
                y: wall.endPoint.y + delta.y,
              },
            },
      ),
    );
  }

  function moveRoom(roomId, delta, options = {}) {
    const room = rooms.find((item) => item.id === roomId);

    if (!room) return null;

    let moveDelta = delta;
    let snapResult = null;

    if (options.snap && room.bounds) {
      const proposedBounds = {
        ...room.bounds,
        x: room.bounds.x + delta.x,
        y: room.bounds.y + delta.y,
      };
      snapResult = getSnappedRoomPosition({
        room,
        proposedBounds,
        rooms,
        snapDistance: SNAP_DISTANCE,
      });

      setActiveSnapGuides(snapResult.snapLines);

      moveDelta = {
        x: snapResult.x - room.bounds.x,
        y: snapResult.y - room.bounds.y,
      };
    } else if (!options.snap) {
      setActiveSnapGuides([]);
    }

    if (moveDelta.x === 0 && moveDelta.y === 0) return snapResult;

    pushUndoSnapshot();

    // Muren
    setWalls((current) =>
      current.map((wall) =>
        room.wallIds.includes(wall.id)
          ? {
              ...wall,
              startPoint: {
                x: wall.startPoint.x + moveDelta.x,
                y: wall.startPoint.y + moveDelta.y,
              },
              endPoint: {
                x: wall.endPoint.x + moveDelta.x,
                y: wall.endPoint.y + moveDelta.y,
              },
            }
          : wall,
      ),
    );

    // Deuren
    setDoors((current) =>
      current.map((door) =>
        room.wallIds.includes(door.wallId)
          ? {
              ...door,
              position: {
                x: door.position.x + moveDelta.x,
                y: door.position.y + moveDelta.y,
              },
            }
          : door,
      ),
    );

    // Ramen
    setWindows((current) =>
      current.map((windowItem) =>
        room.wallIds.includes(windowItem.wallId)
          ? {
              ...windowItem,
              position: {
                x: windowItem.position.x + moveDelta.x,
                y: windowItem.position.y + moveDelta.y,
              },
            }
          : windowItem,
      ),
    );

    setOpenings((current) =>
      current.map((opening) =>
        opening.wallIds?.some((wallId) => room.wallIds.includes(wallId))
          ? {
              ...opening,
              position: {
                x: opening.position.x + moveDelta.x,
                y: opening.position.y + moveDelta.y,
              },
            }
          : opening,
      ),
    );

    // Middelpunt van de ruimte
    setRooms((current) =>
      current.map((item) =>
        item.id === roomId
          ? {
              ...item,
              center: {
                x: item.center.x + moveDelta.x,
                y: item.center.y + moveDelta.y,
              },
              bounds: item.bounds
                ? {
                    ...item.bounds,
                    x: item.bounds.x + moveDelta.x,
                    y: item.bounds.y + moveDelta.y,
                  }
                : item.bounds,
            }
          : item,
        ),
    );

    return snapResult;
  }

  function updateFurnitureSize(id, size) {
    const widthMm = Number(size.widthMm);
    const depthMm = Number(size.depthMm);

    if (!Number.isFinite(widthMm) || !Number.isFinite(depthMm)) return;
    if (widthMm <= 0 || depthMm <= 0) return;

    pushUndoSnapshot();

    setFurniture((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              widthMm: Math.max(300, widthMm),
              depthMm: Math.max(300, depthMm),
            }
          : item,
      ),
    );
  }

  function startRoomDraft() {
    setRoomDraftWallIds([]);
    setSelectedRoomId(null);
    setActiveTool("room");
  }

  function startOpeningWorkflow() {
    setActiveTool("select");
    setOpeningDialogOpen(true);
  }

  function prepareOpening(input) {
    setPendingOpening(input);
    setOpeningDialogOpen(false);
    setActiveTool("opening");
  }

  function splitWallForOpening(wall, widthMm) {
    const openingWidthPx = Number(widthMm) / (calibration?.mmPerPixel ?? 10);
    const dx = wall.endPoint.x - wall.startPoint.x;
    const dy = wall.endPoint.y - wall.startPoint.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy);

    if (!wallLength || !Number.isFinite(openingWidthPx) || openingWidthPx <= 0) {
      window.alert("Vul een geldige breedte voor de opening in.");
      return null;
    }

    if (openingWidthPx >= wallLength) {
      window.alert("De opening is breder dan deze muur.");
      return null;
    }

    const unitX = dx / wallLength;
    const unitY = dy / wallLength;
    const openingStart = wallLength / 2 - openingWidthPx / 2;
    const openingEnd = wallLength / 2 + openingWidthPx / 2;

    function pointAt(distance) {
      return {
        x: wall.startPoint.x + unitX * distance,
        y: wall.startPoint.y + unitY * distance,
      };
    }

    return {
      walls: [
        createWall(wall.startPoint, pointAt(openingStart)),
        createWall(pointAt(openingEnd), wall.endPoint),
      ],
      position: pointAt(wallLength / 2),
      widthMm: Number(widthMm),
    };
  }

  function createOpeningInWall(wallId) {
    const wall = walls.find((item) => item.id === wallId);
    const openingDraft = wall
      ? splitWallForOpening(wall, pendingOpening?.widthMm)
      : null;

    if (!wall || !openingDraft) return;

    const nextWalls = openingDraft.walls;
    const opening = {
      id: crypto.randomUUID(),
      wallIds: nextWalls.map((item) => item.id),
      startPoint: wall.startPoint,
      endPoint: wall.endPoint,
      position: openingDraft.position,
      widthMm: openingDraft.widthMm,
      fill: "open",
      doorId: null,
    };

    pushUndoSnapshot();

    setWalls((current) =>
      current.flatMap((item) => (item.id === wallId ? nextWalls : [item])),
    );

    setRooms((current) =>
      current.map((room) =>
        room.wallIds.includes(wallId)
          ? {
              ...room,
              wallIds: room.wallIds.flatMap((id) =>
                id === wallId ? nextWalls.map((item) => item.id) : [id],
              ),
            }
          : room,
      ),
    );

    setOpenings((current) => [...current, opening]);

    setPendingOpening(null);
    setSelectedWallId(null);
    setSelectedObject(null);
    setActiveTool("select");
  }

  function selectOpeningWall(wallId) {
    if (activeTool === "opening" && pendingOpening?.wallId === wallId) {
      createOpeningInWall(wallId);
      return;
    }

    setPendingOpening((current) => ({
      ...(current ?? {}),
      wallId,
    }));
    setSelectedWallId(wallId);
    setSelectedObject({ type: "wall", id: wallId });
  }

  function convertOpeningToDoor(openingId) {
    const opening = openings.find((item) => item.id === openingId);

    if (!opening || opening.fill === "door") return;

    const wall = walls.find((item) => opening.wallIds?.includes(item.id));

    if (!wall) return;

    const door = {
      id: crypto.randomUUID(),
      wallId: wall.id,
      openingId: opening.id,
      position: opening.position,
      widthMm: opening.widthMm,
      doorWidthMm: opening.widthMm,
      sparingWidthMm: opening.widthMm,
      hingeSide: "start",
      openDirection: getOpeningFillDirection(wall, opening, rooms),
      direction: "inside",
      swing: "right",
    };

    pushUndoSnapshot();

    setDoors((current) => [...current, door]);
    setOpenings((current) =>
      current.map((item) =>
        item.id === openingId
          ? {
              ...item,
              fill: "door",
              doorId: door.id,
            }
          : item,
      ),
    );
    setSelectedObject({ type: "door", id: door.id });
  }

  function convertDoorToOpening(doorId) {
    const door = doors.find((item) => item.id === doorId);

    if (!door?.openingId) return;

    pushUndoSnapshot();

    setDoors((current) => current.filter((item) => item.id !== doorId));
    setOpenings((current) =>
      current.map((opening) =>
        opening.id === door.openingId
          ? {
              ...opening,
              fill: "open",
              doorId: null,
            }
          : opening,
      ),
    );
    setSelectedObject({ type: "opening", id: door.openingId });
  }

  function toggleRoomDraftWall(wallId) {
    setRoomDraftWallIds((current) =>
      current.includes(wallId)
        ? current.filter((id) => id !== wallId)
        : [...current, wallId],
    );
  }

  function getRoomCenter(wallIds) {
    const roomWalls = walls.filter((wall) => wallIds.includes(wall.id));
    const points = roomWalls.flatMap((wall) => [
      wall.startPoint,
      wall.endPoint,
    ]);

    if (!points.length) {
      return { x: 0, y: 0 };
    }

    return {
      x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
      y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    };
  }

  function saveRoomDraft() {
    if (roomDraftWallIds.length < 3) {
      window.alert("Kies minimaal 3 muren voor een ruimte.");
      return;
    }

    const name = window.prompt("Naam van deze ruimte:", "Woonkamer");

    if (!name) return;

    const room = {
      id: crypto.randomUUID(),
      name,
      wallIds: roomDraftWallIds,
      center: getRoomCenter(roomDraftWallIds),
    };

    pushUndoSnapshot();

    setRooms((current) => [...current, room]);
    setSelectedRoomId(room.id);
    setRoomDraftWallIds([]);
    setActiveTool("select");
  }

  function createRectangleRoom({ name, lengthMm, widthMm }) {
    const realLengthMm = Number(lengthMm);
    const realWidthMm = Number(widthMm);

    if (!realLengthMm || !realWidthMm) return;

    const mmPerPixel = calibration?.mmPerPixel ?? 10;

    const x = 120 + rooms.length * 40;
    const y = 120 + rooms.length * 40;

    const lengthPx = realLengthMm / mmPerPixel;
    const widthPx = realWidthMm / mmPerPixel;

    const p1 = { x, y };
    const p2 = { x: x + lengthPx, y };
    const p3 = { x: x + lengthPx, y: y + widthPx };
    const p4 = { x, y: y + widthPx };

    const newWalls = [
      createWall(p1, p2),
      createWall(p2, p3),
      createWall(p3, p4),
      createWall(p4, p1),
    ];

    const room = {
      id: crypto.randomUUID(),
      name: name || "Nieuwe ruimte",
      wallIds: newWalls.map((wall) => wall.id),
      center: {
        x: x + lengthPx / 2,
        y: y + widthPx / 2,
      },
      bounds: {
        x,
        y,
        width: lengthPx,
        height: widthPx,
      },
    };

    pushUndoSnapshot();

    setWalls((current) => [...current, ...newWalls]);
    setRooms((current) => [...current, room]);

    setSelectedRoomId(room.id);
    setSelectedRoomIds([room.id]);

    setRectangleRoomDialogOpen(false);
  }

  function updateRectangleRoomSize(roomId, sizeMm) {
    const room = rooms.find((item) => item.id === roomId);

    if (!room?.bounds || room.wallIds?.length !== 4) return;

    const lengthMm = Number(sizeMm.lengthMm);
    const widthMm = Number(sizeMm.widthMm);

    if (!Number.isFinite(lengthMm) || !Number.isFinite(widthMm)) return;
    if (lengthMm <= 0 || widthMm <= 0) return;

    const mmPerPixel = calibration?.mmPerPixel ?? 10;
    const nextWidthPx = lengthMm / mmPerPixel;
    const nextHeightPx = widthMm / mmPerPixel;
    const nextWallUpdates = getRectangleWallUpdates(
      room,
      nextWidthPx,
      nextHeightPx,
    );

    if (!nextWallUpdates) return;

    const oldWallsById = new Map(
      walls
        .filter((wall) => room.wallIds.includes(wall.id))
        .map((wall) => [wall.id, wall]),
    );
    const nextWallsById = new Map(
      room.wallIds.map((wallId) => [
        wallId,
        {
          id: wallId,
          ...nextWallUpdates.get(wallId),
        },
      ]),
    );

    pushUndoSnapshot();

    setWalls((current) =>
      current.map((wall) =>
        nextWallUpdates.has(wall.id)
          ? {
              ...wall,
              ...nextWallUpdates.get(wall.id),
            }
          : wall,
      ),
    );

    setRooms((current) =>
      current.map((item) =>
        item.id === roomId
          ? {
              ...item,
              center: {
                x: item.bounds.x + nextWidthPx / 2,
                y: item.bounds.y + nextHeightPx / 2,
              },
              bounds: {
                ...item.bounds,
                width: nextWidthPx,
                height: nextHeightPx,
              },
            }
          : item,
      ),
    );

    setDoors((current) =>
      current.map((door) => {
        if (!room.wallIds.includes(door.wallId)) return door;

        return {
          ...door,
          position: getPointAtWallRatio(
            oldWallsById.get(door.wallId),
            nextWallsById.get(door.wallId),
            door.position,
          ),
        };
      }),
    );

    setWindows((current) =>
      current.map((windowItem) => {
        if (!room.wallIds.includes(windowItem.wallId)) return windowItem;

        return {
          ...windowItem,
          position: getPointAtWallRatio(
            oldWallsById.get(windowItem.wallId),
            nextWallsById.get(windowItem.wallId),
            windowItem.position,
          ),
        };
      }),
    );

    setOpenings((current) =>
      current.map((opening) => {
        const wallId = opening.wallIds?.find((id) => room.wallIds.includes(id));

        if (!wallId) return opening;

        return {
          ...opening,
          position: getPointAtWallRatio(
            oldWallsById.get(wallId),
            nextWallsById.get(wallId),
            opening.position,
          ),
        };
      }),
    );
  }

  function updateRectangleRoomWalls(roomId, wallStyle) {
    const room = rooms.find((item) => item.id === roomId);

    if (!room?.wallIds?.length) return;

    const nextThicknessMm =
      wallStyle.thicknessMm == null ? null : Number(wallStyle.thicknessMm);
    const nextColor = wallStyle.color;
    const nextUpdates = {};

    if (Number.isFinite(nextThicknessMm) && nextThicknessMm > 0) {
      nextUpdates.thicknessMm = nextThicknessMm;
    }

    if (typeof nextColor === "string" && nextColor.trim()) {
      nextUpdates.color = nextColor;
    }

    if (!Object.keys(nextUpdates).length) return;

    pushUndoSnapshot();

    setWalls((current) =>
      current.map((wall) =>
        room.wallIds.includes(wall.id)
          ? {
              ...wall,
              ...nextUpdates,
            }
          : wall,
      ),
    );
  }

  function updateWallSize(id, sizeMm) {
    const wall = walls.find((item) => item.id === id);

    if (!wall) return;

    const nextLengthMm = Number(sizeMm.lengthMm);
    const nextThicknessMm = Number(sizeMm.thicknessMm);
    const nextColor = sizeMm.color;
    const mmPerPixel = calibration?.mmPerPixel ?? 10;
    const dx = wall.endPoint.x - wall.startPoint.x;
    const dy = wall.endPoint.y - wall.startPoint.y;
    const currentLengthPx = Math.sqrt(dx * dx + dy * dy);

    if (!currentLengthPx) return;

    const nextUpdates = {};

    if (Number.isFinite(nextLengthMm) && nextLengthMm > 0) {
      const nextLengthPx = nextLengthMm / mmPerPixel;

      nextUpdates.endPoint = {
        x: wall.startPoint.x + (dx / currentLengthPx) * nextLengthPx,
        y: wall.startPoint.y + (dy / currentLengthPx) * nextLengthPx,
      };
    }

    if (Number.isFinite(nextThicknessMm) && nextThicknessMm > 0) {
      nextUpdates.thicknessMm = nextThicknessMm;
    }

    if (typeof nextColor === "string" && nextColor.trim()) {
      nextUpdates.color = nextColor;
    }

    if (!Object.keys(nextUpdates).length) return;

    pushUndoSnapshot();

    setWalls((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...nextUpdates,
            }
          : item,
      ),
    );
  }

  function rotateFurniture(id, rotation) {
    const nextRotation = Number(rotation);

    if (!Number.isFinite(nextRotation)) return;

    pushUndoSnapshot();

    setFurniture((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              rotation: ((nextRotation % 360) + 360) % 360,
            }
          : item,
      ),
    );
  }

  function selectRoom(id, addToSelection = false) {
    const room = rooms.find((item) => item.id === id);

    if (!room) return;

    setSelectedWallId(null);
    setSelectedObject(null);
    setBulkSelection(EMPTY_BULK_SELECTION);

    if (room.locked) {
      setSelectedRoomId(id);
      setSelectedRoomIds([id]);
      return;
    }

    if (addToSelection) {
      setSelectedRoomIds((current) => {
        const next = current.includes(id)
          ? current.filter((roomId) => roomId !== id)
          : [...current, id];

        setSelectedRoomId(id);
        return next;
      });

      return;
    }

    setSelectedRoomId(id);
    setSelectedRoomIds([id]);
  }

  function selectRoomByWallId(wallId) {
    const room = rooms.find(
      (item) => item.wallIds.includes(wallId),
    );

    if (!room) {
      setSelectedRoomId(null);
      return false;
    }

    setSelectedRoomId(room.id);
    setSelectedRoomIds([room.id]);
    setBulkSelection(EMPTY_BULK_SELECTION);
    return true;
  }

  function deleteSelectedRoom() {
    if (!selectedRoomIds.length && !selectedRoomId) return;

    const idsToDelete = selectedRoomIds.length
      ? selectedRoomIds
      : [selectedRoomId];

    deleteSelectedObjects({
      ...EMPTY_BULK_SELECTION,
      roomIds: idsToDelete,
    });
  }

  function setRoomLocked(roomId, locked) {
    const room = rooms.find((item) => item.id === roomId);

    if (!room || Boolean(room.locked) === locked) return;

    pushUndoSnapshot();
    setRooms((current) =>
      current.map((item) =>
        item.id === roomId
          ? {
              ...item,
              locked,
            }
          : item,
      ),
    );

    if (locked) {
      setSelectedRoomId(null);
      setSelectedRoomIds([]);
    } else {
      setSelectedRoomId(roomId);
      setSelectedRoomIds([roomId]);
    }
  }

  function unlockAllRooms() {
    if (!rooms.some((room) => room.locked)) return;

    pushUndoSnapshot();
    setRooms((current) =>
      current.map((room) =>
        room.locked
          ? {
              ...room,
              locked: false,
            }
          : room,
      ),
    );
  }

  function selectObjectsInMarquee(marqueeBounds) {
    const selection = getObjectsInMarquee({
      marqueeBounds,
      rooms,
      walls,
      doors,
      windows,
      furniture,
      calibration,
    });

    setBulkSelection(selection);
    setSelectedRoomIds(selection.roomIds);
    setSelectedRoomId(selection.roomIds[0] ?? null);
    setSelectedWallId(selection.wallIds[0] ?? null);
    setSelectedFurnitureId(selection.furnitureIds[0] ?? null);
    setSelectedObject(null);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.repeat) return;
      const isEditingText = isTextEditingTarget(e.target);

      if (e.ctrlKey && e.code === "KeyZ" && e.shiftKey) {
        e.preventDefault();
        redoLastCanvasChange();
        return;
      }

      if (e.ctrlKey && e.code === "KeyZ") {
        e.preventDefault();
        undoLastCanvasChange();
        return;
      }

      if (e.ctrlKey && e.code === "KeyY") {
        e.preventDefault();
        redoLastCanvasChange();
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setTemporaryTool("pan");
        return;
      }

      if (
        selectedObject?.type === "door" &&
        e.code === "KeyR" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        toggleDoorDirection(selectedObject.id);
        return;
      }

      if (e.code === "Escape") {
        e.preventDefault();

        setPendingFurniture(null);

        setMeasurement({
          points: [],
          pixelDistance: null,
          distanceMm: null,
        });

        setSelectedFurnitureId(null);
        setBulkSelection(EMPTY_BULK_SELECTION);
        setBackgroundCalibrationActive(false);
        setBackgroundRoomAlignActive(false);
        setActiveTool("select");
        setTemporaryTool(null);

        return;
      }

      if (
        (e.code === "Delete" || e.code === "Backspace") &&
        isEditingText
      ) {
        return;
      }

      if (
        selectedFurnitureId &&
        e.code === "KeyR" &&
        !isEditingText &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        const selectedFurniture = furniture.find(
          (item) => item.id === selectedFurnitureId,
        );

        if (selectedFurniture) {
          e.preventDefault();
          rotateFurniture(
            selectedFurniture.id,
            (selectedFurniture.rotation ?? 0) + (e.shiftKey ? -15 : 15),
          );
        }

        return;
      }

      if (e.code === "Delete" || e.code === "Backspace") {
        if (hasBulkSelection(bulkSelection)) {
          e.preventDefault();
          deleteSelectedObjects(bulkSelection);
          return;
        }

        if (selectedRoomId) {
          e.preventDefault();
          deleteSelectedRoom();
          return;
        }

        if (selectedObject?.type === "door") {
          e.preventDefault();
          deleteSelectedDoor();
          return;
        }

        if (selectedObject?.type === "window") {
          e.preventDefault();
          deleteSelectedWindow();
          return;
        }

        if (selectedObject?.type === "background") {
          e.preventDefault();
          removeBackground();
          return;
        }

        if (selectedWallId) {
          e.preventDefault();
          deleteSelectedWall();
          return;
        }

        if (selectedFurnitureId) {
          e.preventDefault();
          deleteSelectedFurniture();
        }

        return;
      }

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          e.code,
        ) &&
        !isEditingText
      ) {
        e.preventDefault();

        const step = e.shiftKey ? 10 : 1;

        // Eerst: geselecteerde ruimte
        if (selectedRoomId) {
          const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

          if (selectedRoom?.locked) return;

          let delta = { x: 0, y: 0 };

          if (e.code === "ArrowUp") delta = { x: 0, y: -step };
          if (e.code === "ArrowDown") delta = { x: 0, y: step };
          if (e.code === "ArrowLeft") delta = { x: -step, y: 0 };
          if (e.code === "ArrowRight") delta = { x: step, y: 0 };

          moveRoom(selectedRoomId, delta);
          return;
        }

        if (selectedWallId) {
          let delta = { x: 0, y: 0 };

          if (e.code === "ArrowUp") delta = { x: 0, y: -step };
          if (e.code === "ArrowDown") delta = { x: 0, y: step };
          if (e.code === "ArrowLeft") delta = { x: -step, y: 0 };
          if (e.code === "ArrowRight") delta = { x: step, y: 0 };

          moveWall(selectedWallId, delta);
          return;
        }

        // Daarna pas meubels
        if (!selectedFurnitureId) return;

        pushUndoSnapshot();

        setFurniture((current) =>
          current.map((item) => {
            if (item.id !== selectedFurnitureId) return item;

            if (e.code === "ArrowUp") return { ...item, y: item.y - step };
            if (e.code === "ArrowDown") return { ...item, y: item.y + step };
            if (e.code === "ArrowLeft") return { ...item, x: item.x - step };
            if (e.code === "ArrowRight") return { ...item, x: item.x + step };

            return item;
          }),
        );
      }
    }

    function handleKeyUp(e) {
      if (e.code === "Space") {
        setTemporaryTool(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    selectedFurnitureId,
    selectedWallId,
    selectedObject,
    selectedRoomId,
    selectedRoomIds,
    rooms,
    furniture,
    undoStack,
    redoStack,
  ]);

  return (
    <div className="app-layout">
      <Toolbar />

      <main className="workspace">
        <Sidebar
          onAddFurniture={addFurniture}
          myFurniture={myFurniture}
          onDeleteMyFurniture={deleteMyFurniture}
          onNewFurniture={() => setDialogOpen(true)}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onClearWalls={clearWalls}
          onResetCanvasView={resetCanvasView}
          showWallDimensions={showWallDimensions}
          onToggleWallDimensions={toggleWallDimensions}
          onStartRoomDraft={startRoomDraft}
          onUnlockAllRooms={unlockAllRooms}
          roomDraftWallIds={roomDraftWallIds}
          onSaveRoomDraft={saveRoomDraft}
          onCreate={createRectangleRoom}
          onStartOpening={startOpeningWorkflow}
          onSaveProject={() => saveProjectSnapshot({ showConfirmation: true })}
          onRestoreSavedProject={restoreManualSavedProject}
          canRestoreSavedProject={hasMeaningfulSavedProject(manualSavedProject)}
        />

        <Canvas
          furniture={furniture}
          walls={walls}
          doors={doors}
          openings={openings}
          background={background}
          backgroundCalibrationActive={backgroundCalibrationActive}
          backgroundRoomAlignActive={backgroundRoomAlignActive}
          backgroundScaleCompleted={backgroundScaleCompleted}
          backgroundScaleMmPerPixel={backgroundScaleMmPerPixel}
          backgroundCalibrationMeasurement={backgroundCalibrationMeasurement}
          backgroundCalibrationPointCount={backgroundCalibrationPointCount}
          onImportBackground={importBackground}
          onStartBackgroundCalibration={startBackgroundCalibration}
          onCancelBackgroundCalibration={cancelBackgroundCalibration}
          onApplyBackgroundCalibration={applyBackgroundCalibration}
          backgroundWorkflowRequest={backgroundWorkflowRequest}
          addWall={addWall}
          addDoor={addDoor}
          onStartDoorMove={startDoorMove}
          onUpdateDoorPosition={updateDoorPosition}
          selectedFurnitureId={selectedFurnitureId}
          onSelectFurniture={selectFurniture}
          onMoveFurniture={moveFurniture}
          measurement={measurement}
          onMeasurementChange={setMeasurement}
          calibration={calibration}
          activeTool={activeTool}
          pendingFurniture={pendingFurniture}
          onPlaceFurniture={placePendingFurniture}
          temporaryTool={temporaryTool}
          onResizeFurniture={resizeFurniture}
          selectedWallId={selectedWallId}
          onSelectWall={setSelectedWallId}
          onUpdateWallPoint={updateWallPoint}
          onMoveWall={moveWall}
          onSelectTool={setActiveTool}
          selectedObject={selectedObject}
          onSelectObject={selectObject}
          onClearSelection={clearSelection}
          onStartBackgroundMove={startBackgroundMove}
          onUpdateBackground={updateBackground}
          onFinishBackgroundCalibration={finishBackgroundCalibration}
          onBackgroundCalibrationPointCountChange={
            setBackgroundCalibrationPointCount
          }
          onFinishBackgroundRoomAlign={finishBackgroundRoomAlign}
          windows={windows}
          addWindow={addWindow}
          onUpdateWindowPosition={updateWindowPosition}
          resetCanvasRequest={resetCanvasRequest}
          canvasCamera={canvasCamera}
          canvasCameraRestoreRequest={canvasCameraRestoreRequest}
          onCanvasCameraChange={updateCanvasCamera}
          showWallDimensions={showWallDimensions}
          showFloorplan={showFloorplan}
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          roomDraftWallIds={roomDraftWallIds}
          onToggleRoomDraftWall={toggleRoomDraftWall}
          onSelectRoomByWallId={selectRoomByWallId}
          onSelectRoom={selectRoom}
          onMoveRoom={moveRoom}
          onMarqueeSelect={selectObjectsInMarquee}
          activeSnapGuides={activeSnapGuides}
          onClearSnapGuides={() => setActiveSnapGuides([])}
          onToggleDoorDirection={toggleDoorDirection}
          onToggleDoorSwing={toggleDoorSwing}
          selectedRoomIds={selectedRoomIds}
          onSelectOpeningWall={selectOpeningWall}
        />

        <Inspector
          measurement={measurement}
          calibration={calibration}
          backgroundScaleMmPerPixel={backgroundScaleMmPerPixel}
          onCalibrate={calibrate}
          selectedFurnitureId={selectedFurnitureId}
          furniture={furniture}
          onUpdateFurnitureSize={updateFurnitureSize}
          onUpdateFurnitureRotation={rotateFurniture}
          onDeleteSelectedFurniture={deleteSelectedFurniture}
          selectedWallId={selectedWallId}
          walls={walls}
          onUpdateWallSize={updateWallSize}
          selectedObject={selectedObject}
          doors={doors}
          openings={openings}
          background={background}
          backgroundScaleCompleted={backgroundScaleCompleted}
          showFloorplan={showFloorplan}
          backgroundCalibrationActive={backgroundCalibrationActive}
          backgroundRoomAlignActive={backgroundRoomAlignActive}
          backgroundCalibrationMeasurement={backgroundCalibrationMeasurement}
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          selectedRoomIds={selectedRoomIds}
          onUpdateRectangleRoomSize={updateRectangleRoomSize}
          onUpdateRectangleRoomWalls={updateRectangleRoomWalls}
          onSetRoomLocked={setRoomLocked}
          onToggleDoorDirection={toggleDoorDirection}
          onConvertOpeningToDoor={convertOpeningToDoor}
          onConvertDoorToOpening={convertDoorToOpening}
          onUpdateBackground={updateBackground}
          onImportBackground={importBackground}
          onRemoveBackground={removeBackground}
          onToggleFloorplan={toggleFloorplan}
          onStartBackgroundCalibration={startBackgroundCalibration}
          onApplyBackgroundCalibration={applyBackgroundCalibration}
          onStartBackgroundRoomAlign={startBackgroundRoomAlign}
          onStartBackgroundReplaceWorkflow={() => startBackgroundWorkflow(2)}
          onStartBackgroundResizeWorkflow={() => startBackgroundWorkflow(5)}
          onSelectBackground={() => {
            if (!background) return;

            setShowFloorplan(true);
            setBackground((current) =>
              current
                ? {
                    ...current,
                    visible: true,
                  }
                : current,
            );
            setSelectedObject({ type: "background", id: "background" });
          }}
        />
      </main>

      <StatusBar />

      {manualSaveVisible && (
        <div className="save-toast" role="status" aria-live="polite">
          ✓ Project opgeslagen
        </div>
      )}

      {showRestorePrompt && (
        <div className="restore-overlay" role="dialog" aria-modal="true">
          <section className="restore-card" aria-labelledby="restore-title">
            <h2 id="restore-title">👋 Welkom terug!</h2>
            <p>Je was bezig met:</p>
            <strong>{savedProject?.projectTitle ?? PROJECT_TITLE}</strong>
            <div className="restore-actions">
              <button
                className="restore-button restore-button-primary"
                onClick={continueSavedProject}
              >
                Verdergaan
              </button>
              <button className="restore-button" onClick={startNewProject}>
                Nieuw project
              </button>
            </div>
          </section>
        </div>
      )}

      <NewFurnitureDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={saveNewFurniture}
      />

      <RectangleRoomDialog
        open={rectangleRoomDialogOpen}
        onClose={() => setRectangleRoomDialogOpen(false)}
        onCreate={createRectangleRoom}
      />

      <OpeningDialog
        open={openingDialogOpen}
        onClose={() => setOpeningDialogOpen(false)}
        onCreate={prepareOpening}
      />
    </div>
  );
}

export default AppLayout;
