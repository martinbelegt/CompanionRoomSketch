import { useCallback, useState } from "react";

const DEFAULT_CAMERA = {
  x: 0,
  y: 0,
  scale: 1,
};

function getValidCamera(camera) {
  if (
    !camera ||
    !Number.isFinite(camera.x) ||
    !Number.isFinite(camera.y) ||
    !Number.isFinite(camera.scale)
  ) {
    return DEFAULT_CAMERA;
  }

  return {
    x: camera.x,
    y: camera.y,
    scale: Math.min(4, Math.max(0.25, camera.scale)),
  };
}

export default function useCanvasCamera(initialCamera = DEFAULT_CAMERA) {
  const [camera, setCamera] = useState(() => getValidCamera(initialCamera));

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

  const restoreCamera = useCallback((nextCamera) => {
    setCamera(getValidCamera(nextCamera));
  }, []);

  return {
    camera,
    zoomAtPointer,
    updatePosition,
    resetCamera,
    restoreCamera,
  };
}
