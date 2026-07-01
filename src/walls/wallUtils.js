export function createWall(startPoint, endPoint) {
  return {
    id: crypto.randomUUID(),
    startPoint,
    endPoint,
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
