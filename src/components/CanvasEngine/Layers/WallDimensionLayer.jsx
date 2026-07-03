import { DimensionLine } from "../../../measurement";

function getDistanceMm(startPoint, endPoint, calibration) {
  if (!calibration?.mmPerPixel) return null;

  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;

  return Math.sqrt(dx * dx + dy * dy) * calibration.mmPerPixel;
}

function WallDimensionLayer({ walls = [], calibration }) {
  return (
    <>
      {walls.map((wall) => (
        <DimensionLine
          key={wall.id}
          startPoint={wall.startPoint}
          endPoint={wall.endPoint}
          distanceMm={getDistanceMm(
            wall.startPoint,
            wall.endPoint,
            calibration,
          )}
        />
      ))}
    </>
  );
}

export default WallDimensionLayer;
