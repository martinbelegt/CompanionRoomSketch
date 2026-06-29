import { useEffect, useRef, useState } from "react";

export default function useCanvasSize() {
  const containerRef = useRef(null);

  const [size, setSize] = useState({
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    function updateSize() {
      if (!containerRef.current) return;

      setSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }

    updateSize();

    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return {
    containerRef,
    ...size,
  };
}
