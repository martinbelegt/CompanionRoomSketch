import { Circle, Group, Line, Rect } from "react-konva";

const STROKE = "#64748b";
const DETAIL = "#94a3b8";
const FILL = "#f8fafc";
const SOFT_FILL = "#eef2f7";
const SELECTED = "#2563eb";

function RoundedRect({ x, y, width, height, ...props }) {
  return (
    <Rect
      x={x}
      y={y}
      width={Math.max(1, width)}
      height={Math.max(1, height)}
      cornerRadius={Math.min(8, Math.max(2, Math.min(width, height) * 0.12))}
      {...props}
    />
  );
}

function FurnitureShape({ item, width, height }) {
  const left = -width / 2;
  const top = -height / 2;
  const right = width / 2;
  const bottom = height / 2;
  const pad = Math.max(4, Math.min(width, height) * 0.08);
  const shape = item.shape ?? "cabinet";

  if (shape === "sofa") {
    const seatCount = item.seats ?? 2;
    const innerWidth = width - pad * 2;
    const seatWidth = innerWidth / seatCount;

    return (
      <>
        <RoundedRect
          x={left}
          y={top}
          width={width}
          height={height}
          fill={SOFT_FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <RoundedRect
          x={left + pad}
          y={top + pad}
          width={innerWidth}
          height={height - pad * 2}
          fill={FILL}
          stroke={DETAIL}
          strokeWidth={1.4}
        />
        {Array.from({ length: seatCount - 1 }).map((_, index) => (
          <Line
            key={index}
            points={[
              left + pad + seatWidth * (index + 1),
              top + pad * 1.4,
              left + pad + seatWidth * (index + 1),
              bottom - pad * 1.4,
            ]}
            stroke={DETAIL}
            strokeWidth={1.2}
          />
        ))}
        <Line
          points={[left + pad, top + pad * 1.4, right - pad, top + pad * 1.4]}
          stroke={DETAIL}
          strokeWidth={2}
        />
      </>
    );
  }

  if (shape === "cornerSofaLeft" || shape === "cornerSofaRight") {
    const chaiseWidth = width * 0.42;
    const chaiseX = shape === "cornerSofaLeft" ? left : right - chaiseWidth;

    return (
      <>
        <RoundedRect
          x={left}
          y={top}
          width={width}
          height={height * 0.52}
          fill={SOFT_FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <RoundedRect
          x={chaiseX}
          y={top}
          width={chaiseWidth}
          height={height}
          fill={SOFT_FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <Line
          points={[left + pad, top + height * 0.26, right - pad, top + height * 0.26]}
          stroke={DETAIL}
          strokeWidth={1.4}
        />
        <Line
          points={[chaiseX + chaiseWidth / 2, top + pad, chaiseX + chaiseWidth / 2, bottom - pad]}
          stroke={DETAIL}
          strokeWidth={1.4}
        />
      </>
    );
  }

  if (shape === "armchair" || shape === "chair") {
    return (
      <>
        <RoundedRect
          x={left}
          y={top}
          width={width}
          height={height}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <RoundedRect
          x={left + pad}
          y={top + pad * 1.4}
          width={width - pad * 2}
          height={height - pad * 2.2}
          fill={SOFT_FILL}
          stroke={DETAIL}
          strokeWidth={1.2}
        />
        <Line
          points={[left + pad, top + pad, right - pad, top + pad]}
          stroke={DETAIL}
          strokeWidth={2}
        />
      </>
    );
  }

  if (shape === "stool" || shape === "diningTableRound") {
    const radius = Math.min(width, height) / 2;

    return (
      <>
        <Circle
          x={0}
          y={0}
          radius={radius}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <Circle
          x={0}
          y={0}
          radius={Math.max(2, radius - pad)}
          stroke={DETAIL}
          strokeWidth={1.2}
        />
        {shape === "diningTableRound" && (
          <>
            <Line points={[-radius + pad, 0, radius - pad, 0]} stroke={DETAIL} strokeWidth={1} />
            <Line points={[0, -radius + pad, 0, radius - pad]} stroke={DETAIL} strokeWidth={1} />
          </>
        )}
      </>
    );
  }

  if (shape === "tableRect" || shape === "diningTableRect") {
    const legRadius = Math.max(2, Math.min(width, height) * 0.045);

    return (
      <>
        <RoundedRect
          x={left}
          y={top}
          width={width}
          height={height}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <RoundedRect
          x={left + pad}
          y={top + pad}
          width={width - pad * 2}
          height={height - pad * 2}
          fill="transparent"
          stroke={DETAIL}
          strokeWidth={1.2}
        />
        {shape === "diningTableRect" && (
          <Line points={[0, top + pad, 0, bottom - pad]} stroke={DETAIL} strokeWidth={1} />
        )}
        <Circle x={left + pad * 1.4} y={top + pad * 1.4} radius={legRadius} fill={DETAIL} />
        <Circle x={right - pad * 1.4} y={top + pad * 1.4} radius={legRadius} fill={DETAIL} />
        <Circle x={left + pad * 1.4} y={bottom - pad * 1.4} radius={legRadius} fill={DETAIL} />
        <Circle x={right - pad * 1.4} y={bottom - pad * 1.4} radius={legRadius} fill={DETAIL} />
      </>
    );
  }

  if (shape === "bedDouble" || shape === "bedSingle") {
    const pillowCount = shape === "bedDouble" ? 2 : 1;
    const pillowWidth = (width - pad * (pillowCount + 1)) / pillowCount;

    return (
      <>
        <RoundedRect
          x={left}
          y={top}
          width={width}
          height={height}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        {Array.from({ length: pillowCount }).map((_, index) => (
          <RoundedRect
            key={index}
            x={left + pad + index * (pillowWidth + pad)}
            y={top + pad}
            width={pillowWidth}
            height={height * 0.18}
            fill={SOFT_FILL}
            stroke={DETAIL}
            strokeWidth={1.2}
          />
        ))}
        <Line
          points={[left + pad, top + height * 0.28, right - pad, top + height * 0.28]}
          stroke={DETAIL}
          strokeWidth={1.2}
        />
      </>
    );
  }

  if (shape === "toilet") {
    return (
      <>
        <RoundedRect
          x={left + width * 0.18}
          y={top}
          width={width * 0.64}
          height={height * 0.22}
          fill={SOFT_FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <Circle
          x={0}
          y={top + height * 0.58}
          radius={Math.min(width * 0.38, height * 0.32)}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <Circle
          x={0}
          y={top + height * 0.58}
          radius={Math.min(width * 0.22, height * 0.18)}
          stroke={DETAIL}
          strokeWidth={1.2}
        />
      </>
    );
  }

  if (shape === "sink") {
    return (
      <>
        <RoundedRect
          x={left}
          y={top}
          width={width}
          height={height}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <Circle
          x={0}
          y={0}
          radius={Math.min(width, height) * 0.28}
          stroke={DETAIL}
          strokeWidth={1.4}
        />
        <Circle x={0} y={0} radius={2.5} fill={DETAIL} />
      </>
    );
  }

  if (shape === "shower") {
    return (
      <>
        <RoundedRect
          x={left}
          y={top}
          width={width}
          height={height}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <Line points={[left + pad, bottom - pad, right - pad, top + pad]} stroke={DETAIL} strokeWidth={1.4} />
        <Circle x={left + pad * 1.7} y={top + pad * 1.7} radius={Math.max(2, pad * 0.45)} fill={DETAIL} />
      </>
    );
  }

  if (shape === "bathtub") {
    return (
      <>
        <RoundedRect
          x={left}
          y={top}
          width={width}
          height={height}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <RoundedRect
          x={left + pad}
          y={top + pad}
          width={width - pad * 2}
          height={height - pad * 2}
          fill={SOFT_FILL}
          stroke={DETAIL}
          strokeWidth={1.2}
        />
        <Circle x={left + pad * 1.7} y={0} radius={Math.max(2, pad * 0.45)} fill={DETAIL} />
      </>
    );
  }

  if (shape === "mediaUnit" || shape === "cabinet" || shape === "wardrobe") {
    const divisions = shape === "wardrobe" ? 3 : 2;

    return (
      <>
        <RoundedRect
          x={left}
          y={top}
          width={width}
          height={height}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        {Array.from({ length: divisions - 1 }).map((_, index) => (
          <Line
            key={index}
            points={[
              left + (width / divisions) * (index + 1),
              top + pad,
              left + (width / divisions) * (index + 1),
              bottom - pad,
            ]}
            stroke={DETAIL}
            strokeWidth={1.1}
          />
        ))}
        {shape === "mediaUnit" && (
          <Line points={[left + pad, top + pad, right - pad, top + pad]} stroke={DETAIL} strokeWidth={1.2} />
        )}
      </>
    );
  }

  if (shape === "nightstand") {
    return (
      <>
        <RoundedRect
          x={left}
          y={top}
          width={width}
          height={height}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <Line points={[left + pad, 0, right - pad, 0]} stroke={DETAIL} strokeWidth={1.2} />
        <Circle x={0} y={height * 0.24} radius={Math.max(2, pad * 0.35)} fill={DETAIL} />
      </>
    );
  }

  return (
    <RoundedRect
      x={left}
      y={top}
      width={width}
      height={height}
      fill={FILL}
      stroke={STROKE}
      strokeWidth={2}
    />
  );
}

function FurnitureObject({
  item,
  calibration,
  selected,
  onSelect,
  onMove,
  onResize,
  preview = false,
}) {
  const mmPerPixel = calibration?.mmPerPixel ?? 10;

  const width = item.widthMm / mmPerPixel;
  const height = item.depthMm / mmPerPixel;
  const centerX = item.x + width / 2;
  const centerY = item.y + height / 2;

  function setCursor(e, cursor) {
    const stage = e.target.getStage();
    if (!stage) return;

    stage.container().style.cursor = cursor;
  }

  function handleResizeDragMove(e) {
    e.cancelBubble = true;

    const handleX = Math.max(30, e.target.x() + width / 2 + 9);
    const handleY = Math.max(30, e.target.y() + height / 2 + 9);

    onResize(item.id, {
      widthMm: handleX * mmPerPixel,
      depthMm: handleY * mmPerPixel,
    });
  }

  return (
    <Group
      x={centerX}
      y={centerY}
      rotation={item.rotation ?? 0}
      draggable={!preview}
      listening={!preview}
      opacity={preview ? 0.55 : 1}
      onMouseEnter={(e) => {
        if (!preview) setCursor(e, "grab");
      }}
      onMouseLeave={(e) => {
        if (!preview) setCursor(e, "default");
      }}
      onMouseDown={(e) => {
        e.cancelBubble = true;
        onSelect(item.id);
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect(item.id);
      }}
      onDragStart={(e) => {
        e.cancelBubble = true;
        setCursor(e, "grabbing");
        onSelect(item.id);
      }}
      onDragMove={(e) => {
        e.cancelBubble = true;
      }}
      onDragEnd={(e) => {
        e.cancelBubble = true;

        onMove(item.id, {
          x: e.target.x() - width / 2,
          y: e.target.y() - height / 2,
        });

        setCursor(e, "grab");
      }}
    >
      <FurnitureShape item={item} width={width} height={height} />

      {selected && (
        <>
          <Rect
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            stroke={SELECTED}
            strokeWidth={2}
            dash={[6, 4]}
            fillEnabled={false}
          />
          <Circle
            x={-width / 2}
            y={-height / 2}
            radius={7}
            fill="white"
            stroke={SELECTED}
            strokeWidth={2}
          />
          <Circle
            x={width / 2}
            y={-height / 2}
            radius={7}
            fill="white"
            stroke={SELECTED}
            strokeWidth={2}
          />
          <Circle
            x={-width / 2}
            y={height / 2}
            radius={7}
            fill="white"
            stroke={SELECTED}
            strokeWidth={2}
          />
          <Circle
            x={width / 2}
            y={height / 2}
            radius={8}
            fill="white"
            stroke={SELECTED}
            strokeWidth={2}
            draggable
            onMouseEnter={(e) => setCursor(e, "nwse-resize")}
            onMouseLeave={(e) => setCursor(e, "grab")}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              onSelect(item.id);
            }}
            onDragMove={handleResizeDragMove}
            onDragEnd={(e) => {
              e.cancelBubble = true;
              setCursor(e, "grab");
            }}
          />
        </>
      )}
    </Group>
  );
}

export default FurnitureObject;
