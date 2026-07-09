export function getConstrainedWorldPoint(pointA, pointB, shiftKey) {
  if (!pointA) return pointB;

  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;

  if (shiftKey) {
    return Math.abs(dx) >= Math.abs(dy)
      ? { x: pointB.x, y: pointA.y }
      : { x: pointA.x, y: pointB.y };
  }

  const tolerance = Math.tan((10 * Math.PI) / 180);
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx > 0 && absDy / absDx <= tolerance) {
    return { x: pointB.x, y: pointA.y };
  }

  if (absDy > 0 && absDx / absDy <= tolerance) {
    return { x: pointA.x, y: pointB.y };
  }

  return pointB;
}

export function buildWorldMeasurementPoints({ points, pointer, shiftKey }) {
  if (points.length >= 2) return [pointer];

  const pointA = points[0];
  const nextPoint =
    points.length === 1
      ? getConstrainedWorldPoint(pointA, pointer, shiftKey)
      : pointer;

  return [...points, nextPoint];
}
