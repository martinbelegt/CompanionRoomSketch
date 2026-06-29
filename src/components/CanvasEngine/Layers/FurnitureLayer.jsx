import FurnitureObject from "../Objects/FurnitureObject";

function FurnitureLayer({ furniture, onMove }) {
  return (
    <>
      {furniture.map((item) => (
        <FurnitureObject key={item.id} item={item} onMove={onMove} />
      ))}
    </>
  );
}

export default FurnitureLayer;
