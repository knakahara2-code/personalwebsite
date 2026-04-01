"use client";

import { useEffect, useRef } from "react";

function getColorForValue(pct: number): { bg: string; shadow: string } {
  // High (>=70) → green, Mid (40-69) → yellow, Low (<40) → red
  if (pct >= 70) {
    return {
      bg: "linear-gradient(180deg, #48f868, #20c838)",
      shadow: "0 0 6px rgba(32,200,56,0.4)",
    };
  }
  if (pct >= 40) {
    return {
      bg: "linear-gradient(180deg, #ffd040, #d8a020)",
      shadow: "0 0 6px rgba(248,208,48,0.4)",
    };
  }
  return {
    bg: "linear-gradient(180deg, #ff6060, #d03030)",
    shadow: "0 0 6px rgba(208,48,48,0.4)",
  };
}

export function StatBar({
  label,
  value,
  max,
  animated,
}: {
  label: string;
  value: number;
  max: number;
  animated: boolean;
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const pct = (value / max) * 100;

  useEffect(() => {
    if (animated && fillRef.current) {
      setTimeout(() => {
        if (fillRef.current) fillRef.current.style.width = `${pct}%`;
      }, 200);
    }
  }, [animated, pct]);

  const colors = getColorForValue(pct);

  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 8, fontSize: "0.8rem" }}>
      <span style={{ width: 85, color: "var(--text)" }}>{label}</span>
      <div
        style={{
          flex: 1,
          height: 16,
          background: "rgba(0,0,0,0.5)",
          overflow: "hidden",
          position: "relative",
          border: "2px solid var(--window-border-inner)",
          borderRadius: 3,
        }}
      >
        <div
          ref={fillRef}
          style={{
            height: "100%",
            width: animated ? 0 : `${pct}%`,
            background: colors.bg,
            boxShadow: colors.shadow,
            transition: "width 1.5s ease",
            borderRadius: 1,
          }}
        >
          <span
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.6rem",
              color: "var(--text)",
              textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
            }}
          >
            {value}/{max}
          </span>
        </div>
      </div>
    </div>
  );
}
