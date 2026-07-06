import { useEffect, useState } from "react";

import Toolbar from "../components/Toolbar/Toolbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Canvas from "../components/Canvas/Canvas";
import Inspector from "../components/Inspector/Inspector";
import StatusBar from "../components/StatusBar/StatusBar";
import furnitureCatalog from "../data/furnitureCatalog";
import NewFurnitureDialog from "../components/NewFurnitureDialog/NewFurnitureDialog";
import RectangleRoomDialog from "../components/RectangleRoomDialog/RectangleRoomDialog";

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
};

function loadFromStorage(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
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
  const [showFloorplan, setShowFloorplan] = useState(true);

  const [resetCanvasRequest, setResetCanvasRequest] = useState(0);

  const [rooms, setRooms] = useState(() =>
    loadFromStorage(STORAGE_KEYS.rooms, []),
  );

  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const [selectedRoomIds, setSelectedRoomIds] = useState([]);

  const [roomDraftWallIds, setRoomDraftWallIds] = useState([]);

  function addWall(wall) {
    setWalls((current) => [...current, wall]);
  }
  function addDoor(door) {
    setDoors((current) => [...current, door]);
  }
  function addWindow(windowItem) {
    setWindows((current) => [...current, windowItem]);
  }

  function updateWindowPosition(id, position) {
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

  function updateDoorPosition(id, position) {
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

  function toggleDoorDirection(id) {
    setDoors((current) =>
      current.map((door) =>
        door.id === id
          ? {
              ...door,
              direction: door.direction === "inside" ? "outside" : "inside",
            }
          : door,
      ),
    );
  }

  function toggleDoorSwing(id) {
    setDoors((current) =>
      current.map((door) =>
        door.id === id
          ? {
              ...door,
              swing: door.swing === "left" ? "right" : "left",
            }
          : door,
      ),
    );
  }

  function selectObject(type, id) {
    setSelectedObject({ type, id });
  }

  function clearSelection() {
    setSelectedObject(null);
    setSelectedWallId(null);
    setSelectedRoomId(null);
    setSelectedRoomIds([]);
  }

  function clearWalls() {
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

  function deleteSelectedFurniture() {
    if (!selectedFurnitureId) return;

    setFurniture((current) =>
      current.filter((item) => item.id !== selectedFurnitureId),
    );

    setSelectedFurnitureId(null);
    setSelectedObject(null);
  }
  function deleteSelectedWall() {
    if (!selectedWallId) return;

    setWalls((current) => current.filter((wall) => wall.id !== selectedWallId));

    setSelectedWallId(null);
  }

  function deleteSelectedDoor() {
    if (selectedObject?.type !== "door") return;

    setDoors((current) =>
      current.filter((door) => door.id !== selectedObject.id),
    );

    setSelectedObject(null);
  }

  function deleteSelectedWindow() {
    if (selectedObject?.type !== "window") return;

    setWindows((current) =>
      current.filter((windowItem) => windowItem.id !== selectedObject.id),
    );

    setSelectedObject(null);
  }

  function updateWallPoint(id, pointName, position) {
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

  function moveRoom(roomId, delta) {
    const room = rooms.find((item) => item.id === roomId);

    if (!room) return;

    // Muren
    setWalls((current) =>
      current.map((wall) =>
        room.wallIds.includes(wall.id)
          ? {
              ...wall,
              startPoint: {
                x: wall.startPoint.x + delta.x,
                y: wall.startPoint.y + delta.y,
              },
              endPoint: {
                x: wall.endPoint.x + delta.x,
                y: wall.endPoint.y + delta.y,
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
                x: door.position.x + delta.x,
                y: door.position.y + delta.y,
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
                x: windowItem.position.x + delta.x,
                y: windowItem.position.y + delta.y,
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
                x: item.center.x + delta.x,
                y: item.center.y + delta.y,
              },
              bounds: item.bounds
                ? {
                    ...item.bounds,
                    x: item.bounds.x + delta.x,
                    y: item.bounds.y + delta.y,
                  }
                : item.bounds,
            }
          : item,
      ),
    );
  }

  function updateFurnitureSize(id, size) {
    setFurniture((current) =>
      current.map((item) => (item.id === id ? { ...item, ...size } : item)),
    );
  }

  function startRoomDraft() {
    setRoomDraftWallIds([]);
    setSelectedRoomId(null);
    setActiveTool("room");
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

    setWalls((current) => [...current, ...newWalls]);
    setRooms((current) => [...current, room]);

    setSelectedRoomId(room.id);
    setSelectedRoomIds([room.id]);

    setRectangleRoomDialogOpen(false);
  }

  function selectRoom(id, addToSelection = false) {
    setSelectedWallId(null);
    setSelectedObject(null);

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
    return true;
  }

  function deleteSelectedRoom() {
    if (!selectedRoomIds.length && !selectedRoomId) return;

    const idsToDelete = selectedRoomIds.length
      ? selectedRoomIds
      : [selectedRoomId];

    setRooms((current) =>
      current.filter((room) => !idsToDelete.includes(room.id)),
    );

    setSelectedRoomId(null);
    setSelectedRoomIds([]);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.repeat) return;

      if (e.code === "Space") {
        e.preventDefault();
        setTemporaryTool("pan");
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
        setActiveTool("select");
        setTemporaryTool(null);

        return;
      }

      if (selectedObject?.type === "window") {
        deleteSelectedWindow();
        return;
      }

      if (e.code === "Delete") {
        if (selectedRoomId) {
          deleteSelectedRoom();
          return;
        }

        if (selectedObject?.type === "door") {
          deleteSelectedDoor();
          return;
        }

        if (selectedWallId) {
          deleteSelectedWall();
          return;
        }

        if (selectedFurnitureId) {
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
        />

        <Canvas
          furniture={furniture}
          walls={walls}
          doors={doors}
          addWall={addWall}
          addDoor={addDoor}
          onUpdateDoorPosition={updateDoorPosition}
          selectedFurnitureId={selectedFurnitureId}
          onSelectFurniture={setSelectedFurnitureId}
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
          onToggleDoorDirection={toggleDoorDirection}
          onToggleDoorSwing={toggleDoorSwing}
          selectedRoomIds={selectedRoomIds}
        />

        <Inspector
          measurement={measurement}
          calibration={calibration}
          onCalibrate={calibrate}
          selectedFurnitureId={selectedFurnitureId}
          furniture={furniture}
          onUpdateFurnitureSize={updateFurnitureSize}
          onDeleteSelectedFurniture={deleteSelectedFurniture}
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
    </div>
  );
}

export default AppLayout;
