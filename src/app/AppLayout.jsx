import { useState } from "react";

import Toolbar from "../components/Toolbar/Toolbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Canvas from "../components/Canvas/Canvas";
import Inspector from "../components/Inspector/Inspector";
import StatusBar from "../components/StatusBar/StatusBar";

import "../styles/AppLayout.css";

function AppLayout() {
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

  function addFurniture(type) {
    if (type !== "sofa") return;

    setFurniture((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        type: "sofa",
        name: "Bank",
        x: 180 + current.length * 20,
        y: 180 + current.length * 20,
        width: 220,
        height: 90,
      },
    ]);
  }

  function moveFurniture(id, position) {
    setFurniture((current) =>
      current.map((item) => (item.id === id ? { ...item, ...position } : item)),
    );
  }

  return (
    <div className="app-layout">
      <Toolbar />

      <main className="workspace">
        <Sidebar onAddFurniture={addFurniture} />

        <Canvas furniture={furniture} onMoveFurniture={moveFurniture} />

        <Inspector />
      </main>

      <StatusBar />
    </div>
  );
}

export default AppLayout;
