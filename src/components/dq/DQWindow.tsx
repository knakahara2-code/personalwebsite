import type { ReactNode } from "react";

export function DQWindow({
  title,
  children,
  className = "",
  gold = false,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  gold?: boolean;
}) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
        border: `4px solid ${gold ? "var(--gold)" : "var(--window-border-outer)"}`,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        position: "relative",
        boxShadow: `inset 0 0 20px rgba(0,0,0,0.4), 0 4px 20px var(--window-shadow)${gold ? ", 0 0 30px rgba(248,216,48,0.1)" : ""}`,
      }}
    >
      <div
        style={{
          content: '""',
          position: "absolute",
          top: 4,
          left: 4,
          right: 4,
          bottom: 4,
          border: `2px solid ${gold ? "var(--gold-dark)" : "var(--window-border-inner)"}`,
          borderRadius: 12,
          pointerEvents: "none",
        }}
      />
      {title && (
        <div
          style={{
            color: "var(--gold)",
            fontSize: "1rem",
            letterSpacing: 3,
            marginBottom: 16,
            paddingBottom: 8,
            borderBottom: "2px solid rgba(248,216,48,0.25)",
            textShadow: "0 0 8px rgba(248,216,48,0.4)",
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function DQMessage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
        border: "4px solid var(--window-border-outer)",
        borderRadius: 16,
        padding: "16px 24px",
        marginBottom: 24,
        textAlign: "center",
        fontSize: "0.85rem",
        color: "var(--text)",
        position: "relative",
        boxShadow: "inset 0 0 16px rgba(0,0,0,0.3), 0 4px 16px var(--window-shadow)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          right: 4,
          bottom: 4,
          border: "2px solid var(--window-border-inner)",
          borderRadius: 12,
          pointerEvents: "none",
        }}
      />
      {children}
      <span
        style={{
          display: "inline-block",
          marginLeft: 4,
          color: "var(--gold)",
          animation: "cursor-bounce 0.8s step-start infinite",
        }}
      >
        ▼
      </span>
    </div>
  );
}
