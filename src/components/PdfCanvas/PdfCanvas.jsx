import { useState } from "react";
import "./PdfCanvas.css";

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfCanvas() {
  const [zoom, setZoom] = useState(1);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [points, setPoints] = useState([]);

  function handleCanvasClick(event) {
    if (!calibrationMode || points.length >= 2) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setPoints((current) => [...current, point]);
  }

  function resetCalibration() {
    setPoints([]);
    setCalibrationMode(false);
  }

  return (
    <div className="pdf-canvas">
      <div className="pdf-toolbar">
        <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))}>
          −
        </button>

        <span>{Math.round(zoom * 100)}%</span>

        <button onClick={() => setZoom((z) => Math.min(4, z + 0.1))}>+</button>

        <button
          className={calibrationMode ? "active-tool" : ""}
          onClick={() => {
            setCalibrationMode(true);
            setPoints([]);
          }}
        >
          📏 Kalibreren
        </button>

        <button onClick={resetCalibration}>Reset</button>
      </div>

      <div className="pdf-page-wrap" onClick={handleCanvasClick}>
        <Document file="/projects/hank/floorplan.pdf">
          <Page
            pageNumber={1}
            width={680 * zoom}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>

        <svg className="calibration-layer" width="100%" height="100%">
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="6"
              className="calibration-point"
            />
          ))}

          {points.length === 2 && (
            <line
              x1={points[0].x}
              y1={points[0].y}
              x2={points[1].x}
              y2={points[1].y}
              className="calibration-line"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

export default PdfCanvas;
