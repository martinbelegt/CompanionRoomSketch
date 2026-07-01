/**
 * ============================================================================
 * Companion RoomSketch
 * ============================================================================
 *
 * Bestand:
 * components/CanvasEngine/Layers/WallLayer.jsx
 *
 * Component:
 * WallLayer
 *
 * Verantwoordelijkheid:
 * Tekent alle muren van het project.
 *
 * Functionaliteit:
 * - Weergave van muursegmenten
 * - Duidelijke muurkleur
 * - Klikbare muur (later)
 *
 * Toekomst:
 * - Selecteren
 * - Verplaatsen
 * - Verwijderen
 * - Snap
 * - Kamerherkenning
 * ============================================================================
 */

import { Line } from "react-konva";

const WALL_COLOR = "#374151";
const WALL_WIDTH = 6;

function WallLayer({ walls = [] }) {
  if (walls.length === 0) {
    return null;
  }

  return (
    <>
      {walls.map((wall) => (
        <Line
          key={wall.id}
          points={[
            wall.startPoint.x,
            wall.startPoint.y,
            wall.endPoint.x,
            wall.endPoint.y,
          ]}
          stroke={WALL_COLOR}
          strokeWidth={WALL_WIDTH}
          lineCap="round"
          lineJoin="round"
        />
      ))}
    </>
  );
}

export default WallLayer;
