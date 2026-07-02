import { Line } from "react-konva";

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

function getWallNormal(wall) {
  const dx = wall.endPoint.x - wall.startPoint.x;
  const dy = wall.endPoint.y - wall.startPoint.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  if (!length) return { x: 0, y: 0 };

  return {
    x: -dy / length,
    y: dx / length,
  };
}

function WindowLayer({
  windows = [],
  walls = [],
  calibration,
  selectedObject,
  onSelectObject,
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
          <Line
            key={windowItem.id}
            points={[
              center.x - normal.x * halfWidth,
              center.y - normal.y * halfWidth,
              center.x + normal.x * halfWidth,
              center.y + normal.y * halfWidth,
            ]}
            stroke={isSelected ? WINDOW_SELECTED_COLOR : WINDOW_COLOR}
            strokeWidth={WINDOW_WIDTH}
            hitStrokeWidth={32}
            lineCap="round"
            listening
            onMouseDown={(e) => {
              e.cancelBubble = true;
              onSelectObject("window", windowItem.id);
            }}
            onClick={(e) => {
              e.cancelBubble = true;
              onSelectObject("window", windowItem.id);
            }}
          />
        );
      })}
    </>
  );
}

export default WindowLayer;
