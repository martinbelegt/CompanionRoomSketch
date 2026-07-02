import { useState } from "react";

import "./Sidebar.css";

const starterFurnitureGroups = [
  {
    id: "living",
    title: "🛋 Woonkamer",
    items: [
      { id: "sofa", label: "🛋 Bank" },
      { id: "corner-sofa", label: "🛋 Hoekbank" },
      { id: "coffee-table", label: "☕ Salontafel" },
      { id: "tv-cabinet", label: "📺 TV-meubel" },
      { id: "bookcase", label: "📚 Boekenkast" },
      { id: "armchair", label: "🪑 Fauteuil" },
    ],
  },
  {
    id: "dining",
    title: "🍽 Eetkamer",
    items: [
      { id: "dining-table", label: "🍽 Eettafel" },
      { id: "dining-chair", label: "🪑 Stoel" },
      { id: "sideboard", label: "🗄 Buffetkast" },
    ],
  },
  {
    id: "kitchen",
    title: "🍳 Keuken",
    items: [
      { id: "kitchen-cabinet", label: "🍳 Keukenkast" },
      { id: "kitchen-island", label: "⬜ Kookeiland" },
      { id: "fridge", label: "🧊 Koelkast" },
      { id: "tall-cabinet", label: "🗄 Hoge kast" },
    ],
  },
  {
    id: "bedroom",
    title: "🛏 Slaapkamer",
    items: [
      { id: "bed", label: "🛏 Bed" },
      { id: "nightstand", label: "🛏 Nachtkastje" },
      { id: "wardrobe", label: "👕 Kledingkast" },
      { id: "desk", label: "🖥 Bureau" },
    ],
  },
  {
    id: "bathroom",
    title: "🚿 Badkamer",
    items: [
      { id: "sink", label: "🚰 Wastafel" },
      { id: "shower", label: "🚿 Douche" },
      { id: "bathtub", label: "🛁 Bad" },
      { id: "toilet", label: "🚽 Toilet" },
      { id: "mirror-cabinet", label: "🪞 Spiegelkast" },
    ],
  },
  {
    id: "other",
    title: "📦 Overig",
    items: [
      { id: "washing-machine", label: "🧺 Wasmachine" },
      { id: "dryer", label: "🧺 Droger" },
      { id: "storage-cabinet", label: "🗄 Kast" },
      { id: "shelf", label: "📏 Plank" },
    ],
  },
];

function Sidebar({
  onAddFurniture,
  myFurniture,
  onDeleteMyFurniture,
  onNewFurniture,
  activeTool,
  onSelectTool,
  onClearWalls,
}) {
  const [furnitureOpen, setFurnitureOpen] = useState(true);
  const [myFurnitureOpen, setMyFurnitureOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState({
    living: true,
    bedroom: true,
    bathroom: true,
  });

  function toggleGroup(id) {
    setOpenGroups((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-card sidebar-card-blue">
        <div className="sidebar-section-title">👋 Companion Coach</div>

        <div className="sidebar-progress">
          <div className="sidebar-progress-fill" />
        </div>

        <div className="sidebar-small-text">17% voltooid</div>

        <p className="sidebar-small-text">
          <strong>Stap 1 van 6</strong>
          <br />
          We gaan samen je woning op schaal tekenen.
        </p>

        <button className="sidebar-button sidebar-primary-button">
          Volgende stap →
        </button>
      </div>

      <div className="sidebar-card sidebar-card-gray">
        <div className="sidebar-section-title">Stap 1 • Woning tekenen</div>

        <button
          className="sidebar-button"
          style={{
            background: activeTool === "pan" ? "#2563eb" : "white",
            color: activeTool === "pan" ? "white" : "#1e293b",
          }}
          onClick={() => onSelectTool(activeTool === "pan" ? "select" : "pan")}
        >
          ✋ Plattegrond schuiven
          <br />
          <small>(Spatiebalk ingedrukt houden)</small>
        </button>

        <button
          className="sidebar-button"
          style={{
            background: activeTool === "measure" ? "#2563eb" : "white",
            color: activeTool === "measure" ? "white" : "#1e293b",
          }}
          onClick={() =>
            onSelectTool(activeTool === "measure" ? "select" : "measure")
          }
        >
          📏 Afstand meten
          <br />
          <small>(Klik twee punten)</small>
        </button>

        <button
          className="sidebar-button"
          style={{
            background: activeTool === "wall" ? "#2563eb" : "white",
            color: activeTool === "wall" ? "white" : "#1e293b",
          }}
          onClick={() =>
            onSelectTool(activeTool === "wall" ? "select" : "wall")
          }
        >
          🧱 Muren tekenen
          <br />
          <small>(Klik • Klik • Shift = recht)</small>
        </button>

        <button className="sidebar-button" onClick={onClearWalls}>
          🗑 Wis alle muren
        </button>

        <button className="sidebar-button">💾 Opslaan</button>
      </div>

      <div className="sidebar-card sidebar-card-green">
        <button
          className="sidebar-button"
          onClick={() => setFurnitureOpen((open) => !open)}
        >
          {furnitureOpen ? "▾" : "▸"} 🟩 Meubels toevoegen
        </button>

        {furnitureOpen &&
          starterFurnitureGroups.map((group) => (
            <div key={group.id} className="sidebar-category">
              <button
                className="sidebar-button"
                onClick={() => toggleGroup(group.id)}
              >
                {openGroups[group.id] ? "▾" : "▸"} {group.title} (
                {group.items.length})
              </button>

              {openGroups[group.id] &&
                group.items.map((item) => (
                  <button
                    key={item.id}
                    className="sidebar-button sidebar-nested-button"
                    onClick={() => onAddFurniture(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          ))}
      </div>

      <div className="sidebar-card sidebar-card-pink">
        <button
          className="sidebar-button"
          onClick={() => setMyFurnitureOpen((open) => !open)}
        >
          {myFurnitureOpen ? "▾" : "▸"} ❤️ Mijn meubels
        </button>

        {myFurnitureOpen &&
          myFurniture.map((item) => (
            <div key={item.id} className="sidebar-furniture-row">
              <button
                className="sidebar-button sidebar-furniture-button"
                onClick={() => onAddFurniture(item.id)}
              >
                🧩 {item.name}
              </button>

              <button
                className="sidebar-delete-button"
                onClick={() => onDeleteMyFurniture(item.id)}
                title="Verwijder uit mijn meubels"
              >
                ×
              </button>
            </div>
          ))}

        <button className="sidebar-button" onClick={onNewFurniture}>
          ✨ Maak eigen meubel
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
