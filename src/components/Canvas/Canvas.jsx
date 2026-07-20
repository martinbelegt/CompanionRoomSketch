import "./Canvas.css";

import CanvasEngine from "../CanvasEngine/CanvasEngine";
import RoomSketchWizard from "../Wizard/RoomSketchWizard";

function Canvas({
  furniture,
  walls,
  wallSuggestions,
  doors,
  windows,
  openings,
  background,
  backgroundCalibrationActive,
  backgroundRoomAlignActive,
  backgroundScaleCompleted,
  backgroundScaleMmPerPixel,
  backgroundCalibration,
  candidateBackgroundCalibration,
  backgroundCalibrationMeasurement,
  backgroundCalibrationPointCount,
  onImportBackground,
  onStartBackgroundCalibration,
  onCancelBackgroundCalibration,
  onApplyBackgroundCalibration,
  onFinishBackgroundCalibrationChoice,
  backgroundWorkflowRequest,
  addWall,
  onRemoveWallSuggestion,
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
  onFinishBackgroundCalibration,
  onBackgroundCalibrationPointCountChange,
  onFinishBackgroundRoomAlign,
  onStartDoorMove,
  onUpdateDoorPosition,
  onUpdateDoorSize,
  onUpdateWindowPosition,
  resetCanvasRequest,
  canvasCamera,
  canvasCameraRestoreRequest,
  onCanvasCameraChange,
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
  onConvertOpeningToDoor,
  onPlaceDoorInWallGap,
}) {
  return (
    <div className="canvas-workspace">
      {activeTool === "opening" && (
        <div className="canvas-hint">
          Klik op de muur waarin je de open doorgang wilt maken.
        </div>
      )}
      {activeTool === "door" && (
        <div className="canvas-hint">
          Klik op een muur, of op de gewenste plek in een open doorgang.
        </div>
      )}
      {backgroundRoomAlignActive && (
        <div className="canvas-hint">
          Klik in dezelfde ruimte op de bouwtekening.
        </div>
      )}

      <div className="canvas-stage">
        <CanvasEngine
          furniture={furniture}
          walls={walls}
          wallSuggestions={wallSuggestions}
          doors={doors}
          windows={windows}
          openings={openings}
          background={background}
          backgroundCalibrationActive={backgroundCalibrationActive}
          backgroundRoomAlignActive={backgroundRoomAlignActive}
          addWall={addWall}
          onRemoveWallSuggestion={onRemoveWallSuggestion}
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
          onFinishBackgroundCalibration={onFinishBackgroundCalibration}
          onBackgroundCalibrationPointCountChange={
            onBackgroundCalibrationPointCountChange
          }
          onFinishBackgroundRoomAlign={onFinishBackgroundRoomAlign}
          onStartDoorMove={onStartDoorMove}
          onUpdateDoorPosition={onUpdateDoorPosition}
          onUpdateDoorSize={onUpdateDoorSize}
          onUpdateWindowPosition={onUpdateWindowPosition}
          resetCanvasRequest={resetCanvasRequest}
          canvasCamera={canvasCamera}
          canvasCameraRestoreRequest={canvasCameraRestoreRequest}
          onCanvasCameraChange={onCanvasCameraChange}
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
          onConvertOpeningToDoor={onConvertOpeningToDoor}
          onPlaceDoorInWallGap={onPlaceDoorInWallGap}
        />
      </div>

      <RoomSketchWizard
        background={background}
        backgroundCalibrationActive={backgroundCalibrationActive}
        backgroundCalibrationMeasurement={backgroundCalibrationMeasurement}
        backgroundCalibrationPointCount={backgroundCalibrationPointCount}
        backgroundScaleMmPerPixel={backgroundScaleMmPerPixel}
        backgroundScaleCompleted={backgroundScaleCompleted}
        backgroundCalibration={backgroundCalibration}
        candidateBackgroundCalibration={candidateBackgroundCalibration}
        onImportBackground={onImportBackground}
        onStartBackgroundCalibration={onStartBackgroundCalibration}
        onCancelBackgroundCalibration={onCancelBackgroundCalibration}
        onApplyBackgroundCalibration={onApplyBackgroundCalibration}
        onFinishBackgroundCalibrationChoice={
          onFinishBackgroundCalibrationChoice
        }
        workflowRequest={backgroundWorkflowRequest}
        onSelectTool={onSelectTool}
      />
    </div>
  );
}

export default Canvas;
