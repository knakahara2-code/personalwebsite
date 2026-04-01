"use client";

import { useState, useEffect, useCallback } from "react";

const NAV_ITEMS = [
  { id: "sec-profile", label: "プロフィール", icon: "👤" },
  { id: "sec-timeline", label: "ぼうけんのしょ", icon: "📜" },
  { id: "sec-quests", label: "クエスト", icon: "🐉" },
  { id: "sec-skills", label: "じゅもん", icon: "✨" },
  { id: "sec-voices", label: "なかまのこえ", icon: "💬" },
  { id: "sec-log", label: "クエストログ", icon: "📋" },
  { id: "sec-video", label: "ムービー", icon: "🎬" },
  { id: "sec-contact", label: "さくせん", icon: "⚔️" },
];

export function FloatingNav({
  visible,
  onHover,
  onClick,
}: {
  visible: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  const [activeId, setActiveId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Track which section is in view
  useEffect(() => {
    if (!visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [visible]);

  // Show nav after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = useCallback(
    (id: string) => {
      onClick();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // Close menu on mobile after click
      setTimeout(() => setIsOpen(false), 400);
    },
    [onClick]
  );

  if (!visible || !hasScrolled) return null;

  return (
    <>
      {/* Mobile: floating toggle button */}
      <button
        onClick={() => {
          onClick();
          setIsOpen((p) => !p);
        }}
        onMouseEnter={onHover}
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 1000,
          width: 44,
          height: 44,
          background: isOpen
            ? "linear-gradient(180deg, #e84848, #c02020)"
            : "linear-gradient(180deg, #1a1a6c, #10104a)",
          border: "2px solid var(--window-border-outer)",
          borderRadius: 8,
          color: "var(--gold)",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
          transition: "all 0.3s ease",
          fontFamily: "var(--font-dot-gothic), monospace",
        }}
        aria-label="メニュー"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Navigation panel */}
      <nav
        style={{
          position: "fixed",
          top: 64,
          right: 12,
          zIndex: 999,
          background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
          border: "3px solid var(--window-border-outer)",
          borderRadius: 12,
          padding: "8px 4px",
          boxShadow:
            "inset 0 0 15px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.7)",
          transform: isOpen ? "translateX(0) scale(1)" : "translateX(120%) scale(0.8)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.3s ease, opacity 0.2s ease",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Inner border decoration */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            right: 4,
            bottom: 4,
            border: "2px solid var(--window-border-inner)",
            borderRadius: 8,
            pointerEvents: "none",
          }}
        />

        {/* Title */}
        <div
          style={{
            textAlign: "center",
            fontSize: "0.65rem",
            color: "var(--gold)",
            padding: "4px 12px 8px",
            textShadow: "0 0 8px rgba(248,216,48,0.3)",
            letterSpacing: 2,
          }}
        >
          ▶ さくせん
        </div>

        {/* Menu items */}
        {NAV_ITEMS.map((item, i) => {
          const isActive = activeId === item.id;
          const isHovered = hoveredIdx === i;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              onMouseEnter={() => {
                setHoveredIdx(i);
                onHover();
              }}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "6px 14px",
                background: isActive
                  ? "rgba(248,216,48,0.12)"
                  : isHovered
                  ? "rgba(248,216,48,0.06)"
                  : "transparent",
                border: "none",
                borderRadius: 4,
                color: isActive ? "var(--gold)" : "var(--text-dim)",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontFamily: "var(--font-dot-gothic), monospace",
                textAlign: "left",
                transition: "all 0.15s ease",
                position: "relative",
              }}
            >
              {/* DQ cursor indicator */}
              <span
                style={{
                  fontSize: "0.6rem",
                  width: 14,
                  color: isActive ? "var(--gold)" : "transparent",
                  transition: "color 0.15s",
                }}
              >
                ▶
              </span>
              <span style={{ fontSize: "0.85rem" }}>{item.icon}</span>
              <span
                style={{
                  whiteSpace: "nowrap",
                  textShadow: isActive
                    ? "0 0 6px rgba(248,216,48,0.3)"
                    : "none",
                }}
              >
                {item.label}
              </span>
              {/* Active glow bar */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 4,
                    top: "25%",
                    bottom: "25%",
                    width: 2,
                    background: "var(--gold)",
                    borderRadius: 1,
                    boxShadow: "0 0 6px rgba(248,216,48,0.5)",
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Scroll progress bar */}
        <ScrollProgress />
      </nav>
    </>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) {
        setProgress(Math.min(window.scrollY / scrollable, 1));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pct = Math.round(progress * 100);
  // HP bar color: green → yellow → red as you scroll
  const barColor =
    pct < 40
      ? "linear-gradient(90deg, #48f868, #20c838)"
      : pct < 75
      ? "linear-gradient(90deg, #ffd040, #d8a020)"
      : "linear-gradient(90deg, #ff6060, #d03030)";

  return (
    <div style={{ padding: "8px 14px 6px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.55rem",
          color: "var(--text-dim)",
          marginBottom: 3,
        }}
      >
        <span>ぼうけんしんちょく</span>
        <span>{pct}%</span>
      </div>
      <div
        style={{
          height: 8,
          background: "rgba(0,0,0,0.5)",
          borderRadius: 3,
          border: "1px solid var(--window-border-inner)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            borderRadius: 2,
            transition: "width 0.3s ease",
            boxShadow:
              pct > 75
                ? "0 0 6px rgba(208,48,48,0.4)"
                : "0 0 4px rgba(32,200,56,0.3)",
          }}
        />
      </div>
    </div>
  );
}
