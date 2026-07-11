import { useState } from "react";

import furnitureCatalog, {
  furnitureCategories,
} from "../../data/furnitureCatalog";
import "./Sidebar.css";

function Sidebar({
  projectTitle,
  savedProjects = [],
  activeProjectId,
  onSaveProject,
  onRenameProject,
  onNewProject,
  onOpenProject,
  onExportProject,
  onImportProject,
  onAddFurniture,
  activeTool,
  onSelectTool,
  onClearWalls,
  onResetCanvasView,
  showWallDimensions,
  onToggleWallDimensions,
  onStartRoomDraft,
  onUnlockAllRooms,
  roomDraftWallIds = [],
  onSaveRoomDraft,
  onStartOpening,
  onRestoreSavedProject,
  canRestoreSavedProject = false,
  onDetectWalls,
  wallDetectionBusy = false,
  wallSuggestionCount = 0,
  onAcceptWallSuggestions,
  onClearWallSuggestions,
  canDetectWalls = false,
}) {
  const [furnitureOpen, setFurnitureOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    living: true,
    dining: true,
    bedroom: false,
    bathroom: false,
  });

  function toggleGroup(id) {
    setOpenGroups((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function getToolButtonStyle(toolName) {
    return {
      background: activeTool === toolName ? "#2563eb" : "white",
      color: activeTool === toolName ? "white" : "#1e293b",
    };
  }

  function toggleTool(toolName) {
    onSelectTool(activeTool === toolName ? "select" : toolName);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-card sidebar-card-blue">
        <div className="sidebar-section-title">Project</div>

        <div className="sidebar-project-name">{projectTitle}</div>

        <button className="sidebar-button" onClick={onSaveProject}>
          Project opslaan
        </button>

        <button className="sidebar-button" onClick={onRenameProject}>
          Naam wijzigen
        </button>

        <button className="sidebar-button" onClick={onNewProject}>
          Nieuw project
        </button>

        <div className="sidebar-file-actions">
          <button className="sidebar-button" onClick={onExportProject}>
            Projectbestand opslaan
          </button>

          <button className="sidebar-button" onClick={onImportProject}>
            Projectbestand openen
          </button>
        </div>

        {savedProjects.length > 0 && (
          <label className="sidebar-select-label">
            Open project
            <select
              value={activeProjectId ?? ""}
              onChange={(e) => {
                if (!e.target.value) return;
                onOpenProject(e.target.value);
              }}
            >
              <option value="">Kies project...</option>
              {savedProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectTitle ?? "Naamloos project"}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="sidebar-card sidebar-card-gray">
        <div className="sidebar-section-title">Stap 1 • Woning tekenen</div>

        <button
          className="sidebar-button"
          style={getToolButtonStyle("rectangleRoom")}
          onClick={() => toggleTool("rectangleRoom")}
        >
          🏠 Rechthoekige ruimte
          <br />
          <small>Maak snel een kamer op maat</small>
        </button>

        <button
          className="sidebar-button"
          style={getToolButtonStyle("pan")}
          onClick={() => toggleTool("pan")}
        >
          ✋ Plattegrond schuiven
          <br />
          <small>(Spatiebalk ingedrukt houden)</small>
        </button>

        <button
          className="sidebar-button"
          style={getToolButtonStyle("measure")}
          onClick={() => toggleTool("measure")}
        >
          📏 Afstand meten
          <br />
          <small>(Klik twee punten)</small>
        </button>

        <button
          className="sidebar-button"
          style={getToolButtonStyle("wall")}
          onClick={() => toggleTool("wall")}
        >
          Muren tekenen
          <br />
          <small>(Klik • Klik • Shift = recht)</small>
        </button>

        <button
          className="sidebar-button"
          onClick={onDetectWalls}
          disabled={!canDetectWalls || wallDetectionBusy}
        >
          {wallDetectionBusy ? "Muren zoeken..." : "Muren herkennen"}
          <br />
          <small>Maak eerst blauwe voorstellen</small>
        </button>

        {wallSuggestionCount > 0 && (
          <div className="sidebar-suggestion-actions">
            <div className="sidebar-small-text">
              Gevonden muren: {wallSuggestionCount}
            </div>
            <button
              className="sidebar-button sidebar-primary-button"
              onClick={onAcceptWallSuggestions}
            >
              Voorstellen accepteren
            </button>
            <button className="sidebar-button" onClick={onClearWallSuggestions}>
              Voorstellen wissen
            </button>
          </div>
        )}

        <button
          className="sidebar-button"
          style={getToolButtonStyle("room")}
          onClick={onStartRoomDraft}
        >
          Ruimte maken
          <br />
          <small>Klik de muren van één ruimte aan</small>
        </button>

        {activeTool === "room" && (
          <>
            <div className="sidebar-small-text">
              Gekozen muren: {roomDraftWallIds.length}
            </div>

            <button
              className="sidebar-button sidebar-primary-button"
              onClick={onSaveRoomDraft}
            >
              Ruimte opslaan →
            </button>
          </>
        )}

        <button
          className="sidebar-button"
          style={getToolButtonStyle("door")}
          onClick={() => toggleTool("door")}
        >
          🚪 Deuren plaatsen
          <br />
          <small>Klik op een muur of in een open doorgang</small>
        </button>

        <button
          className="sidebar-button"
          style={getToolButtonStyle("opening")}
          onClick={onStartOpening}
        >
          Open doorgang
          <br />
          <small>Maak een doorgang in een muur</small>
        </button>

        <button
          className="sidebar-button"
          style={getToolButtonStyle("window")}
          onClick={() => toggleTool("window")}
        >
          Ramen plaatsen
          <br />
          <small>(Klik op een muur)</small>
        </button>

        <button className="sidebar-button" onClick={onResetCanvasView}>
          Terug naar beginstand
        </button>

        <button className="sidebar-button" onClick={onToggleWallDimensions}>
          {showWallDimensions ? "Maten verbergen" : "Maten tonen"}
        </button>

        <button className="sidebar-button" onClick={onUnlockAllRooms}>
          Alle ruimtes ontgrendelen
        </button>

        <button className="sidebar-button" onClick={onClearWalls}>
          Wis alle muren
        </button>

        <button
          className="sidebar-button"
          onClick={onRestoreSavedProject}
          disabled={!canRestoreSavedProject}
        >
          Terug naar laatste opslag
        </button>
      </div>

      <div className="sidebar-card sidebar-card-green">
        <button
          className="sidebar-button sidebar-library-toggle"
          onClick={() => setFurnitureOpen((open) => !open)}
        >
          {furnitureOpen ? "▾" : "▸"} Meubels toevoegen
        </button>

        {furnitureOpen &&
          furnitureCategories.map((group) => (
            <div key={group.id} className="sidebar-category">
              <button
                className="sidebar-button sidebar-category-button"
                onClick={() => toggleGroup(group.id)}
              >
                <span>
                  {openGroups[group.id] ? "▾" : "▸"} {group.icon}{" "}
                  {group.title}
                </span>
                <span className="sidebar-count">{group.items.length}</span>
              </button>

              {openGroups[group.id] &&
                group.items.map((catalogId) => {
                  const item = furnitureCatalog[catalogId];

                  if (!item) return null;

                  return (
                    <button
                      key={catalogId}
                      className="sidebar-button sidebar-furniture-pick"
                      onClick={() => onAddFurniture(catalogId)}
                    >
                      {item.name}
                    </button>
                  );
                })}
            </div>
          ))}
      </div>
    </aside>
  );
}

export default Sidebar;
