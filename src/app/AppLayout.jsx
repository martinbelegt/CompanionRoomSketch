import { useEffect, useState } from "react";

import Toolbar from "../components/Toolbar/Toolbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Canvas from "../components/Canvas/Canvas";
import Inspector from "../components/Inspector/Inspector";
import StatusBar from "../components/StatusBar/StatusBar";
import furnitureCatalog from "../data/furnitureCatalog";

import "../styles/AppLayout.css";

function AppLayout() {
  const [furniture, setFurniture] = useState([]);

  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);
  const [activeTool, setActiveTool] = useState("select");
  const [pendingFurniture, setPendingFurniture] = useState(null);

  const [measurement, setMeasurement] = useState({
    points: [],
    pixelDistance: null,
  });

  const [calibration, setCalibration] = useState(null);

  const [temporaryTool, setTemporaryTool] = useState(null);

  function addFurniture(catalogId) {
    const template = furnitureCatalog[catalogId];
    if (!template) return;

    setPendingFurniture(template);
    setActiveTool("placeFurniture");
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

  function moveFurniture(id, position) {
    setFurniture((current) =>
      current.map((item) => (item.id === id ? { ...item, ...position } : item)),
    );
  }

  function calibrate(realDistanceMm) {
    if (!measurement.pixelDistance || !realDistanceMm) return;

    setCalibration({
      pixels: measurement.pixelDistance,
      millimeters: realDistanceMm,
      mmPerPixel: realDistanceMm / measurement.pixelDistance,
    });
  }

  function deleteSelectedFurniture() {
    if (!selectedFurnitureId) return;

    setFurniture((current) =>
      current.filter((item) => item.id !== selectedFurnitureId),
    );

    setSelectedFurnitureId(null);
  }

  function updateFurnitureSize(id, size) {
    setFurniture((current) =>
      current.map((item) => (item.id === id ? { ...item, ...size } : item)),
    );
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
        setPendingFurniture(null);

        setMeasurement({
          points: [],
          pixelDistance: null,
        });

        setSelectedFurnitureId(null);

        setActiveTool("select");

        setTemporaryTool(null);
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
  }, []);

  return (
    <div className="app-layout">
      <Toolbar />

      <main className="workspace">
        <Sidebar
          onAddFurniture={addFurniture}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
        />

        <Canvas
          furniture={furniture}
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
    </div>
  );
}

export default AppLayout;
