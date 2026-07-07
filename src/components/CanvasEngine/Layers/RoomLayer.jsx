import { Circle, Group, Rect, Text } from "react-konva";

function RoomLayer({
  rooms = [],
  selectedRoomId,
  selectedRoomIds = [],
  onSelectRoom,
  onMoveRoom,
  currentTool,
  onClearSnapGuides,
}) {
  const isOpeningMode = currentTool === "opening";

  return (
    <>
      {rooms.map((room) => (
        <Group
          key={room.id}
          x={room.center?.x ?? 0}
          y={room.center?.y ?? 0}
          listening={!isOpeningMode}
          draggable={!isOpeningMode && room.id === selectedRoomId}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            onSelectRoom(
              room.id,
              e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey,
            );
          }}
          onClick={(e) => {
            e.cancelBubble = true;
            onSelectRoom(
              room.id,
              e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey,
            );
          }}
          onDragStart={(e) => {
            e.cancelBubble = true;
            onSelectRoom(room.id);
            onClearSnapGuides?.();
          }}
          onDragMove={(e) => {
            e.cancelBubble = true;

            const delta = {
              x: e.target.x() - (room.center?.x ?? 0),
              y: e.target.y() - (room.center?.y ?? 0),
            };

            if (delta.x === 0 && delta.y === 0) return;

            onMoveRoom(room.id, delta, { snap: true });

            e.target.position({
              x: room.center?.x ?? 0,
              y: room.center?.y ?? 0,
            });
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true;
            onClearSnapGuides?.();

            e.target.position({
              x: room.center?.x ?? 0,
              y: room.center?.y ?? 0,
            });
          }}
        >
          {room.bounds && (
            <Rect
              x={room.bounds.x - (room.center?.x ?? 0)}
              y={room.bounds.y - (room.center?.y ?? 0)}
              width={room.bounds.width}
              height={room.bounds.height}
              fill="rgba(37,99,235,0.01)"
              listening={!isOpeningMode}
              onClick={(e) => {
                e.cancelBubble = true;
                onSelectRoom(
                  room.id,
                  e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey,
                );
              }}
            />
          )}

          <Circle
            radius={120}
            fill="rgba(37, 99, 235, 0.01)"
            listening={!isOpeningMode}
          />

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
            listening={!isOpeningMode}
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
