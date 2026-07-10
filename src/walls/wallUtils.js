export const DEFAULT_WALL_THICKNESS_MM = 100;

export function createWall(startPoint, endPoint, options = {}) {
  return {
    id: crypto.randomUUID(),
    startPoint,
    endPoint,
    thicknessMm: options.thicknessMm ?? DEFAULT_WALL_THICKNESS_MM,
    color: options.color,
  };
}

export function snapToWallEndpoints(point, walls, threshold = 12) {
  let snappedPoint = point;

  for (const wall of walls) {
    const candidates = [wall.startPoint, wall.endPoint];

    for (const candidate of candidates) {
      const dx = point.x - candidate.x;
      const dy = point.y - candidate.y;

      if (Math.sqrt(dx * dx + dy * dy) <= threshold) {
        snappedPoint = candidate;
        return snappedPoint;
      }
    }
  }

  return snappedPoint;
}
export function findSnapPoint(point, walls, threshold = 12) {
  for (const wall of walls) {
    const candidates = [wall.startPoint, wall.endPoint];

    for (const candidate of candidates) {
      const dx = point.x - candidate.x;
      const dy = point.y - candidate.y;

      if (Math.sqrt(dx * dx + dy * dy) <= threshold) {
        return candidate;
      }
    }
  }

  return null;
}
