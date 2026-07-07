import { Group, Line } from "react-konva";

const DEFAULT_MM_PER_PIXEL = 10;

function getWallDirection(wall) {
  const dx = wall.endPoint.x - wall.startPoint.x;
  const dy = wall.endPoint.y - wall.startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;

  return {
    x: dx / length,
    y: dy / length,
  };
}

function OpeningLayer({
  openings = [],
  walls = [],
  calibration,
  selectedObject,
  onSelectObject,
}) {
  const mmPerPixel = calibration?.mmPerPixel ?? DEFAULT_MM_PER_PIXEL;

  return (
    <>
      {openings.map((opening) => {
        if (opening.fill === "door") return null;

        const wall = walls.find((item) => opening.wallIds?.includes(item.id));
        if (!wall || !opening.position) return null;

        const direction = getWallDirection(wall);
        const halfWidth = (opening.widthMm / mmPerPixel) / 2;
        const isSelected =
          selectedObject?.type === "opening" && selectedObject.id === opening.id;

        return (
          <Group key={opening.id}>
            <Line
              points={[
                opening.position.x - direction.x * halfWidth,
                opening.position.y - direction.y * halfWidth,
                opening.position.x + direction.x * halfWidth,
                opening.position.y + direction.y * halfWidth,
              ]}
              stroke={isSelected ? "#2563eb" : "rgba(37,99,235,0.01)"}
              strokeWidth={isSelected ? 2 : 18}
              dash={isSelected ? [5, 4] : undefined}
              hitStrokeWidth={36}
              listening
              onMouseDown={(e) => {
                e.cancelBubble = true;
                onSelectObject("opening", opening.id);
              }}
              onClick={(e) => {
                e.cancelBubble = true;
                onSelectObject("opening", opening.id);
              }}
            />
          </Group>
        );
      })}
    </>
  );
}

export default OpeningLayer;
