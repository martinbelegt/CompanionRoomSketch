import FurnitureObject from "../Objects/FurnitureObject";

function PendingFurnitureLayer({ pendingFurniture, cursor, calibration }) {
  if (!pendingFurniture) return null;

  const mmPerPixel = calibration?.mmPerPixel ?? 10;
  const width = pendingFurniture.widthMm / mmPerPixel;
  const height = pendingFurniture.depthMm / mmPerPixel;

  return (
    <FurnitureObject
      item={{
        ...pendingFurniture,
        id: "pending-furniture",
        x: cursor.x - width / 2,
        y: cursor.y - height / 2,
      }}
      calibration={calibration}
      preview
      selected={false}
      onMove={() => {}}
      onResize={() => {}}
      onSelect={() => {}}
    />
  );
}

export default PendingFurnitureLayer;
