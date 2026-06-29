import "./Sidebar.css";

function Sidebar({ onAddFurniture }) {
  return (
    <aside className="sidebar">
      <button className="sidebar-button">📁 Project</button>

      <div className="sidebar-section-title">Meubels</div>

      <button className="sidebar-button" onClick={() => onAddFurniture("sofa")}>
        🛋️ + Bank
      </button>

      <button className="sidebar-button disabled">🛏️ Bed</button>
      <button className="sidebar-button disabled">🍽️ Tafel</button>
      <button className="sidebar-button disabled">🪑 Stoel</button>

      <div className="sidebar-section-title">Tools</div>

      <button className="sidebar-button">📐 Meten</button>
      <button className="sidebar-button">💾 Opslaan</button>
    </aside>
  );
}

export default Sidebar;
