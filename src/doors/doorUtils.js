import { DEFAULT_DOOR_WIDTH_MM } from "./doorConstants";

export function createDoor(wallId, position) {
  return {
    id: crypto.randomUUID(),
    wallId,

    position,

    widthMm: DEFAULT_DOOR_WIDTH_MM,

    swing: "left",

    direction: "inside",
  };
}
