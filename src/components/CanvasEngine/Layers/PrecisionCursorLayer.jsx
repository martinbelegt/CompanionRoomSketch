import { Group, Line } from "react-konva";

const DEFAULT_COLOR = "#2563eb";
const DEFAULT_SIZE = 24;
const DEFAULT_STROKE_WIDTH = 1.35;

function PrecisionCursorLayer({
  cursor,
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}) {
  return (
    <Group x={cursor.x} y={cursor.y} listening={false}>
      <Line points={[-size, 0, size, 0]} stroke={color} strokeWidth={strokeWidth} />
      <Line points={[0, -size, 0, size]} stroke={color} strokeWidth={strokeWidth} />
    </Group>
  );
}

export default PrecisionCursorLayer;
