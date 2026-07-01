import { Line } from "react-konva";

const PREVIEW_COLOR = "#2563eb";
const PREVIEW_WIDTH = 4;

function WallPreviewLayer({ startPoint, endPoint }) {
  if (!startPoint || !endPoint) {
    return null;
  }

  return (
    <Line
      points={[startPoint.x, startPoint.y, endPoint.x, endPoint.y]}
      stroke={PREVIEW_COLOR}
      strokeWidth={PREVIEW_WIDTH}
      dash={[12, 8]}
      lineCap="round"
      lineJoin="round"
      listening={false}
    />
  );
}

export default WallPreviewLayer;
