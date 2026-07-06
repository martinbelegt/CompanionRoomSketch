import { useState } from "react";

function OpeningDialog({ open, onClose, onCreate }) {
  const [widthMm, setWidthMm] = useState("1200");

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
        }}
      >
        <h2>⬜ Open doorgang</h2>

        <label>
          Breedte (mm)
          <input value={widthMm} onChange={(e) => setWidthMm(e.target.value)} />
        </label>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 20,
          }}
        >
          <button onClick={onClose}>Annuleren</button>

          <button
            onClick={() =>
              onCreate({
                widthMm: Number(widthMm),
              })
            }
          >
            Volgende →
          </button>
        </div>
      </div>
    </div>
  );
}

export default OpeningDialog;
