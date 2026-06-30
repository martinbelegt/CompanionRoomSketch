import { Group, Rect, Image } from "react-konva";
import useImage from "use-image";

function FurnitureObject({
  item,
  calibration,
  selected,
  onSelect,
  onMove,
  preview = false,
}) {
  const [image] = useImage(item.imageUrl);

  const mmPerPixel = calibration?.mmPerPixel ?? 10;

  const width = item.widthMm / mmPerPixel;
  const height = item.depthMm / mmPerPixel;

  function stopCanvasDrag(e) {
    e.cancelBubble = true;
  }

  return (
    <Group
      x={item.x}
      y={item.y}
      draggable={!preview}
      listening={!preview}
      opacity={preview ? 0.55 : 1}
      onMouseDown={(e) => {
        e.cancelBubble = true;
        onSelect(item.id);
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect(item.id);
      }}
      onDragStart={(e) => {
        e.cancelBubble = true;
        onSelect(item.id);
      }}
      onDragMove={(e) => {
        e.cancelBubble = true;
      }}
      onDragEnd={(e) => {
        e.cancelBubble = true;

        onMove(item.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    >
      {image ? (
        <Image image={image} width={width} height={height} opacity={0.9} />
      ) : (
        <Rect
          width={width}
          height={height}
          fill="#dbeafe"
          stroke="#94a3b8"
          strokeWidth={2}
          cornerRadius={10}
        />
      )}

      <Rect
        width={width}
        height={height}
        stroke={selected ? "#2563eb" : "#94a3b8"}
        strokeWidth={selected ? 4 : 2}
        cornerRadius={10}
        fillEnabled={false}
      />
      {selected && (
        <>
          <Rect
            x={-9}
            y={-9}
            width={18}
            height={18}
            fill="white"
            stroke="#2563eb"
            strokeWidth={3}
            cornerRadius={9}
          />

          <Rect
            x={width - 9}
            y={-9}
            width={18}
            height={18}
            fill="white"
            stroke="#2563eb"
            strokeWidth={3}
            cornerRadius={9}
          />

          <Rect
            x={-9}
            y={height - 9}
            width={18}
            height={18}
            fill="white"
            stroke="#2563eb"
            strokeWidth={3}
            cornerRadius={9}
          />

          <Rect
            x={width - 9}
            y={height - 9}
            width={18}
            height={18}
            fill="white"
            stroke="#2563eb"
            strokeWidth={3}
            cornerRadius={9}
          />
        </>
      )}
    </Group>
  );
}

export default FurnitureObject;
