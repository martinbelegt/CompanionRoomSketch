import { Group, Line } from "react-konva";

const DOOR_COLOR = "#92400e";
const DOOR_SELECTED_COLOR = "#2563eb";
const DOOR_WIDTH = 10;
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

function DoorLayer({
  doors = [],
  walls = [],
  calibration,
  selectedObject,
  onSelectObject,
  onUpdateDoorPosition,
}) {
  const mmPerPixel = calibration?.mmPerPixel ?? DEFAULT_MM_PER_PIXEL;

  return (
    <>
      {doors.map((door) => {
        const wall = walls.find((item) => item.id === door.wallId);

        if (!wall) return null;

        const center = door.position ?? getWallCenter(wall);
        const normal = getWallNormal(wall);

        const doorLengthPx = (door.widthMm ?? 900) / mmPerPixel / 2;

        const isSelected =
          selectedObject?.type === "door" && selectedObject.id === door.id;

        return (
          <Group
            key={door.id}
            x={center.x}
            y={center.y}
            draggable={isSelected}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              onSelectObject("door", door.id);
            }}
            onClick={(e) => {
              e.cancelBubble = true;
              onSelectObject("door", door.id);
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
              onUpdateDoorPosition(door.id, projectedPosition);
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true;
            }}
          >
            <Line
              points={[
                -normal.x * doorLengthPx,
                -normal.y * doorLengthPx,
                normal.x * doorLengthPx,
                normal.y * doorLengthPx,
              ]}
              stroke={isSelected ? DOOR_SELECTED_COLOR : DOOR_COLOR}
              strokeWidth={DOOR_WIDTH}
              hitStrokeWidth={40}
              lineCap="round"
              listening
            />
          </Group>
        );
      })}
    </>
  );
}

export default DoorLayer;
