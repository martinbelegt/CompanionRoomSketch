/**
 * ============================================================================
 * Companion RoomSketch
 * ============================================================================
 *
 * Bestand:
 * measurement/components/DimensionLine.jsx
 *
 * Component:
 * DimensionLine
 *
 * Verantwoordelijkheid:
 * Tekent één technische maatlijn tussen twee meetpunten.
 *
 * Functionaliteit:
 * - Offset maatlijn
 * - Verbindingslijnen (extension lines)
 * - Eindstreepjes (dimension ticks)
 * - Meetpunten
 * - Dynamisch maatlabel
 *
 * Wordt gebruikt door:
 * - MeasurementLayer
 * - Rolmaat
 * - Permanente maatlijnen (toekomst)
 * - Wandmaten
 * - Meubelmaten
 *
 * Ontwerpfilosofie:
 * Companion RoomSketch is geen CAD-programma.
 * De gebruiker moet kunnen meten zonder technische kennis.
 * Eenvoud voor de gebruiker, nette architectuur onder de motorkap.
 *
 * Toekomstige uitbreidingen:
 * - Live rolmaat
 * - Permanente maatlijnen
 * - Slimme snap op muren
 * - Binnen- en buitenmaten
 * - 3D projectie
 *
 * Laatste grote revisie:
 * Sprint 17.3 - Technische maatvoering
 * ============================================================================
 */

import { Line, Circle, Text, Label, Tag } from "react-konva";

import { formatDistanceAuto } from "../utils/unitConversion";

const DIMENSION_COLOR = "#2563eb";
const LABEL_BACKGROUND = "white";

const DIMENSION_OFFSET = 20;
const EXTENSION_EXTRA = 8;
const TICK_LENGTH = 14;

function getLineGeometry(startPoint, endPoint) {
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (!Number.isFinite(length) || length === 0) {
    return null;
  }

  const unit = {
    x: dx / length,
    y: dy / length,
  };

  const normal = {
    x: -unit.y,
    y: unit.x,
  };

  return {
    length,
    unit,
    normal,
  };
}

function offsetPoint(point, normal, distance) {
  return {
    x: point.x + normal.x * distance,
    y: point.y + normal.y * distance,
  };
}

function createTickPoints(point, normal, tickLength) {
  const halfTick = tickLength / 2;

  return [
    point.x - normal.x * halfTick,
    point.y - normal.y * halfTick,
    point.x + normal.x * halfTick,
    point.y + normal.y * halfTick,
  ];
}

function createExtensionPoints(sourcePoint, targetPoint, normal) {
  return [
    sourcePoint.x,
    sourcePoint.y,
    targetPoint.x + normal.x * EXTENSION_EXTRA,
    targetPoint.y + normal.y * EXTENSION_EXTRA,
  ];
}

function DimensionLine({ startPoint, endPoint, distanceMm }) {
  if (!startPoint || !endPoint || distanceMm == null) {
    return null;
  }

  const geometry = getLineGeometry(startPoint, endPoint);

  if (!geometry) {
    return null;
  }

  const { normal } = geometry;

  const offsetStart = offsetPoint(startPoint, normal, DIMENSION_OFFSET);
  const offsetEnd = offsetPoint(endPoint, normal, DIMENSION_OFFSET);

  const centerX = (offsetStart.x + offsetEnd.x) / 2;
  const centerY = (offsetStart.y + offsetEnd.y) / 2;

  const labelText = formatDistanceAuto(distanceMm);
  const estimatedLabelWidth = Math.max(56, labelText.length * 9 + 16);

  return (
    <>
      <Line
        points={[offsetStart.x, offsetStart.y, offsetEnd.x, offsetEnd.y]}
        stroke={DIMENSION_COLOR}
        strokeWidth={2}
      />

      <Line
        points={createExtensionPoints(startPoint, offsetStart, normal)}
        stroke={DIMENSION_COLOR}
        strokeWidth={1}
      />

      <Line
        points={createExtensionPoints(endPoint, offsetEnd, normal)}
        stroke={DIMENSION_COLOR}
        strokeWidth={1}
      />

      <Line
        points={createTickPoints(offsetStart, normal, TICK_LENGTH)}
        stroke={DIMENSION_COLOR}
        strokeWidth={2}
      />

      <Line
        points={createTickPoints(offsetEnd, normal, TICK_LENGTH)}
        stroke={DIMENSION_COLOR}
        strokeWidth={2}
      />

      <Circle
        x={startPoint.x}
        y={startPoint.y}
        radius={4}
        fill={DIMENSION_COLOR}
      />

      <Circle x={endPoint.x} y={endPoint.y} radius={4} fill={DIMENSION_COLOR} />

      <Label x={centerX} y={centerY - 22} offsetX={estimatedLabelWidth / 2}>
        <Tag
          fill={LABEL_BACKGROUND}
          stroke={DIMENSION_COLOR}
          cornerRadius={4}
        />

        <Text
          text={labelText}
          width={estimatedLabelWidth}
          align="center"
          padding={6}
          fontSize={16}
          fill={DIMENSION_COLOR}
        />
      </Label>
    </>
  );
}

export default DimensionLine;
