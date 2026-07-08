import { Line, Text } from "react-konva";

function getDistance(pointA, pointB) {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function MeasurementLayer({ points }) {
  if (points.length === 0) return null;

  const [pointA, pointB] = points;

  const distance = pointB ? getDistance(pointA, pointB) : null;

  const labelX = pointB ? (pointA.x + pointB.x) / 2 : pointA.x + 12;
  const labelY = pointB ? (pointA.y + pointB.y) / 2 : pointA.y - 18;

  return (
    <>
      {pointB && (
        <Line
          points={[pointA.x, pointA.y, pointB.x, pointB.y]}
          stroke="#dc2626"
          strokeWidth={3}
          dash={[10, 6]}
        />
      )}

      <Text
        x={labelX}
        y={labelY}
        text={distance ? `${Math.round(distance)} px` : "Punt A"}
        fontSize={16}
        fill="#dc2626"
        fontStyle="bold"
      />
    </>
  );
}

export default MeasurementLayer;
