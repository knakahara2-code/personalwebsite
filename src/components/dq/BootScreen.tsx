"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const bootLines = [
  "", "",
  "むかし この まちには",
  "がっこうが あり  はたけが あり",
  "ひとびとの わらいごえが あった。",
  "",
  "やがて まちは しずかになり",
  "がっこうは とびらを とじ",
  "はたけには つくりてが いなくなった。",
  "", "",
  "...でも ものがたりは おわらなかった。",
  "", "",
  "がっこうは ふたたび ひとが あつまる ばしょになり",
  "はたけには また いのちが めぶいた。",
  "",
  "あたらしい ちえと あたらしい なかまが",
  "この ちいさな まちから うまれはじめた。",
  "", "",
  "これは このまちにすむ",
  "なかはら かつもと の ぼうけんの きろく。",
  "",
  "そして こいつの ぼうけんと",
  "あなたの ぼうけんが まじわるかもしれない。",
];

type ChoicePhase =
  | "typing"
  | "first"
  | "sure1"
  | "round2"
  | "sure2"
  | "final"
  | "gameover"
  | "done";

export function BootScreen({
  onEnter,
  playTextTick,
  playFanfare,
  playCursorSFX,
  playGameOverSFX,
  initAudio,
}: {
  onEnter: () => void;
  playTextTick: () => void;
  playFanfare: () => void;
  playCursorSFX: () => void;
  playGameOverSFX: () => void;
  initAudio: () => void;
}) {
  const [phase, setPhase] = useState<ChoicePhase>("typing");
  const [displayText, setDisplayText] = useState("");
  const [audioInited, setAudioInited] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [round2Message, setRound2Message] = useState("");
  const lineIdx = useRef(0);
  const charIdx = useRef(0);
  const textRef = useRef("");
  const skippedRef = useRef(false);

  const doEnter = useCallback(() => {
    initAudio();
    // Delay fanfare slightly so AudioContext has time to unlock on mobile
    setTimeout(() => playFanfare(), 100);
    setTimeout(() => {
      setHidden(true);
      setTimeout(onEnter, 500);
    }, 600);
  }, [initAudio, playFanfare, onEnter]);

  const skipToChoice = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    lineIdx.current = bootLines.length;
    textRef.current = bootLines.join("\n") + "\n";
    setDisplayText(textRef.current);
    setPhase("first");
  }, []);

  // Typing effect
  useEffect(() => {
    if (phase !== "typing") return;
    let timer: ReturnType<typeof setTimeout>;

    function type() {
      if (skippedRef.current) return;
      if (lineIdx.current >= bootLines.length) {
        setTimeout(() => setPhase("first"), 800);
        return;
      }
      const line = bootLines[lineIdx.current];
      if (charIdx.current < line.length) {
        const ch = line[charIdx.current];
        textRef.current += ch;
        setDisplayText(textRef.current);
        if (ch !== " " && ch !== "\u3000" && audioInited) playTextTick();
        charIdx.current++;
        timer = setTimeout(type, 40 + Math.random() * 20);
      } else {
        textRef.current += "\n";
        lineIdx.current++;
        charIdx.current = 0;
        const isBlank = bootLines[lineIdx.current - 1] === "";
        timer = setTimeout(type, isBlank ? 500 + Math.random() * 300 : 250 + Math.random() * 200);
      }
    }

    timer = setTimeout(type, 1000);
    return () => clearTimeout(timer);
  }, [phase, audioInited, playTextTick]);

  const handleScreenClick = () => {
    if (phase === "typing") {
      if (!audioInited) {
        initAudio();
        setAudioInited(true);
      } else {
        skipToChoice();
      }
    }
  };

  if (hidden) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          opacity: 0,
          transition: "opacity 1s ease",
          pointerEvents: "none",
        }}
      />
    );
  }

  // Game Over
  if (phase === "gameover") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          zIndex: 10001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-dot-gothic), monospace",
            color: "#c83838",
            fontSize: "2.5rem",
            textShadow: "0 0 20px rgba(200,56,56,0.6)",
            animation: "gameover-pulse 2s ease-in-out infinite",
          }}
        >
          GAME OVER
        </div>
        <div
          style={{
            fontFamily: "var(--font-dot-gothic), monospace",
            color: "#a0a0c0",
            fontSize: "0.85rem",
            marginTop: 20,
          }}
        >
          ぼうけんのしょは きえてしまった...
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleScreenClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        cursor: "pointer",
        overflowY: "auto",
        padding: "40px 0",
      }}
    >
      {/* Boot text */}
      <div
        style={{
          fontFamily: "var(--font-dot-gothic), monospace",
          color: "var(--text)",
          fontSize: "1.1rem",
          textAlign: "left",
          maxWidth: 600,
          padding: 20,
          textShadow: "0 0 8px rgba(248,216,48,0.3)",
        }}
      >
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
          {displayText}
          {phase === "typing" && <span className="blink">█</span>}
        </pre>
      </div>

      {/* Question text */}
      {phase === "sure1" && (
        <div style={{ fontFamily: "var(--font-dot-gothic), monospace", color: "#f8f8f8", fontSize: "1.1rem", maxWidth: 600, padding: "0 20px", marginBottom: 8, textShadow: "0 0 8px rgba(248,216,48,0.3)" }}>
          ほんとうに いいんじゃな？
        </div>
      )}
      {phase === "round2" && (
        <div style={{ fontFamily: "var(--font-dot-gothic), monospace", color: "#f8f8f8", fontSize: "1.1rem", maxWidth: 600, padding: "0 20px", marginBottom: 8, textShadow: "0 0 8px rgba(248,216,48,0.3)" }}>
          {round2Message}
        </div>
      )}
      {phase === "sure2" && (
        <div style={{ fontFamily: "var(--font-dot-gothic), monospace", color: "#f8f8f8", fontSize: "1.1rem", maxWidth: 600, padding: "0 20px", marginBottom: 8, textShadow: "0 0 8px rgba(248,216,48,0.3)" }}>
          ほんとうに マジで いいんじゃな？
        </div>
      )}
      {phase === "final" && (
        <div style={{ fontFamily: "var(--font-dot-gothic), monospace", color: "#f8f8f8", fontSize: "1.1rem", maxWidth: 600, padding: "0 20px", marginBottom: 8, textShadow: "0 0 8px rgba(248,216,48,0.3)" }}>
          よかった。さあ、いくぞ！
        </div>
      )}

      {/* Choice menus */}
      {phase === "first" && (
        <ChoiceWindow
          choices={[
            { label: "ぼうけんを はじめる", action: doEnter },
            { label: "ぼうけんを はじめない", action: () => setPhase("sure1") },
          ]}
          playCursorSFX={playCursorSFX}
          audioInited={audioInited}
        />
      )}
      {phase === "sure1" && (
        <ChoiceWindow
          choices={[
            { label: "はい", action: () => { setRound2Message("マジで いいんじゃな？"); setPhase("round2"); } },
            { label: "いいえ", action: () => { setRound2Message("なんだ、ぼうけん するんじゃな？"); setPhase("round2"); } },
          ]}
          playCursorSFX={playCursorSFX}
          audioInited={audioInited}
        />
      )}
      {phase === "round2" && (
        <ChoiceWindow
          choices={[
            { label: "ぼうけんを はじめる", action: doEnter },
            { label: "ぼうけんを はじめない", action: () => setPhase("sure2") },
          ]}
          playCursorSFX={playCursorSFX}
          audioInited={audioInited}
        />
      )}
      {phase === "sure2" && (
        <ChoiceWindow
          choices={[
            { label: "はい", action: () => { initAudio(); playGameOverSFX(); setTimeout(() => setPhase("gameover"), 100); } },
            { label: "いいえ", action: () => setPhase("final") },
          ]}
          playCursorSFX={playCursorSFX}
          audioInited={audioInited}
        />
      )}
      {phase === "final" && (
        <ChoiceWindow
          choices={[{ label: "▶ ぼうけんを はじめる", action: doEnter }]}
          playCursorSFX={playCursorSFX}
          audioInited={audioInited}
        />
      )}

      {/* Skip hint */}
      {phase === "typing" && (
        <div style={{ fontFamily: "var(--font-dot-gothic), monospace", color: "var(--gold-dark)", fontSize: "0.7rem", marginTop: 20 }}>
          {audioInited ? "▼ もういちどクリックでスキップ" : "▼ がめんをクリックで おとがなるよ"}
        </div>
      )}
    </div>
  );
}

function ChoiceWindow({
  choices,
  playCursorSFX,
  audioInited,
}: {
  choices: { label: string; action: () => void }[];
  playCursorSFX: () => void;
  audioInited: boolean;
}) {
  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
          border: "4px solid #f8f0d0",
          borderRadius: 14,
          padding: "16px 28px",
          position: "relative",
          boxShadow: "inset 0 0 16px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.6)",
          minWidth: 280,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 4, left: 4, right: 4, bottom: 4,
            border: "2px solid #a89860",
            borderRadius: 10,
            pointerEvents: "none",
          }}
        />
        {choices.map((c) => (
          <div
            key={c.label}
            onClick={(e) => { e.stopPropagation(); if (audioInited) playCursorSFX(); c.action(); }}
            onMouseEnter={() => { if (audioInited) playCursorSFX(); }}
            style={{
              padding: "8px 12px 8px 28px",
              color: "#f8f8f8",
              fontSize: "1rem",
              cursor: "pointer",
              position: "relative",
              userSelect: "none",
              fontFamily: "var(--font-dot-gothic), monospace",
            }}
            onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.color = "#f8d830"; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.color = "#f8f8f8"; }}
          >
            <span style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", fontSize: "0.6rem" }}>▶</span>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
