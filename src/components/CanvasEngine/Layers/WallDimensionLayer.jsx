import { Group } from "react-konva";

import { DimensionLine } from "../../../measurement";

const WALL_DIMENSION_OFFSET = 45;

function getDistanceMm(startPoint, endPoint, calibration) {
  if (!calibration?.mmPerPixel) return null;

  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;

  return Math.sqrt(dx * dx + dy * dy) * calibration.mmPerPixel;
}

function getWallNormal(wall) {
  const dx = wall.endPoint.x - wall.startPoint.x;
  const dy = wall.endPoint.y - wall.startPoint.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  if (!length) return { x: 0, y: -1 };

  return {
    x: -dy / length,
    y: dx / length,
  };
}

function offsetPoint(point, normal, distance) {
  return {
    x: point.x + normal.x * distance,
    y: point.y + normal.y * distance,
  };
}

function WallDimensionLayer({ walls = [], calibration }) {
  return (
    <Group listening={false}>
      {walls.map((wall) => {
        const normal = getWallNormal(wall);

        const startPoint = offsetPoint(
          wall.startPoint,
          normal,
          WALL_DIMENSION_OFFSET,
        );

        const endPoint = offsetPoint(
          wall.endPoint,
          normal,
          WALL_DIMENSION_OFFSET,
        );

        return (
          <DimensionLine
            key={wall.id}
            startPoint={startPoint}
            endPoint={endPoint}
            distanceMm={getDistanceMm(
              wall.startPoint,
              wall.endPoint,
              calibration,
            )}
          />
        );
      })}
    </Group>
  );
}

export default WallDimensionLayer;
