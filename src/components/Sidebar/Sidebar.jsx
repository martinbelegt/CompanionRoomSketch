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

      <div className="sidebar-section-title">Hulp</div>

      <button
        className="sidebar-button"
        style={{
          background: activeTool === "pan" ? "#2563eb" : "white",
          color: activeTool === "pan" ? "white" : "#1e293b",
        }}
        onClick={() => onSelectTool(activeTool === "pan" ? "select" : "pan")}
      >
        ✋ Plattegrond schuiven
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
      </button>

      <button
        className="sidebar-button"
        style={{
          background: activeTool === "wall" ? "#2563eb" : "white",
          color: activeTool === "wall" ? "white" : "#1e293b",
        }}
        onClick={() => onSelectTool(activeTool === "wall" ? "select" : "wall")}
      >
        🧱 Muren tekenen
      </button>

      <button className="sidebar-button" onClick={onClearWalls}>
        🗑 Wis alle muren
      </button>

      <button className="sidebar-button">💾 Opslaan</button>
    </aside>
  );
}

export default Sidebar;
