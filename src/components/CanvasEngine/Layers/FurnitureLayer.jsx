import FurnitureObject from "../Objects/FurnitureObject";

function FurnitureLayer({
  furniture,
  calibration,
  selectedFurnitureId,
  onSelectFurniture,
  onMove,
  onResize,
}) {
  return (
    <>
      {furniture.map((item) => (
        <FurnitureObject
          key={item.id}
          item={item}
          calibration={calibration}
          onMove={onMove}
          onResize={onResize}
          selected={item.id === selectedFurnitureId}
          onSelect={onSelectFurniture}
        />
      ))}
    </>
  );
}

export default FurnitureLayer;
