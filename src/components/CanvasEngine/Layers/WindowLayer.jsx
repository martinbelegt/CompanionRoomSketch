import { Group, Line } from "react-konva";

const WINDOW_COLOR = "#0ea5e9";
const WINDOW_SELECTED_COLOR = "#2563eb";
const WINDOW_WIDTH = 6;
const DEFAULT_MM_PER_PIXEL = 10;

function getWallCenter(wall) {
  return {
    x: (wall.startPoint.x + wall.endPoint.x) / 2,
    y: (wall.startPoint.y + wall.endPoint.y) / 2,
  };
}

function getWallDirection(wall) {
  const dx = wall.endPoint.x - wall.startPoint.x;
  const dy = wall.endPoint.y - wall.startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (!length) return { x: 1, y: 0 };

  return {
    x: dx / length,
    y: dy / length,
  };
}

function getWallNormal(wall) {
  const direction = getWallDirection(wall);

  return {
    x: -direction.y,
    y: direction.x,
  };
}

function projectPointToWall(point, wall) {
  const direction = getWallDirection(wall);

  const vx = point.x - wall.startPoint.x;
  const vy = point.y - wall.startPoint.y;

  const wallLength =
    Math.sqrt(
      (wall.endPoint.x - wall.startPoint.x) ** 2 +
        (wall.endPoint.y - wall.startPoint.y) ** 2,
    ) || 1;

  const distanceAlongWall = vx * direction.x + vy * direction.y;
  const clampedDistance = Math.max(0, Math.min(wallLength, distanceAlongWall));

  return {
    x: wall.startPoint.x + direction.x * clampedDistance,
    y: wall.startPoint.y + direction.y * clampedDistance,
  };
}

function WindowLayer({
  windows = [],
  walls = [],
  calibration,
  selectedObject,
  onSelectObject,
  onUpdateWindowPosition,
}) {
  const mmPerPixel = calibration?.mmPerPixel ?? DEFAULT_MM_PER_PIXEL;

  return (
    <>
      {windows.map((windowItem) => {
        const wall = walls.find((item) => item.id === windowItem.wallId);

        if (!wall) return null;

        const center = windowItem.position ?? getWallCenter(wall);
        const normal = getWallNormal(wall);

        const halfWidth = (windowItem.widthMm ?? 1000) / mmPerPixel / 2;

        const isSelected =
          selectedObject?.type === "window" &&
          selectedObject.id === windowItem.id;

        return (
          <Group
            key={windowItem.id}
            x={center.x}
            y={center.y}
            draggable={isSelected}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              onSelectObject("window", windowItem.id);
            }}
            onClick={(e) => {
              e.cancelBubble = true;
              onSelectObject("window", windowItem.id);
            }}
            onDragMove={(e) => {
              e.cancelBubble = true;

              const projectedPosition = projectPointToWall(
                {
                  x: e.target.x(),
                  y: e.target.y(),
                },
                wall,
              );

              e.target.position(projectedPosition);
              onUpdateWindowPosition(windowItem.id, projectedPosition);
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true;
            }}
          >
            <Line
              points={[
                -normal.x * halfWidth,
                -normal.y * halfWidth,
                normal.x * halfWidth,
                normal.y * halfWidth,
              ]}
              stroke={isSelected ? WINDOW_SELECTED_COLOR : WINDOW_COLOR}
              strokeWidth={WINDOW_WIDTH}
              hitStrokeWidth={32}
              lineCap="round"
              listening
            />
          </Group>
        );
      })}
    </>
  );
}

export default WindowLayer;
