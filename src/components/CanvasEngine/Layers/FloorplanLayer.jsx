import { Image } from "react-konva";
import useImage from "use-image";

const FLOORPLAN_X = 30;
const FLOORPLAN_Y = 30;
const FLOORPLAN_SCALE = 1;

function FloorplanLayer() {
  const [image] = useImage("/projects/hank/floorplan.png");

  if (!image) return null;

  return (
    <Image
      image={image}
      x={FLOORPLAN_X}
      y={FLOORPLAN_Y}
      width={image.width * FLOORPLAN_SCALE}
      height={image.height * FLOORPLAN_SCALE}
      listening={false}
    />
  );
}

export default FloorplanLayer;
