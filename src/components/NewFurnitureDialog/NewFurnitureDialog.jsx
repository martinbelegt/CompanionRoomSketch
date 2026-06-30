import { useState } from "react";
import "./NewFurnitureDialog.css";

function NewFurnitureDialog({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  const [widthMm, setWidthMm] = useState("");
  const [depthMm, setDepthMm] = useState("");

  if (!open) return null;

  function handleSave() {
    if (!name || !widthMm || !depthMm) return;

    onSave({
      id: crypto.randomUUID(),
      type: "custom",
      name,
      widthMm: Number(widthMm),
      depthMm: Number(depthMm),
    });

    setName("");
    setWidthMm("");
    setDepthMm("");
    onClose();
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <h2>Nieuw meubel</h2>

        <label>
          Naam
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Breedte in mm
          <input
            value={widthMm}
            onChange={(e) => setWidthMm(e.target.value)}
            placeholder="bijv. 1700"
          />
        </label>

        <label>
          Diepte in mm
          <input
            value={depthMm}
            onChange={(e) => setDepthMm(e.target.value)}
            placeholder="bijv. 950"
          />
        </label>

        <div className="dialog-actions">
          <button onClick={onClose}>Annuleren</button>
          <button className="primary" onClick={handleSave}>
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewFurnitureDialog;
