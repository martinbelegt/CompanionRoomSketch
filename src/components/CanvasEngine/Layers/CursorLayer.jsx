import { Group, Line } from "react-konva";

function CursorLayer({ cursor, onMove }) {
  return (
    <Group
      x={cursor.x}
      y={cursor.y}
      draggable
      onDragEnd={(e) => {
        onMove({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    >
      <Line points={[-10, 0, 10, 0]} stroke="#2563eb" strokeWidth={2} />
      <Line points={[0, -10, 0, 10]} stroke="#2563eb" strokeWidth={2} />
    </Group>
  );
}

export default CursorLayer;
