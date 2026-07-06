import { useState } from "react";

function RectangleRoomDialog({ open, onClose, onCreate }) {
  const [name, setName] = useState("Woonkamer");
  const [lengthMm, setLengthMm] = useState("4820");
  const [widthMm, setWidthMm] = useState("3540");

  function handleCreate() {
    onCreate({
      name,
      lengthMm: lengthMm.replace(",", "."),
      widthMm: widthMm.replace(",", "."),
    });
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          width: 420,
          boxShadow: "0 20px 40px rgba(15,23,42,0.25)",
        }}
      >
        <h2>🏠 Nieuwe ruimte</h2>

        <label className="field-label">
          Naam ruimte
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="field-label">
          Lengte muur 1 (mm)
          <input
            value={lengthMm}
            onChange={(e) => setLengthMm(e.target.value)}
          />
        </label>

        <label className="field-label">
          Lengte muur 2 (mm)
          <input value={widthMm} onChange={(e) => setWidthMm(e.target.value)} />
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="sidebar-button" onClick={onClose}>
            Annuleren
          </button>

          <button
            className="sidebar-button sidebar-primary-button"
            onClick={handleCreate}
          >
            Maken →
          </button>
        </div>
      </div>
    </div>
  );
}

export default RectangleRoomDialog;
