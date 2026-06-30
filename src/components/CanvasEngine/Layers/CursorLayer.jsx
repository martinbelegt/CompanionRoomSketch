import { Group, Line } from "react-konva";

function CursorLayer({ cursor }) {
  return (
    <Group x={cursor.x} y={cursor.y} listening={false}>
      <Line points={[-10, 0, 10, 0]} stroke="#2563eb" strokeWidth={2} />
      <Line points={[0, -10, 0, 10]} stroke="#2563eb" strokeWidth={2} />
    </Group>
  );
}

export default CursorLayer;
