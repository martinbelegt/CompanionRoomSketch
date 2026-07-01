export function createWall(startPoint, endPoint) {
  return {
    id: crypto.randomUUID(),
    startPoint,
    endPoint,
  };
}
