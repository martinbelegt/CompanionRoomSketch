import {
  DEFAULT_DOOR_OPENING_WIDTH_MM,
  DEFAULT_DOOR_WIDTH_MM,
} from "./doorConstants";

const DEFAULT_MM_PER_PIXEL = 10;

function getWallVector(wall) {
  const dx = wall.endPoint.x - wall.startPoint.x;
  const dy = wall.endPoint.y - wall.startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;

  return {
    direction: {
      x: dx / length,
      y: dy / length,
    },
    normal: {
      x: -dy / length,
      y: dx / length,
    },
    length,
  };
}

function getRoomForWall(wallId, rooms = []) {
  return rooms.find((room) => room.wallIds?.includes(wallId));
}

function getOpeningCenter(wall, clickPosition, openingWidthPx) {
  const { direction, length } = getWallVector(wall);
  const vx = clickPosition.x - wall.startPoint.x;
  const vy = clickPosition.y - wall.startPoint.y;
  const distanceAlongWall = vx * direction.x + vy * direction.y;
  const halfOpeningWidth = openingWidthPx / 2;
  const minDistance = Math.min(halfOpeningWidth, length / 2);
  const maxDistance = Math.max(minDistance, length - halfOpeningWidth);
  const clampedDistance = Math.max(
    minDistance,
    Math.min(maxDistance, distanceAlongWall),
  );

  return {
    x: wall.startPoint.x + direction.x * clampedDistance,
    y: wall.startPoint.y + direction.y * clampedDistance,
    distanceAlongWall: clampedDistance,
  };
}

function getOpenDirection(wall, position, rooms = []) {
  const { normal } = getWallVector(wall);
  const room = getRoomForWall(wall.id, rooms);

  if (!room?.center) return normal;

  const toRoomCenter = {
    x: room.center.x - position.x,
    y: room.center.y - position.y,
  };
  const pointsTowardRoom =
    toRoomCenter.x * normal.x + toRoomCenter.y * normal.y >= 0;

  return pointsTowardRoom
    ? normal
    : {
        x: -normal.x,
        y: -normal.y,
      };
}

export function createDoor(wall, clickPosition, options = {}) {
  const mmPerPixel = options.calibration?.mmPerPixel ?? DEFAULT_MM_PER_PIXEL;
  const openingWidthPx = DEFAULT_DOOR_OPENING_WIDTH_MM / mmPerPixel;
  const position = getOpeningCenter(wall, clickPosition, openingWidthPx);
  const { length } = getWallVector(wall);
  const hingeSide =
    position.distanceAlongWall <= length - position.distanceAlongWall
      ? "start"
      : "end";

  return {
    id: crypto.randomUUID(),
    wallId: wall.id,

    position: {
      x: position.x,
      y: position.y,
    },

    widthMm: DEFAULT_DOOR_WIDTH_MM,
    doorWidthMm: DEFAULT_DOOR_WIDTH_MM,
    sparingWidthMm: DEFAULT_DOOR_OPENING_WIDTH_MM,

    hingeSide,
    openDirection: getOpenDirection(wall, position, options.rooms),

    direction: "inside",
    swing: hingeSide === "start" ? "right" : "left",
  };
}
