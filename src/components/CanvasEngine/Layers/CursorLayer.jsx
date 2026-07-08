/**
 * ============================================================================
 * Companion RoomSketch
 * ============================================================================
 *
 * Bestand:
 * components/CanvasEngine/Layers/CursorLayer.jsx
 *
 * Component:
 * CursorLayer
 *
 * Verantwoordelijkheid:
 * Tekent het vizier van de digitale rolmaat.
 *
 * Functionaliteit:
 * - Kruisvizier
 * - Middelpunt
 * - Goed zichtbaar op lichte en donkere plattegronden
 *
 * Toekomst:
 * - Snap-indicator
 * - Magnetische cursor
 * - Actieve meetstatus
 * ============================================================================
 */

import { Group, Line } from "react-konva";

const COLOR = "#2563eb";

function CursorLayer({ cursor }) {
  return (
    <Group x={cursor.x} y={cursor.y} listening={false}>
      <Line points={[-18, 0, 18, 0]} stroke={COLOR} strokeWidth={1.5} />

      <Line points={[0, -18, 0, 18]} stroke={COLOR} strokeWidth={1.5} />
    </Group>
  );
}

export default CursorLayer;
