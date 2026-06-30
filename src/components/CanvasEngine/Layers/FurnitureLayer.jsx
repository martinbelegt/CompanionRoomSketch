import FurnitureObject from "../Objects/FurnitureObject";

function FurnitureLayer({
  furniture,
  calibration,
  selectedFurnitureId,
  onSelectFurniture,
  onMove,
}) {
  return (
    <>
      {furniture.map((item) => (
        <FurnitureObject
          key={item.id}
          item={item}
          calibration={calibration}
          onMove={onMove}
          selected={item.id === selectedFurnitureId}
          onSelect={onSelectFurniture}
        />
      ))}
    </>
  );
}

export default FurnitureLayer;
