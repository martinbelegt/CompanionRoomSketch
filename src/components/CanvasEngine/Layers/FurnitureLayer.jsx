import { Group, Rect, Text } from "react-konva";

function FurnitureLayer({ furniture, onMove }) {
  return (
    <>
      {furniture.map((item) => (
        <Group
          key={item.id}
          x={item.x}
          y={item.y}
          draggable
          onDragEnd={(e) => {
            onMove(item.id, {
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
        >
          <Rect
            width={item.width}
            height={item.height}
            fill="#dbeafe"
            stroke="#2563eb"
            strokeWidth={2}
            cornerRadius={10}
          />

          <Text
            text={item.name}
            width={item.width}
            height={item.height}
            align="center"
            verticalAlign="middle"
            fontSize={18}
            fill="#1e3a8a"
          />
        </Group>
      ))}
    </>
  );
}

export default FurnitureLayer;
