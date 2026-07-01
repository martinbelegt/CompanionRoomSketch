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

import { Group, Line, Circle } from "react-konva";

const COLOR = "#2563eb";

function CursorLayer({ cursor }) {
  return (
    <Group x={cursor.x} y={cursor.y} listening={false}>
      {/* horizontaal */}
      <Line points={[-14, 0, -4, 0]} stroke={COLOR} strokeWidth={2} />

      <Line points={[4, 0, 14, 0]} stroke={COLOR} strokeWidth={2} />

      {/* verticaal */}
      <Line points={[0, -14, 0, -4]} stroke={COLOR} strokeWidth={2} />

      <Line points={[0, 4, 0, 14]} stroke={COLOR} strokeWidth={2} />

      {/* middelpunt */}
      <Circle radius={2.5} fill={COLOR} />

      {/* buitenring */}
      <Circle radius={6} stroke={COLOR} strokeWidth={1} />
    </Group>
  );
}

export default CursorLayer;
