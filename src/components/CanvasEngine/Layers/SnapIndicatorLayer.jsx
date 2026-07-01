import { Circle } from "react-konva";

function SnapIndicatorLayer({ point }) {
  if (!point) return null;

  return (
    <Circle
      x={point.x}
      y={point.y}
      radius={5}
      fill="#2563eb"
      stroke="white"
      strokeWidth={2}
      listening={false}
    />
  );
}

export default SnapIndicatorLayer;
