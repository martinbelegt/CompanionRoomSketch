import "./Sidebar.css";

const items = [
  "📁 Project",

  "🛋 Meubels",

  "🚪 Bouwdelen",

  "📐 Meten",

  "💾 Opslaan",
];

function Sidebar() {
  return (
    <aside className="sidebar">
      {items.map((item) => (
        <button key={item} className="sidebar-button">
          {item}
        </button>
      ))}
    </aside>
  );
}

export default Sidebar;
