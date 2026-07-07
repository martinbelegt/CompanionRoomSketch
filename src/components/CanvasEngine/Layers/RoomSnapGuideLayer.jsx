import { Line } from "react-konva";

function RoomSnapGuideLayer({ guides = [] }) {
  if (!guides.length) return null;

  return (
    <>
      {guides.map((guide, index) => {
        const points =
          guide.orientation === "vertical"
            ? [guide.x, guide.y1, guide.x, guide.y2]
            : [guide.x1, guide.y, guide.x2, guide.y];

        return (
          <Line
            key={`${guide.orientation}-${index}`}
            points={points}
            stroke="#2563eb"
            strokeWidth={1}
            dash={[6, 6]}
            opacity={0.55}
            listening={false}
          />
        );
      })}
    </>
  );
}

export default RoomSnapGuideLayer;
