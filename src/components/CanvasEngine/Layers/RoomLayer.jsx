import React from "react";
import { Circle, Group, Text } from "react-konva";

function RoomLayer({
  rooms = [],
  selectedRoomId,
  selectedRoomIds = [],
  onSelectRoom,
  onMoveRoom,
}) {
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
            onSelectRoom(
              room.id,
              e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey,
            );
          }}
        >
          <Circle radius={120} fill="rgba(37, 99, 235, 0.01)" />

          <Text
            x={-45}
            y={-10}
            width={90}
            text={room.name}
            align="center"
            fontSize={16}
            fontStyle="bold"
            fill={
              selectedRoomIds.includes(room.id) || room.id === selectedRoomId
                ? "#2563eb"
                : "#374151"
            }
            onClick={(e) => {
              e.cancelBubble = true;
              onSelectRoom(
                room.id,
                e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey,
              );
            }}
          />
        </Group>
      ))}
    </>
  );
}

export default RoomLayer;
