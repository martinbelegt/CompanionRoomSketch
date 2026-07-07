import { Arc, Circle, Group, Line, Rect } from "react-konva";
import {
  DEFAULT_DOOR_OPENING_WIDTH_MM,
  DEFAULT_DOOR_WIDTH_MM,
} from "../../../doors/doorConstants";

const DOOR_COLOR = "#92400e";
const BUILDER_DOOR_COLOR = "#111827";
const DOOR_SELECTED_COLOR = "#2563eb";
const DEFAULT_MM_PER_PIXEL = 10;
const WALL_GAP_WIDTH = 10;

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

function normalizeVector(vector, fallback) {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  if (!length) return fallback;

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

function projectPointToWall(point, wall, edgePadding = 0) {
  const direction = getWallDirection(wall);

  const vx = point.x - wall.startPoint.x;
  const vy = point.y - wall.startPoint.y;

  const wallLength =
    Math.sqrt(
      (wall.endPoint.x - wall.startPoint.x) ** 2 +
        (wall.endPoint.y - wall.startPoint.y) ** 2,
    ) || 1;

  const distanceAlongWall = vx * direction.x + vy * direction.y;
  const padding = Math.min(edgePadding, wallLength / 2);
  const clampedDistance = Math.max(
    padding,
    Math.min(wallLength - padding, distanceAlongWall),
  );

  return {
    x: wall.startPoint.x + direction.x * clampedDistance,
    y: wall.startPoint.y + direction.y * clampedDistance,
  };
}

function getCompactArcPoints(startVector, endVector, radius) {
  const startAngle = Math.atan2(startVector.y, startVector.x);
  const endAngle = Math.atan2(endVector.y, endVector.x);
  let arcAngle = endAngle - startAngle;

  if (arcAngle > Math.PI) arcAngle -= Math.PI * 2;
  if (arcAngle < -Math.PI) arcAngle += Math.PI * 2;

  const maxQuarterArc = Math.PI / 2;
  const compactArcAngle = Math.max(
    -maxQuarterArc,
    Math.min(maxQuarterArc, arcAngle),
  );
  const steps = 12;
  const points = [];

  for (let index = 0; index <= steps; index += 1) {
    const angle = startAngle + compactArcAngle * (index / steps);

    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }

  return points;
}

function DoorLayer({
  doors = [],
  walls = [],
  calibration,
  selectedObject,
  onSelectObject,
  onStartDoorMove,
  onUpdateDoorPosition,
  onToggleDoorDirection,
  onToggleDoorSwing,
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
        const isBuilderDoor = door.sparingWidthMm != null || door.hingeSide;

        const doorWidthPx =
          (door.doorWidthMm ?? door.widthMm ?? DEFAULT_DOOR_WIDTH_MM) /
          mmPerPixel;
        const halfDoorWidthPx = doorWidthPx / 2;

        const isSelected =
          selectedObject?.type === "door" && selectedObject.id === door.id;

        if (isBuilderDoor) {
          const openingWidthPx =
            (door.sparingWidthMm ?? DEFAULT_DOOR_OPENING_WIDTH_MM) /
            mmPerPixel;
          const halfOpeningWidthPx = openingWidthPx / 2;
          const color = isSelected ? DOOR_SELECTED_COLOR : BUILDER_DOOR_COLOR;
          const openDirection = normalizeVector(
            door.openDirection ?? normal,
            normal,
          );
          const hingeSide = door.hingeSide ?? "start";
          const hinge =
            hingeSide === "end"
              ? {
                  x: direction.x * halfOpeningWidthPx,
                  y: direction.y * halfOpeningWidthPx,
                }
              : {
                  x: -direction.x * halfOpeningWidthPx,
                  y: -direction.y * halfOpeningWidthPx,
                };
          const openingStart = {
            x: -direction.x * halfOpeningWidthPx,
            y: -direction.y * halfOpeningWidthPx,
          };
          const openingEnd = {
            x: direction.x * halfOpeningWidthPx,
            y: direction.y * halfOpeningWidthPx,
          };
          const closedVector =
            hingeSide === "end"
              ? {
                  x: -direction.x * doorWidthPx,
                  y: -direction.y * doorWidthPx,
                }
              : {
                  x: direction.x * doorWidthPx,
                  y: direction.y * doorWidthPx,
                };
          const openVector = {
            x: openDirection.x * doorWidthPx,
            y: openDirection.y * doorWidthPx,
          };
          const doorEnd = {
            x: hinge.x + openVector.x,
            y: hinge.y + openVector.y,
          };
          const rebateEnd = {
            x: hinge.x + closedVector.x,
            y: hinge.y + closedVector.y,
          };
          const arcPoints = getCompactArcPoints(
            closedVector,
            openVector,
            doorWidthPx,
          );

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
              onDragStart={(e) => {
                e.cancelBubble = true;
                onStartDoorMove?.();
              }}
              onDragMove={(e) => {
                e.cancelBubble = true;

                const projectedPosition = projectPointToWall(
                  {
                    x: e.target.x(),
                    y: e.target.y(),
                  },
                  wall,
                  halfOpeningWidthPx,
                );

                e.target.position(projectedPosition);
                onUpdateDoorPosition(door.id, projectedPosition, {
                  skipUndo: true,
                });
              }}
              onDragEnd={(e) => {
                e.cancelBubble = true;
              }}
              onDblClick={(e) => {
                e.cancelBubble = true;

                if (e.evt.shiftKey) {
                  onToggleDoorSwing(door.id);
                } else {
                  onToggleDoorDirection(door.id);
                }
              }}
            >
              <Line
                points={[
                  openingStart.x,
                  openingStart.y,
                  openingEnd.x,
                  openingEnd.y,
                ]}
                stroke="white"
                strokeWidth={WALL_GAP_WIDTH}
                lineCap="butt"
                listening={false}
              />

              {[openingStart, openingEnd].map((point, index) => (
                <Rect
                  key={index}
                  x={point.x - 3}
                  y={point.y - 3}
                  width={6}
                  height={6}
                  fill="white"
                  stroke={color}
                  strokeWidth={2}
                  listening={false}
                />
              ))}

              <Line
                points={[hinge.x, hinge.y, rebateEnd.x, rebateEnd.y]}
                stroke={color}
                strokeWidth={1.5}
                lineCap="square"
                listening={false}
              />

              <Line
                points={[hinge.x, hinge.y, doorEnd.x, doorEnd.y]}
                stroke={color}
                strokeWidth={isSelected ? 4 : 3}
                hitStrokeWidth={60}
                lineCap="square"
                listening
              />

              <Line
                x={hinge.x}
                y={hinge.y}
                points={arcPoints}
                stroke={color}
                strokeWidth={isSelected ? 3 : 2}
                lineCap="round"
                lineJoin="round"
                listening={false}
              />
            </Group>
          );
        }

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

        const doorInset = 8;

        const doorStart = {
          x: hinge.x + (openVector.x / doorWidthPx) * doorInset,
          y: hinge.y + (openVector.y / doorWidthPx) * doorInset,
        };

        const doorEnd = {
          x: hinge.x + openVector.x,
          y: hinge.y + openVector.y,
        };

        const arcPoints = getCompactArcPoints(
          closedVector,
          openVector,
          doorWidthPx,
        );

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
            onDragStart={(e) => {
              e.cancelBubble = true;
              onStartDoorMove?.();
            }}
            onDragMove={(e) => {
              e.cancelBubble = true;

              const projectedPosition = projectPointToWall(
                {
                  x: e.target.x(),
                  y: e.target.y(),
                },
                wall,
                halfDoorWidthPx,
              );

              e.target.position(projectedPosition);
              onUpdateDoorPosition(door.id, projectedPosition, {
                skipUndo: true,
              });
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true;
            }}
            onDblClick={(e) => {
              e.cancelBubble = true;

              if (e.evt.shiftKey) {
                onToggleDoorSwing(door.id);
              } else {
                onToggleDoorDirection(door.id);
              }
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
              points={[doorStart.x, doorStart.y, doorEnd.x, doorEnd.y]}
              stroke={isSelected ? DOOR_SELECTED_COLOR : DOOR_COLOR}
              strokeWidth={isSelected ? 6 : 4}
              hitStrokeWidth={60}
              lineCap="round"
              listening
            />

            <Line
              x={hinge.x}
              y={hinge.y}
              points={arcPoints}
              stroke={isSelected ? DOOR_SELECTED_COLOR : DOOR_COLOR}
              strokeWidth={isSelected ? 3 : 2}
              lineCap="round"
              lineJoin="round"
              listening={false}
            />
          </Group>
        );
      })}
    </>
  );
}

export default DoorLayer;
