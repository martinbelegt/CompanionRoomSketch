import { Image } from "react-konva";

function PdfLayer({ image }) {
  if (!image) return null;

  return <Image image={image} listening={false} />;
}

export default PdfLayer;
