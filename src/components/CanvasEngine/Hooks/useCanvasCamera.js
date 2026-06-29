import { useState } from "react";

export default function useCanvasCamera() {
  const [camera, setCamera] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });

  function zoomAtPointer(stage, event) {
    event.evt.preventDefault();

    const oldScale = camera.scale;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const scaleBy = 1.08;
    const direction = event.evt.deltaY > 0 ? -1 : 1;

    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const clampedScale = Math.min(4, Math.max(0.25, newScale));

    const mousePointTo = {
      x: (pointer.x - camera.x) / oldScale,
      y: (pointer.y - camera.y) / oldScale,
    };

    setCamera({
      scale: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }

  function updatePosition(position) {
    setCamera((current) => ({
      ...current,
      ...position,
    }));
  }

  function resetCamera() {
    setCamera({
      x: 0,
      y: 0,
      scale: 1,
    });
  }

  return {
    camera,
    zoomAtPointer,
    updatePosition,
    resetCamera,
  };
}
