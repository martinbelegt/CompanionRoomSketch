import { Line } from "react-konva";

const DOOR_COLOR = "#92400e";
const DOOR_WIDTH = 10;
const DOOR_LENGTH = 18;

function getWallCenter(wall) {
  return {
    x: (wall.startPoint.x + wall.endPoint.x) / 2,
    y: (wall.startPoint.y + wall.endPoint.y) / 2,
  };
}

function getWallNormal(wall) {
  const dx = wall.endPoint.x - wall.startPoint.x;
  const dy = wall.endPoint.y - wall.startPoint.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  if (!length) return { x: 0, y: 0 };

  return {
    x: -dy / length,
    y: dx / length,
  };
}

function DoorLayer({ doors = [], walls = [] }) {
  return (
    <>
      {doors.map((door) => {
        const wall = walls.find((item) => item.id === door.wallId);

        if (!wall) return null;

        const center = door.position ?? getWallCenter(wall);
        const normal = getWallNormal(wall);

        return (
          <Line
            key={door.id}
            points={[
              center.x - normal.x * DOOR_LENGTH,
              center.y - normal.y * DOOR_LENGTH,
              center.x + normal.x * DOOR_LENGTH,
              center.y + normal.y * DOOR_LENGTH,
            ]}
            stroke={DOOR_COLOR}
            strokeWidth={DOOR_WIDTH}
            lineCap="round"
            listening={false}
          />
        );
      })}
    </>
  );
}

export default DoorLayer;
