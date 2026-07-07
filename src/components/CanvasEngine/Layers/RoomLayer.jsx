import { Circle, Group, Rect, Text } from "react-konva";

const DEFAULT_MM_PER_PIXEL = 10;
const CEILING_HEIGHT_MM = 2640;

function formatDutchDecimal(value) {
  return value.toFixed(1).replace(".", ",");
}

function getRoomLabel(room, calibration) {
  if (!room.bounds) {
    return {
      name: room.name,
      areaText: "",
      volumeText: "",
    };
  }

  const mmPerPixel = calibration?.mmPerPixel ?? DEFAULT_MM_PER_PIXEL;
  const widthMm = room.bounds.width * mmPerPixel;
  const heightMm = room.bounds.height * mmPerPixel;
  const areaM2 = (widthMm * heightMm) / 1_000_000;
  const volumeM3 = (areaM2 * CEILING_HEIGHT_MM) / 1000;

  return {
    name: room.name,
    areaText: `${formatDutchDecimal(areaM2)} m²`,
    volumeText: `${formatDutchDecimal(volumeM3)} m³`,
  };
}

function RoomLayer({
  rooms = [],
  calibration,
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
      {rooms.map((room) => {
        const label = getRoomLabel(room, calibration);
        const isSelected =
          selectedRoomIds.includes(room.id) || room.id === selectedRoomId;
        const textColor = isSelected ? "#2563eb" : "#4b5563";

        return (
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
              x={-90}
              y={-28}
              width={180}
              text={label.name}
              align="center"
              fontSize={16}
              fontStyle="bold"
              fill={textColor}
              listening={false}
            />
            {label.areaText && (
              <Text
                x={-90}
                y={-6}
                width={180}
                text={label.areaText}
                align="center"
                fontSize={13}
                fill={textColor}
                listening={false}
              />
            )}
            {label.volumeText && (
              <Text
                x={-90}
                y={12}
                width={180}
                text={label.volumeText}
                align="center"
                fontSize={13}
                fill={textColor}
                listening={false}
              />
            )}
          </Group>
        );
      })}
    </>
  );
}

export default RoomLayer;
