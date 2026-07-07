import "./Canvas.css";

import CanvasEngine from "../CanvasEngine/CanvasEngine";

function Canvas({
  furniture,
  walls,
  doors,
  windows,
  openings,
  background,
  addWall,
  addDoor,
  addWindow,
  selectedFurnitureId,
  onSelectFurniture,
  onMoveFurniture,
  measurement,
  onMeasurementChange,
  calibration,
  activeTool,
  pendingFurniture,
  onPlaceFurniture,
  temporaryTool,
  onResizeFurniture,
  selectedWallId,
  onSelectWall,
  onUpdateWallPoint,
  onSelectTool,
  selectedObject,
  onSelectObject,
  onClearSelection,
  onStartBackgroundMove,
  onUpdateBackground,
  onStartDoorMove,
  onUpdateDoorPosition,
  onUpdateWindowPosition,
  resetCanvasRequest,
  showWallDimensions,
  showFloorplan,
  onMoveWall,
  rooms,
  selectedRoomId,
  selectedRoomIds,
  roomDraftWallIds,
  onToggleRoomDraftWall,
  onSelectRoomByWallId,
  onSelectRoom,
  onMoveRoom,
  onMarqueeSelect,
  activeSnapGuides,
  onClearSnapGuides,
  onToggleDoorDirection,
  onToggleDoorSwing,
  onSelectOpeningWall,
}) {
  return (
    <div className="canvas-workspace">
      {activeTool === "opening" && (
        <div className="canvas-hint">
          Klik op de muur waarin je de open doorgang wilt maken.
        </div>
      )}

      <div className="canvas-stage">
        <CanvasEngine
          furniture={furniture}
          walls={walls}
          doors={doors}
          windows={windows}
          openings={openings}
          background={background}
          addWall={addWall}
          addDoor={addDoor}
          addWindow={addWindow}
          selectedFurnitureId={selectedFurnitureId}
          onSelectFurniture={onSelectFurniture}
          onMoveFurniture={onMoveFurniture}
          measurement={measurement}
          onMeasurementChange={onMeasurementChange}
          calibration={calibration}
          activeTool={activeTool}
          pendingFurniture={pendingFurniture}
          onPlaceFurniture={onPlaceFurniture}
          temporaryTool={temporaryTool}
          onResizeFurniture={onResizeFurniture}
          selectedWallId={selectedWallId}
          onSelectWall={onSelectWall}
          onUpdateWallPoint={onUpdateWallPoint}
          onSelectTool={onSelectTool}
          selectedObject={selectedObject}
          onSelectObject={onSelectObject}
          onClearSelection={onClearSelection}
          onStartBackgroundMove={onStartBackgroundMove}
          onUpdateBackground={onUpdateBackground}
          onStartDoorMove={onStartDoorMove}
          onUpdateDoorPosition={onUpdateDoorPosition}
          onUpdateWindowPosition={onUpdateWindowPosition}
          resetCanvasRequest={resetCanvasRequest}
          showWallDimensions={showWallDimensions}
          showFloorplan={showFloorplan}
          onMoveWall={onMoveWall}
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          selectedRoomIds={selectedRoomIds}
          roomDraftWallIds={roomDraftWallIds}
          onToggleRoomDraftWall={onToggleRoomDraftWall}
          onSelectRoomByWallId={onSelectRoomByWallId}
          onSelectRoom={onSelectRoom}
          onMoveRoom={onMoveRoom}
          onMarqueeSelect={onMarqueeSelect}
          activeSnapGuides={activeSnapGuides}
          onClearSnapGuides={onClearSnapGuides}
          onToggleDoorDirection={onToggleDoorDirection}
          onToggleDoorSwing={onToggleDoorSwing}
          onSelectOpeningWall={onSelectOpeningWall}
        />
      </div>
    </div>
  );
}

export default Canvas;
