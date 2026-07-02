import { Line, Circle, Group } from "react-konva";

const WALL_COLOR = "#374151";
const SELECTED_WALL_COLOR = "#2563eb";
const WALL_WIDTH = 6;

function WallLayer({
  walls = [],
  selectedWallId,
  onWallClick,
  onUpdateWallPoint,
}) {
  return (
    <>
      {walls.map((wall) => (
        <Group key={wall.id}>
          <Line
            points={[
              wall.startPoint.x,
              wall.startPoint.y,
              wall.endPoint.x,
              wall.endPoint.y,
            ]}
            stroke={
              wall.id === selectedWallId ? SELECTED_WALL_COLOR : WALL_COLOR
            }
            strokeWidth={WALL_WIDTH}
            lineCap="round"
            lineJoin="round"
            onClick={(e) => {
              e.cancelBubble = true;
              onWallClick(wall);
            }}
          />

          {wall.id === selectedWallId && (
            <>
              <Circle
                x={wall.startPoint.x}
                y={wall.startPoint.y}
                radius={8}
                fill="#2563eb"
                stroke="white"
                strokeWidth={2}
                draggable
                listening
                onMouseDown={(e) => {
                  e.cancelBubble = true;
                }}
                onClick={(e) => {
                  e.cancelBubble = true;
                }}
                onDragStart={(e) => {
                  e.cancelBubble = true;
                }}
                onDragMove={(e) => {
                  e.cancelBubble = true;

                  onUpdateWallPoint(wall.id, "startPoint", {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
              />

              <Circle
                x={wall.endPoint.x}
                y={wall.endPoint.y}
                radius={8}
                fill="#2563eb"
                stroke="white"
                strokeWidth={2}
                draggable
                listening
                onMouseDown={(e) => {
                  e.cancelBubble = true;
                }}
                onClick={(e) => {
                  e.cancelBubble = true;
                }}
                onDragStart={(e) => {
                  e.cancelBubble = true;
                }}
                onDragMove={(e) => {
                  e.cancelBubble = true;

                  onUpdateWallPoint(wall.id, "endPoint", {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
              />
            </>
          )}
        </Group>
      ))}
    </>
  );
}

export default WallLayer;
