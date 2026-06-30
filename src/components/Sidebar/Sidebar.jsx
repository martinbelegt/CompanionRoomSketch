import "./Sidebar.css";

function Sidebar({ onAddFurniture, activeTool, onSelectTool }) {
  return (
    <aside className="sidebar">
      <button className="sidebar-button">📁 Project</button>

      <div className="sidebar-section-title">Mijn meubels</div>

      <button
        className="sidebar-button"
        onClick={() => onAddFurniture("sofa2")}
      >
        🛋️ + 2-zits bank
      </button>

      <button
        className="sidebar-button"
        onClick={() => onAddFurniture("sofa3")}
      >
        🛋️ + 3-zits bank
      </button>

      <button
        className="sidebar-button"
        onClick={() => onAddFurniture("diningTable")}
      >
        🍽️ + Eettafel
      </button>

      <button
        className="sidebar-button"
        onClick={() => onAddFurniture("bed180")}
      >
        🛏️ + Bed 180
      </button>

      <button
        className="sidebar-button"
        onClick={() => onAddFurniture("cabinet")}
      >
        🗄️ + Kast
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
      <button className="sidebar-button">💾 Opslaan</button>
    </aside>
  );
}

export default Sidebar;
