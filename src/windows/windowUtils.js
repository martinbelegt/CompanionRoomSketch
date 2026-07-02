import { DEFAULT_WINDOW_WIDTH_MM } from "./windowConstants";

export function createWindow(wallId, position) {
  return {
    id: crypto.randomUUID(),
    wallId,

    position,

    widthMm: DEFAULT_WINDOW_WIDTH_MM,

    sillHeightMm: 900,

    heightMm: 1200,
  };
}
