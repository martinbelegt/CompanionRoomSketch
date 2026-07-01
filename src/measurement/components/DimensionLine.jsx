import { Line, Circle, Text, Label, Tag } from "react-konva";

import { formatDistanceAuto } from "../utils/unitConversion";

function DimensionLine({ startPoint, endPoint, distanceMm }) {
  if (!startPoint || !endPoint || distanceMm == null) {
    return null;
  }

  const OFFSET = 20;

  const dx = offsetEnd.x - offsetStart.x;
  const dy = offsetEnd.y - offsetStart.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  const normal =
    length === 0
      ? { x: 0, y: -1 }
      : {
          x: -dy / length,
          y: dx / length,
        };

  const offsetStart = {
    x: offsetStart.x + normal.x * OFFSET,
    y: offsetStart.y + normal.y * OFFSET,
  };

  const offsetEnd = {
    x: offsetEnd.x + normal.x * OFFSET,
    y: offsetEnd.y + normal.y * OFFSET,
  };

  const centerX = (offsetStart.x + offsetEnd.x) / 2;
  const centerY = (offsetStart.y + offsetEnd.y) / 2;
  const OFFSET = 20;

  return (
    <>
      <Line
        points={[offsetStart.x, offsetStart.y, offsetEnd.x, offsetEnd.y]}
        stroke="#2563eb"
        strokeWidth={2}
      />

      <Circle x={offsetStart.x} y={offsetStart.y} radius={4} fill="#2563eb" />

      <Circle x={offsetEnd.x} y={offsetEnd.y} radius={4} fill="#2563eb" />

      <Line
        points={[
          offsetStart.x,
          offsetStart.y - 8,
          offsetStart.x,
          offsetStart.y + 8,
        ]}
        stroke="#2563eb"
        strokeWidth={2}
      />

      <Line
        points={[offsetEnd.x, offsetEnd.y - 8, offsetEnd.x, offsetEnd.y + 8]}
        stroke="#2563eb"
        strokeWidth={2}
      />

      <Label x={centerX} y={centerY - 22} offsetX={36}>
        <Tag fill="white" stroke="#2563eb" cornerRadius={4} />

        <Text
          text={formatDistanceAuto(distanceMm)}
          padding={6}
          fontSize={16}
          fill="#2563eb"
        />
      </Label>
    </>
  );
}

export default DimensionLine;
