import { useEffect, useState } from "react";

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
import { createCalibration } from "../measurement";

import { createWall } from "../walls/wallUtils";

const STORAGE_KEYS = {
  furniture: "companion-roomsketch-placed-furniture",
  calibration: "companion-roomsketch-calibration",
  myFurniture: "companion-roomsketch-my-furniture",
  walls: "companion-roomsketch-walls",
  doors: "companion-roomsketch-doors",
  windows: "companion-roomsketch-windows",
  rooms: "companion-roomsketch-rooms",
  showFloorplan: "companion-roomsketch-show-floorplan",
};

const SNAP_DISTANCE = 20;
const EMPTY_BULK_SELECTION = {
  roomIds: [],
  wallIds: [],
  doorIds: [],
  windowIds: [],
  furnitureIds: [],
};

function loadFromStorage(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

function cloneCanvasState(snapshot) {
  return JSON.parse(JSON.stringify(snapshot));
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
    .filter((room) => room.bounds && rectMatchesMarquee(room.bounds, marqueeBounds))
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

function AppLayout() {
  const [furniture, setFurniture] = useState(() =>
    loadFromStorage(STORAGE_KEYS.furniture, []),
  );

  const [walls, setWalls] = useState(() =>
    loadFromStorage(STORAGE_KEYS.walls, []),
  );

  const [doors, setDoors] = useState(() =>
    loadFromStorage(STORAGE_KEYS.doors, []),
  );

  const [windows, setWindows] = useState(() =>
    loadFromStorage(STORAGE_KEYS.windows, []),
  );

  const [selectedWallId, setSelectedWallId] = useState(null);

  const [selectedObject, setSelectedObject] = useState(null);

  const [showWallDimensions, setShowWallDimensions] = useState(true);
  const [showFloorplan, setShowFloorplan] = useState(() =>
    loadFromStorage(STORAGE_KEYS.showFloorplan, true),
  );

  const [resetCanvasRequest, setResetCanvasRequest] = useState(0);

  const [rooms, setRooms] = useState(() =>
    loadFromStorage(STORAGE_KEYS.rooms, []),
  );

  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const [selectedRoomIds, setSelectedRoomIds] = useState([]);

  const [roomDraftWallIds, setRoomDraftWallIds] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [activeSnapGuides, setActiveSnapGuides] = useState([]);
  const [bulkSelection, setBulkSelection] = useState(EMPTY_BULK_SELECTION);

  function captureUndoState() {
    return cloneCanvasState({
      walls,
      rooms,
      doors,
      windows,
      furniture,
    });
  }

  function pushUndoSnapshot() {
    const snapshot = captureUndoState();

    setUndoStack((current) => [...current, snapshot].slice(-30));
  }

  function restoreUndoState(snapshot) {
    setWalls(snapshot.walls);
    setRooms(snapshot.rooms);
    setDoors(snapshot.doors);
    setWindows(snapshot.windows);
    setFurniture(snapshot.furniture);

    setSelectedWallId(null);
    setSelectedObject(null);
    setSelectedRoomId(null);
    setSelectedRoomIds([]);
    setSelectedFurnitureId(null);
    setBulkSelection(EMPTY_BULK_SELECTION);
  }

  function undoLastCanvasChange() {
    const snapshot = undoStack[undoStack.length - 1];

    if (!snapshot) return;

    restoreUndoState(snapshot);
    setUndoStack((current) => current.slice(0, -1));
  }

  function addWall(wall) {
    pushUndoSnapshot();
    setWalls((current) => [...current, wall]);
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
  }

  function clearWalls() {
    if (!walls.length) return;

    pushUndoSnapshot();
    setWalls([]);
  }

  function resetCanvasView() {
    setResetCanvasRequest((current) => current + 1);
  }

  function toggleWallDimensions() {
    setShowWallDimensions((current) => !current);
  }

  function toggleFloorplan() {
    setShowFloorplan((current) => !current);
  }

  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);
  const [activeTool, setActiveTool] = useState("select");

  const [pendingFurniture, setPendingFurniture] = useState(null);
  const [pendingOpening, setPendingOpening] = useState(null);

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

  const [calibration, setCalibration] = useState(() =>
    loadFromStorage(STORAGE_KEYS.calibration, null),
  );

  const [temporaryTool, setTemporaryTool] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [rectangleRoomDialogOpen, setRectangleRoomDialogOpen] = useState(false);

  const [openingDialogOpen, setOpeningDialogOpen] = useState(false);

  const [myFurniture, setMyFurniture] = useState(() =>
    loadFromStorage(STORAGE_KEYS.myFurniture, []),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.furniture, JSON.stringify(furniture));
  }, [furniture]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.walls, JSON.stringify(walls));
  }, [walls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.doors, JSON.stringify(doors));
  }, [doors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.windows, JSON.stringify(windows));
  }, [windows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.rooms, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.showFloorplan,
      JSON.stringify(showFloorplan),
    );
  }, [showFloorplan]);

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

      localStorage.setItem(STORAGE_KEYS.myFurniture, JSON.stringify(next));

      return next;
    });
  }

  function placePendingFurniture(position) {
    if (!pendingFurniture) return;

    pushUndoSnapshot();

    const newItem = {
      id: crypto.randomUUID(),
      ...pendingFurniture,
      x: position.x,
      y: position.y,
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

      localStorage.setItem(STORAGE_KEYS.myFurniture, JSON.stringify(next));

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

    localStorage.setItem(
      STORAGE_KEYS.calibration,
      JSON.stringify(nextCalibration),
    );
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
    pushUndoSnapshot();

    setFurniture((current) =>
      current.map((item) => (item.id === id ? { ...item, ...size } : item)),
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

    return [
      createWall(wall.startPoint, pointAt(openingStart)),
      createWall(pointAt(openingEnd), wall.endPoint),
    ];
  }

  function createOpeningInWall(wallId) {
    const wall = walls.find((item) => item.id === wallId);
    const nextWalls = wall
      ? splitWallForOpening(wall, pendingOpening?.widthMm)
      : null;

    if (!wall || !nextWalls) return;

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

  function selectRoom(id, addToSelection = false) {
    setSelectedWallId(null);
    setSelectedObject(null);
    setBulkSelection(EMPTY_BULK_SELECTION);

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
    const room = rooms.find((item) => item.wallIds.includes(wallId));

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

      if (e.ctrlKey && e.code === "KeyZ") {
        e.preventDefault();
        undoLastCanvasChange();
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
        setActiveTool("select");
        setTemporaryTool(null);

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
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)
      ) {
        e.preventDefault();

        const step = e.shiftKey ? 10 : 1;

        // Eerst: geselecteerde ruimte
        if (selectedRoomId) {
          let delta = { x: 0, y: 0 };

          if (e.code === "ArrowUp") delta = { x: 0, y: -step };
          if (e.code === "ArrowDown") delta = { x: 0, y: step };
          if (e.code === "ArrowLeft") delta = { x: -step, y: 0 };
          if (e.code === "ArrowRight") delta = { x: step, y: 0 };

          moveRoom(selectedRoomId, delta);
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
    undoStack,
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
          showFloorplan={showFloorplan}
          onToggleFloorplan={toggleFloorplan}
          onStartRoomDraft={startRoomDraft}
          roomDraftWallIds={roomDraftWallIds}
          onSaveRoomDraft={saveRoomDraft}
          onCreate={createRectangleRoom}
          onStartOpening={startOpeningWorkflow}
        />

        <Canvas
          furniture={furniture}
          walls={walls}
          doors={doors}
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
          windows={windows}
          addWindow={addWindow}
          onUpdateWindowPosition={updateWindowPosition}
          resetCanvasRequest={resetCanvasRequest}
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
          onCalibrate={calibrate}
          selectedFurnitureId={selectedFurnitureId}
          furniture={furniture}
          onUpdateFurnitureSize={updateFurnitureSize}
          onDeleteSelectedFurniture={deleteSelectedFurniture}
          selectedObject={selectedObject}
          doors={doors}
          onToggleDoorDirection={toggleDoorDirection}
        />
      </main>

      <StatusBar />

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
