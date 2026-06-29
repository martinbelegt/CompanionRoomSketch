import { Image } from "react-konva";
import useImage from "use-image";

function FloorplanLayer({ canvasWidth, canvasHeight, margin = 30 }) {
  const [image] = useImage("/projects/hank/floorplan.png");

  if (!image) return null;

  const availableWidth = canvasWidth - margin * 2;
  const availableHeight = canvasHeight - margin * 2;

  const scale = Math.min(
    availableWidth / image.width,
    availableHeight / image.height,
  );

  const width = image.width * scale;
  const height = image.height * scale;

  const x = (canvasWidth - width) / 2;
  const y = (canvasHeight - height) / 2;

  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      listening={false}
    />
  );
}

export default FloorplanLayer;
