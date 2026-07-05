import React from "react";
import { Circle, Group, Text } from "react-konva";

function RoomLayer({ rooms = [], selectedRoomId, onSelectRoom, onMoveRoom }) {
  return (
    <>
      {rooms.map((room) => (
        <Group
          key={room.id}
          x={room.center?.x ?? 0}
          y={room.center?.y ?? 0}
          draggable={room.id === selectedRoomId}
          onClick={(e) => {
            e.cancelBubble = true;
            onSelectRoom(room.id);
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true;

            onMoveRoom(room.id, {
              x: e.target.x() - (room.center?.x ?? 0),
              y: e.target.y() - (room.center?.y ?? 0),
            });

            e.target.position({
              x: 0,
              y: 0,
            });
          }}
        >
          <Circle radius={60} fill="transparent" />

          <Text
            x={-45}
            y={-10}
            width={90}
            text={room.name}
            align="center"
            fontSize={16}
            fontStyle="bold"
            fill={room.id === selectedRoomId ? "#2563eb" : "#374151"}
          />
        </Group>
      ))}
    </>
  );
}

export default RoomLayer;
