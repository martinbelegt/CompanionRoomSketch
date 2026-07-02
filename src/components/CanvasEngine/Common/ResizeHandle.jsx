import { Circle } from "react-konva";

function ResizeHandle({ x, y, onDragMove }) {
  return (
    <Circle
      x={x}
      y={y}
      radius={7}
      fill="#2563eb"
      stroke="white"
      strokeWidth={2}
      draggable
      onMouseDown={(e) => {
        e.cancelBubble = true;
      }}
      onDragMove={onDragMove}
      onDragEnd={(e) => {
        e.cancelBubble = true;
      }}
    />
  );
}

export default ResizeHandle;
