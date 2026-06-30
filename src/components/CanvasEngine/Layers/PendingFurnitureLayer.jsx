import { Image, Rect } from "react-konva";
import useImage from "use-image";

function PendingFurnitureLayer({ pendingFurniture, cursor, calibration }) {
  const [image] = useImage(pendingFurniture?.imageUrl);

  if (!pendingFurniture) return null;

  const mmPerPixel = calibration?.mmPerPixel ?? 10;
  const width = pendingFurniture.widthMm / mmPerPixel;
  const height = pendingFurniture.depthMm / mmPerPixel;

  return image ? (
    <Image
      image={image}
      x={cursor.x}
      y={cursor.y}
      width={width}
      height={height}
      opacity={0.45}
      listening={false}
    />
  ) : (
    <Rect
      x={cursor.x}
      y={cursor.y}
      width={width}
      height={height}
      fill="#dbeafe"
      stroke="#2563eb"
      strokeWidth={2}
      opacity={0.45}
      listening={false}
    />
  );
}

export default PendingFurnitureLayer;
