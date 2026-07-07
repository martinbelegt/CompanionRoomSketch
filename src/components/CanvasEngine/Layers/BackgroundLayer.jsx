import { Image } from "react-konva";
import useImage from "use-image";

function BackgroundLayer({
  background,
  backgroundCalibrationActive,
  selectedObject,
  onSelectObject,
  onStartBackgroundMove,
  onUpdateBackground,
}) {
  const [image] = useImage(background?.source);

  if (!background?.visible || !image) return null;

  const isSelected = selectedObject?.type === "background";
  const isInteractive = !background.locked && !backgroundCalibrationActive;

  return (
    <Image
      image={image}
      x={background.x ?? 0}
      y={background.y ?? 0}
      width={image.width * (background.scale ?? 1)}
      height={image.height * (background.scale ?? 1)}
      opacity={background.opacity ?? 0.5}
      draggable={isInteractive}
      listening={isInteractive}
      stroke={isSelected ? "#2563eb" : undefined}
      strokeWidth={isSelected ? 2 : 0}
      onMouseDown={(e) => {
        e.cancelBubble = true;
        onSelectObject("background", "background");
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelectObject("background", "background");
      }}
      onDragStart={(e) => {
        e.cancelBubble = true;
        onStartBackgroundMove?.();
      }}
      onDragMove={(e) => {
        e.cancelBubble = true;
        onUpdateBackground(
          {
            x: e.target.x(),
            y: e.target.y(),
          },
          { skipUndo: true },
        );
      }}
      onDragEnd={(e) => {
        e.cancelBubble = true;
      }}
    />
  );
}

export default BackgroundLayer;
