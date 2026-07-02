import "./Sidebar.css";

function Sidebar({
  onAddFurniture,
  myFurniture,
  onDeleteMyFurniture,
  onNewFurniture,
  activeTool,
  onSelectTool,
  onClearWalls,
}) {
  return (
    <aside className="sidebar">
      <button className="sidebar-button">📁 Project</button>

      <div className="sidebar-section-title">🏠 Onze meubels</div>

      {myFurniture.map((item) => (
        <div key={item.id} className="sidebar-furniture-row">
          <button
            className="sidebar-button sidebar-furniture-button"
            onClick={() => onAddFurniture(item.id)}
          >
            🧩 + {item.name}
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
        ➕ Nieuw meubel
      </button>

      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#1d4ed8",
            marginBottom: "8px",
          }}
        >
          👋 Welkom bij Companion
        </div>

        <div
          style={{
            width: "100%",
            height: "8px",
            background: "#dbeafe",
            borderRadius: "999px",
            overflow: "hidden",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "17%",
              height: "100%",
              background: "#2563eb",
            }}
          />
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "#1d4ed8",
            fontWeight: 600,
            marginBottom: "10px",
          }}
        >
          17% voltooid
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#334155",
            lineHeight: 1.5,
          }}
        >
          <strong>Stap 1 van 6</strong>
          <br />
          We gaan samen je woning op schaal tekenen.
        </div>
      </div>

      <div className="sidebar-section-title">Stap 1 • Woning tekenen</div>

      <button
        className="sidebar-button"
        style={{
          background: activeTool === "pan" ? "#2563eb" : "white",
          color: activeTool === "pan" ? "white" : "#1e293b",
        }}
        onClick={() => onSelectTool(activeTool === "pan" ? "select" : "pan")}
      >
        <>
          ✋ Plattegrond schuiven
          <br />
          <small>(Spatiebalk ingedrukt houden)</small>
        </>
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
        <>
          📏 Afstand meten
          <br />
          <small>(Klik twee punten)</small>
        </>
      </button>

      <button
        className="sidebar-button"
        style={{
          background: activeTool === "wall" ? "#2563eb" : "white",
          color: activeTool === "wall" ? "white" : "#1e293b",
        }}
        onClick={() => onSelectTool(activeTool === "wall" ? "select" : "wall")}
      >
        <>
          🧱 Muren tekenen
          <br />
          <small>(Klik • Klik • Shift = recht)</small>
        </>
      </button>

      <button className="sidebar-button" onClick={onClearWalls}>
        🗑 Wis alle muren
      </button>

      <button className="sidebar-button">💾 Opslaan</button>
    </aside>
  );
}

export default Sidebar;
