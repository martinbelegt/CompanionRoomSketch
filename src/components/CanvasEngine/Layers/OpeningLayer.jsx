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
  currentTool,
  onConvertOpeningToDoor,
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
              stroke={
                isSelected
                  ? "#2563eb"
                  : currentTool === "door"
                    ? "rgba(37,99,235,0.35)"
                    : "rgba(37,99,235,0.16)"
              }
              strokeWidth={isSelected ? 3 : currentTool === "door" ? 22 : 14}
              dash={isSelected ? [5, 4] : undefined}
              hitStrokeWidth={72}
              listening
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "pointer";
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "default";
              }}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                if (currentTool === "door") {
                  onConvertOpeningToDoor?.(opening.id);
                  return;
                }
                onSelectObject("opening", opening.id);
              }}
              onClick={(e) => {
                e.cancelBubble = true;
                if (currentTool === "door") {
                  onConvertOpeningToDoor?.(opening.id);
                  return;
                }
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
