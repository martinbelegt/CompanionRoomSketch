import { useCallback, useState } from "react";

const DEFAULT_CAMERA = {
  x: 0,
  y: 0,
  scale: 1,
};

export default function useCanvasCamera() {
  const [camera, setCamera] = useState(DEFAULT_CAMERA);

  const zoomAtPointer = useCallback((stage, event) => {
    event.evt.preventDefault();

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const scaleBy = 1.08;
    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.min(4, Math.max(0.25, newScale));

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    setCamera({
      scale: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, []);

  const updatePosition = useCallback((position) => {
    setCamera((current) => ({
      ...current,
      ...position,
    }));
  }, []);

  const resetCamera = useCallback(() => {
    setCamera(DEFAULT_CAMERA);
  }, []);

  return {
    camera,
    zoomAtPointer,
    updatePosition,
    resetCamera,
  };
}
