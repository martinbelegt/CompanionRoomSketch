import { Line } from "react-konva";

const DEFAULT_MM_PER_PIXEL = 10;
const MINOR_GRID_MM = 100;
const MAJOR_GRID_MM = 500;
const MINOR_GRID_STROKE = "rgba(96, 165, 250, 0.22)";
const MAJOR_GRID_STROKE = "rgba(59, 130, 246, 0.38)";

function createGridLines({ start, end, step }) {
  const first = Math.floor(start / step) * step;
  const lines = [];

  for (let value = first; value <= end; value += step) {
    lines.push(value);
  }

  return lines;
}

function isMajorLine(value, majorStep) {
  return Math.abs(value / majorStep - Math.round(value / majorStep)) < 0.001;
}

function GridLayer({ calibration, visibleBounds }) {
  const mmPerPixel = calibration?.mmPerPixel ?? DEFAULT_MM_PER_PIXEL;
  const minorStep = MINOR_GRID_MM / mmPerPixel;
  const majorStep = MAJOR_GRID_MM / mmPerPixel;

  if (!visibleBounds || minorStep <= 0) return null;

  const padding = majorStep;
  const left = visibleBounds.x - padding;
  const right = visibleBounds.x + visibleBounds.width + padding;
  const top = visibleBounds.y - padding;
  const bottom = visibleBounds.y + visibleBounds.height + padding;
  const verticalLines = createGridLines({ start: left, end: right, step: minorStep });
  const horizontalLines = createGridLines({ start: top, end: bottom, step: minorStep });

  return (
    <>
      {verticalLines.map((x) => {
        const major = isMajorLine(x, majorStep);

        return (
          <Line
            key={`v-${x}`}
            points={[x, top, x, bottom]}
            stroke={major ? MAJOR_GRID_STROKE : MINOR_GRID_STROKE}
            strokeWidth={major ? 1.1 : 0.7}
            strokeScaleEnabled={false}
            listening={false}
          />
        );
      })}

      {horizontalLines.map((y) => {
        const major = isMajorLine(y, majorStep);

        return (
          <Line
            key={`h-${y}`}
            points={[left, y, right, y]}
            stroke={major ? MAJOR_GRID_STROKE : MINOR_GRID_STROKE}
            strokeWidth={major ? 1.1 : 0.7}
            strokeScaleEnabled={false}
            listening={false}
          />
        );
      })}
    </>
  );
}

export default GridLayer;
