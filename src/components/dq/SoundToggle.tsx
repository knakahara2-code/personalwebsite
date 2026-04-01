"use client";

export function SoundToggle({
  soundEnabled,
  onToggle,
}: {
  soundEnabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      title="BGM ON/OFF"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 10002,
        background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
        border: "3px solid var(--window-border-outer)",
        borderRadius: 12,
        padding: "8px 14px",
        color: "var(--gold)",
        fontFamily: "var(--font-dot-gothic), monospace",
        fontSize: "0.75rem",
        cursor: "pointer",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.3), 0 2px 10px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span style={{ fontSize: "1rem" }}>{soundEnabled ? "🔊" : "🔇"}</span>
      <span>{soundEnabled ? "おと ON" : "おと OFF"}</span>
    </div>
  );
}
