import { Arc, Circle, Group, Line } from "react-konva";

const DOOR_COLOR = "#92400e";
const DOOR_SELECTED_COLOR = "#2563eb";
const DOOR_WIDTH = 10;
const DEFAULT_MM_PER_PIXEL = 10;

function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

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
        const direction = getWallDirection(wall);

        const doorWidthPx = (door.widthMm ?? 900) / mmPerPixel;
        const halfDoorWidthPx = doorWidthPx / 2;

        const isSelected =
          selectedObject?.type === "door" && selectedObject.id === door.id;

        const hinge =
          door.swing === "right"
            ? {
                x: normal.x * halfDoorWidthPx,
                y: normal.y * halfDoorWidthPx,
              }
            : {
                x: -normal.x * halfDoorWidthPx,
                y: -normal.y * halfDoorWidthPx,
              };

        const closedVector =
          door.swing === "right"
            ? {
                x: -normal.x * doorWidthPx,
                y: -normal.y * doorWidthPx,
              }
            : {
                x: normal.x * doorWidthPx,
                y: normal.y * doorWidthPx,
              };

        const openVector =
          door.direction === "outside"
            ? {
                x: -direction.x * doorWidthPx,
                y: -direction.y * doorWidthPx,
              }
            : {
                x: direction.x * doorWidthPx,
                y: direction.y * doorWidthPx,
              };

        const closedRotation = toDegrees(
          Math.atan2(closedVector.y, closedVector.x),
        );

        const openRotation = toDegrees(Math.atan2(openVector.y, openVector.x));
        let arcAngle = openRotation - closedRotation;

        if (arcAngle > 180) arcAngle -= 360;
        if (arcAngle < -180) arcAngle += 360;

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
            <Arc
              x={hinge.x}
              y={hinge.y}
              innerRadius={2}
              outerRadius={2}
              angle={360}
              fill={isSelected ? DOOR_SELECTED_COLOR : DOOR_COLOR}
              stroke={isSelected ? DOOR_SELECTED_COLOR : DOOR_COLOR}
            />

            <Circle
              x={hinge.x}
              y={hinge.y}
              radius={isSelected ? 6 : 4}
              fill={isSelected ? DOOR_SELECTED_COLOR : DOOR_COLOR}
              stroke="white"
              strokeWidth={1}
            />

            <Line
              points={[
                hinge.x,
                hinge.y,
                hinge.x + openVector.x,
                hinge.y + openVector.y,
              ]}
              stroke={isSelected ? DOOR_SELECTED_COLOR : DOOR_COLOR}
              strokeWidth={isSelected ? 6 : 4}
              hitStrokeWidth={60}
              lineCap="round"
              listening
            />

            <Arc
              x={hinge.x}
              y={hinge.y}
              innerRadius={doorWidthPx - 1}
              outerRadius={doorWidthPx + 1}
              angle={arcAngle}
              rotation={closedRotation}
              stroke={isSelected ? DOOR_SELECTED_COLOR : DOOR_COLOR}
              strokeWidth={isSelected ? 3 : 2}
              listening={false}
            />
          </Group>
        );
      })}
    </>
  );
}

export default DoorLayer;
