import { Line, Circle, Group } from "react-konva";

const WALL_COLOR = "#374151";
const SELECTED_WALL_COLOR = "#2563eb";
const DEFAULT_MM_PER_PIXEL = 10;
const DEFAULT_WALL_THICKNESS_MM = 100;
const MIN_WALL_WIDTH = 4;
const HANDLE_HIT_RADIUS = 18;
const HANDLE_CROSSHAIR_SIZE = 18;
const HANDLE_CROSSHAIR_GAP = 4;
const HANDLE_CROSSHAIR_WIDTH = 2.3;

function getStraightWallPoint(anchorPoint, currentPoint, nextPoint) {
  const currentDx = currentPoint.x - anchorPoint.x;
  const currentDy = currentPoint.y - anchorPoint.y;

  return Math.abs(currentDx) >= Math.abs(currentDy)
    ? {
        x: nextPoint.x,
        y: anchorPoint.y,
      }
    : {
        x: anchorPoint.x,
        y: nextPoint.y,
      };
}

function WallLayer({
  walls = [],
  selectedWallId,
  onWallClick,
  onWallMouseDown,
  onUpdateWallPoint,
  onMoveWall,
  calibration,
  roomDraftWallIds = [],
}) {
  return (
    <>
      {walls.map((wall) => {
        const isSelectedWall = selectedWallId && wall.id === selectedWallId;
        const isDraftWall = roomDraftWallIds.includes(wall.id);
        const mmPerPixel = calibration?.mmPerPixel ?? DEFAULT_MM_PER_PIXEL;
        const wallWidth = Math.max(
          MIN_WALL_WIDTH,
          (wall.thicknessMm ?? DEFAULT_WALL_THICKNESS_MM) / mmPerPixel,
        );
        const wallColor = wall.color ?? WALL_COLOR;

        return (
          <Group key={wall.id}>
            <Line
              points={[
                wall.startPoint.x,
                wall.startPoint.y,
                wall.endPoint.x,
                wall.endPoint.y,
              ]}
              stroke={
                isSelectedWall || isDraftWall
                  ? SELECTED_WALL_COLOR
                  : wallColor
              }
              strokeWidth={wallWidth}
              lineCap="square"
              lineJoin="miter"
              draggable={wall.id === selectedWallId}
              onClick={(e) => {
                e.cancelBubble = true;
                onWallClick(wall, e);
              }}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                onWallMouseDown?.(wall);
              }}
              onDragStart={(e) => {
                e.cancelBubble = true;
              }}
              onDragEnd={(e) => {
                e.cancelBubble = true;

                const delta = {
                  x: e.target.x(),
                  y: e.target.y(),
                };

                onMoveWall(wall.id, delta);

                e.target.position({
                  x: 0,
                  y: 0,
                });
              }}
            />

            {wall.id === selectedWallId && (
              <>
                <Circle
                  x={wall.startPoint.x}
                  y={wall.startPoint.y}
                  radius={HANDLE_HIT_RADIUS}
                  fill="rgba(37, 99, 235, 0.01)"
                  draggable
                  listening
                  onMouseDown={(e) => {
                    e.cancelBubble = true;
                  }}
                  onClick={(e) => {
                    e.cancelBubble = true;
                  }}
                  onDragStart={(e) => {
                    e.cancelBubble = true;
                  }}
                  onDragMove={(e) => {
                    e.cancelBubble = true;

                    onUpdateWallPoint(
                      wall.id,
                      "startPoint",
                      getStraightWallPoint(wall.endPoint, wall.startPoint, {
                        x: e.target.x(),
                        y: e.target.y(),
                      }),
                    );
                  }}
                />
                <Line
                  points={[
                    wall.startPoint.x - HANDLE_CROSSHAIR_SIZE,
                    wall.startPoint.y,
                    wall.startPoint.x - HANDLE_CROSSHAIR_GAP,
                    wall.startPoint.y,
                    wall.startPoint.x + HANDLE_CROSSHAIR_GAP,
                    wall.startPoint.y,
                    wall.startPoint.x + HANDLE_CROSSHAIR_SIZE,
                    wall.startPoint.y,
                  ]}
                  stroke="#2563eb"
                  strokeWidth={HANDLE_CROSSHAIR_WIDTH}
                  strokeScaleEnabled={false}
                  listening={false}
                />
                <Line
                  points={[
                    wall.startPoint.x,
                    wall.startPoint.y - HANDLE_CROSSHAIR_SIZE,
                    wall.startPoint.x,
                    wall.startPoint.y - HANDLE_CROSSHAIR_GAP,
                    wall.startPoint.x,
                    wall.startPoint.y + HANDLE_CROSSHAIR_GAP,
                    wall.startPoint.x,
                    wall.startPoint.y + HANDLE_CROSSHAIR_SIZE,
                  ]}
                  stroke="#2563eb"
                  strokeWidth={HANDLE_CROSSHAIR_WIDTH}
                  strokeScaleEnabled={false}
                  listening={false}
                />

                <Circle
                  x={wall.endPoint.x}
                  y={wall.endPoint.y}
                  radius={HANDLE_HIT_RADIUS}
                  fill="rgba(37, 99, 235, 0.01)"
                  draggable
                  listening
                  onMouseDown={(e) => {
                    e.cancelBubble = true;
                  }}
                  onClick={(e) => {
                    e.cancelBubble = true;
                  }}
                  onDragStart={(e) => {
                    e.cancelBubble = true;
                  }}
                  onDragMove={(e) => {
                    e.cancelBubble = true;

                    onUpdateWallPoint(
                      wall.id,
                      "endPoint",
                      getStraightWallPoint(wall.startPoint, wall.endPoint, {
                        x: e.target.x(),
                        y: e.target.y(),
                      }),
                    );
                  }}
                />
                <Line
                  points={[
                    wall.endPoint.x - HANDLE_CROSSHAIR_SIZE,
                    wall.endPoint.y,
                    wall.endPoint.x - HANDLE_CROSSHAIR_GAP,
                    wall.endPoint.y,
                    wall.endPoint.x + HANDLE_CROSSHAIR_GAP,
                    wall.endPoint.y,
                    wall.endPoint.x + HANDLE_CROSSHAIR_SIZE,
                    wall.endPoint.y,
                  ]}
                  stroke="#2563eb"
                  strokeWidth={HANDLE_CROSSHAIR_WIDTH}
                  strokeScaleEnabled={false}
                  listening={false}
                />
                <Line
                  points={[
                    wall.endPoint.x,
                    wall.endPoint.y - HANDLE_CROSSHAIR_SIZE,
                    wall.endPoint.x,
                    wall.endPoint.y - HANDLE_CROSSHAIR_GAP,
                    wall.endPoint.x,
                    wall.endPoint.y + HANDLE_CROSSHAIR_GAP,
                    wall.endPoint.x,
                    wall.endPoint.y + HANDLE_CROSSHAIR_SIZE,
                  ]}
                  stroke="#2563eb"
                  strokeWidth={HANDLE_CROSSHAIR_WIDTH}
                  strokeScaleEnabled={false}
                  listening={false}
                />
              </>
            )}
          </Group>
        );
      })}
    </>
  );
}

export default WallLayer;
