"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const RANGERS = [
  { name: "ヤマ", color: "#e04040", img: "/roku_red.png", desc: "やまが（山鹿）がモチーフ。" },
  { name: "キク", color: "#333", img: "/roku_black.png", desc: "きくか（菊鹿）がモチーフ。" },
  { name: "ホク", color: "#e8e8e8", img: "/roku_white.png", desc: "かほく（鹿北）がモチーフ。" },
  { name: "モト", color: "#3080d0", img: "/roku_blue.png", desc: "かもと（鹿本）がモチーフ。" },
  { name: "チカ", color: "#60c868", img: "/roku_green.png", desc: "かおう（鹿央）がモチーフ。" },
];

type Phase = "idle" | "flash" | "encounter" | "reveal";

// Battle encounter music using Web Audio API
function playEncounterSFX(ctx: AudioContext) {
  const playNote = (freq: number, dur: number, start: number, type: OscillatorType = "square", vol = 0.06) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur);
  };

  const t = ctx.currentTime;
  // DQ-style encounter alert: rapid descending then ascending
  const encounterNotes: [number, number, number][] = [
    [880, 0.08, 0], [830, 0.08, 0.08], [784, 0.08, 0.16], [740, 0.08, 0.24],
    [698, 0.08, 0.32], [660, 0.08, 0.4], [622, 0.08, 0.48], [587, 0.12, 0.56],
    // Dramatic pause then hit
    [220, 0.3, 0.9], [440, 0.15, 0.9], [880, 0.5, 1.05],
  ];
  encounterNotes.forEach(([freq, dur, offset]) => {
    playNote(freq, dur, t + offset, "square", 0.07);
  });
}

function playBattleBGM(ctx: AudioContext): { stop: () => void } {
  let playing = true;
  const activeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  const playNote = (freq: number, dur: number, start: number, type: OscillatorType = "square", vol = 0.04) => {
    if (!playing) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur);
    activeNodes.push({ osc, gain });
    osc.onended = () => {
      const idx = activeNodes.findIndex((n) => n.osc === osc);
      if (idx >= 0) activeNodes.splice(idx, 1);
    };
  };

  // DQ battle theme style melody - heroic and urgent
  const melody = [
    440, 440, 523, 587, 659, 659, 587, 523,
    587, 659, 784, 880, 784, 659, 587, 659,
    880, 880, 784, 659, 784, 880, 1047, 880,
    784, 659, 587, 523, 587, 659, 523, 440,
    523, 587, 659, 784, 880, 784, 659, 784,
    1047, 988, 880, 784, 880, 784, 659, 587,
  ];

  const bass = [
    220, 220, 262, 262, 330, 330, 262, 262,
    294, 294, 330, 330, 392, 392, 294, 294,
    440, 440, 392, 392, 330, 330, 440, 440,
    392, 392, 294, 294, 262, 262, 220, 220,
    262, 262, 330, 330, 440, 440, 330, 330,
    523, 523, 440, 440, 392, 392, 330, 330,
  ];

  const noteDur = 0.18;
  const totalDur = melody.length * noteDur;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function scheduleLoop() {
    if (!playing) return;
    const startTime = ctx.currentTime + 0.05;
    for (let i = 0; i < melody.length; i++) {
      const t = startTime + i * noteDur;
      playNote(melody[i], noteDur * 0.8, t, "square", 0.035);
      playNote(bass[i % bass.length], noteDur * 0.85, t, "triangle", 0.03);
      // Accent every 4th note
      if (i % 4 === 0) {
        playNote(melody[i] * 2, noteDur * 0.2, t, "sine", 0.015);
      }
      // Percussion feel on every 2nd note
      if (i % 2 === 0) {
        const noise = ctx.createOscillator();
        const nGain = ctx.createGain();
        noise.type = "sawtooth";
        noise.frequency.value = 80;
        nGain.gain.setValueAtTime(0.02, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        noise.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.05);
        activeNodes.push({ osc: noise, gain: nGain });
      }
    }
    timeoutId = setTimeout(scheduleLoop, totalDur * 1000 - 100);
  }

  scheduleLoop();

  return {
    stop: () => {
      playing = false;
      if (timeoutId) clearTimeout(timeoutId);
      activeNodes.forEach(({ osc, gain }) => {
        try {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          osc.stop(ctx.currentTime + 0.01);
        } catch { /* already stopped */ }
      });
      activeNodes.length = 0;
    },
  };
}

export function RokuRangerSecret({
  onTrigger,
  soundEnabled,
  onStopMainBGM,
  onStartMainBGM,
  onSuppressBGM,
  onUnsuppressBGM,
}: {
  onTrigger: () => void;
  soundEnabled: boolean;
  onStopMainBGM: () => void;
  onStartMainBGM: () => void;
  onSuppressBGM: () => void;
  onUnsuppressBGM: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [showIdx, setShowIdx] = useState(-1);
  const [flashCount, setFlashCount] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmRef = useRef<{ stop: () => void } | null>(null);
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const trigger = useCallback(() => {
    if (phase !== "idle") return;
    onTrigger();
    // Suppress main BGM and stop it before playing encounter sounds
    onSuppressBGM();
    onStopMainBGM();

    if (soundRef.current) {
      const ctx = getAudioCtx();
      playEncounterSFX(ctx);
    }

    setPhase("flash");
    setFlashCount(0);

    // Multiple flashes like DQ encounter
    let count = 0;
    const flashInterval = setInterval(() => {
      count++;
      setFlashCount(count);
      if (count >= 6) {
        clearInterval(flashInterval);
        setPhase("encounter");
        // Start battle BGM only if sound is on
        if (soundRef.current) {
          const ctx = getAudioCtx();
          bgmRef.current = playBattleBGM(ctx);
        }
      }
    }, 120);

    // Show characters after encounter text
    setTimeout(() => {
      setPhase("reveal");
      setShowIdx(0);
    }, 3200);
  }, [phase, onTrigger, onSuppressBGM, onStopMainBGM, getAudioCtx]);

  // Reveal characters one by one
  useEffect(() => {
    if (phase !== "reveal" || showIdx < 0) return;
    if (showIdx < RANGERS.length - 1) {
      const timer = setTimeout(() => setShowIdx((i) => i + 1), 400);
      return () => clearTimeout(timer);
    }
  }, [phase, showIdx]);

  // React to sound toggle while Roku Ranger is active
  useEffect(() => {
    if (phase === "idle") return;

    if (!soundEnabled) {
      // Sound turned OFF: stop battle BGM
      if (bgmRef.current) {
        bgmRef.current.stop();
        bgmRef.current = null;
      }
    } else {
      // Sound turned ON: start battle BGM (if in encounter/reveal phase and not already playing)
      if ((phase === "encounter" || phase === "reveal") && !bgmRef.current) {
        const ctx = getAudioCtx();
        bgmRef.current = playBattleBGM(ctx);
      }
    }
  }, [soundEnabled, phase, getAudioCtx]);

  const handleClose = () => {
    if (bgmRef.current) {
      bgmRef.current.stop();
      bgmRef.current = null;
    }
    setPhase("idle");
    setShowIdx(-1);
    setFlashCount(0);
    // Unsuppress and resume main BGM if sound is on
    onUnsuppressBGM();
    if (soundRef.current) {
      onStartMainBGM();
    }
  };

  return (
    <>
      {/* Flash overlay - multiple rapid flashes like DQ */}
      {phase === "flash" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: flashCount % 2 === 0 ? "#fff" : "#000",
            transition: "background 0.06s",
          }}
        />
      )}

      {/* Screen shake container */}
      {(phase === "encounter" || phase === "reveal") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "#000",
            overflow: "auto",
          }}
        >
          {/* Battle background - DQ grassland/encounter style */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 50% 100%, #1a0a2e 0%, #000 70%)",
              overflow: "hidden",
            }}
          >
            {/* Animated battle lines */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 3px,
                rgba(248,216,48,0.03) 3px,
                rgba(248,216,48,0.03) 4px
              )`,
              animation: "roku-scanlines 2s linear infinite",
            }} />
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              padding: "20px",
              animation: phase === "encounter" ? "roku-shake 0.3s ease-in-out" : undefined,
            }}
          >
            {phase === "encounter" && (
              <div style={{ textAlign: "center" }}>
                {/* DQ-style encounter box */}
                <div
                  style={{
                    background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
                    border: "4px solid var(--window-border-outer)",
                    borderRadius: 16,
                    padding: "32px 48px",
                    position: "relative",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.4), 0 0 40px rgba(248,216,48,0.1)",
                    animation: "roku-text-appear 0.6s ease-out",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 4, left: 4, right: 4, bottom: 4,
                    border: "2px solid var(--window-border-inner)", borderRadius: 12, pointerEvents: "none",
                  }} />
                  <div
                    style={{
                      fontSize: "1.4rem",
                      color: "var(--gold)",
                      fontFamily: "var(--font-dot-gothic), monospace",
                      textShadow: "0 0 20px rgba(248,216,48,0.6)",
                      lineHeight: 2,
                    }}
                  >
                    ロクレンジャー が あらわれた！
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      color: "var(--text-dim)",
                      fontSize: "0.7rem",
                      animation: "blink 1s step-end infinite",
                    }}
                  >
                    ▼
                  </div>
                </div>
              </div>
            )}

            {phase === "reveal" && (
              <div style={{ maxWidth: 800, width: "100%", textAlign: "center" }}>
                {/* Title with glow */}
                <div
                  style={{
                    fontSize: "1.6rem",
                    color: "var(--gold)",
                    fontFamily: "var(--font-dot-gothic), monospace",
                    textShadow: "0 0 20px rgba(248,216,48,0.5), 0 0 40px rgba(248,216,48,0.2)",
                    marginBottom: 8,
                    animation: "roku-title-glow 2s ease-in-out infinite alternate",
                  }}
                >
                  ロクレンジャー
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-dim)",
                    marginBottom: 28,
                    lineHeight: 1.8,
                  }}
                >
                  山鹿市は「鹿」の字がつく5つの自治体（山鹿・鹿北・菊鹿・鹿本・鹿央）が<br />
                  合併してできたまち。5匹だけど「ロク」レンジャー。<br />
                  それが だじゃれ の はじまり。<br /><br />
                  キャラのくわしいじょうほうはTikTokどうがのえほんをチェックしてね！
                </div>

                {/* Characters with battle formation */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    marginBottom: 32,
                  }}
                >
                  {RANGERS.map((r, i) => (
                    <div
                      key={r.name}
                      style={{
                        opacity: i <= showIdx ? 1 : 0,
                        transform: i <= showIdx ? "translateY(0) scale(1)" : "translateY(50px) scale(0.5)",
                        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        textAlign: "center",
                        width: 120,
                      }}
                    >
                      {/* Character with bounce animation */}
                      <div
                        style={{
                          width: 100,
                          height: 100,
                          margin: "0 auto 8px",
                          borderRadius: "50%",
                          border: `3px solid ${r.color}`,
                          overflow: "hidden",
                          background: "rgba(0,0,0,0.6)",
                          boxShadow: `0 0 20px ${r.color}50, inset 0 0 10px ${r.color}20`,
                          animation: i <= showIdx ? `roku-char-idle 2s ease-in-out ${i * 0.2}s infinite` : undefined,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.img}
                          alt={r.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          color: r.color === "#333" ? "#aaa" : r.color,
                          fontFamily: "var(--font-dot-gothic), monospace",
                          textShadow: `0 0 8px ${r.color}60`,
                        }}
                      >
                        {r.name}
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginTop: 2 }}>
                        {r.desc}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Battle menu style links */}
                <div
                  style={{
                    background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
                    border: "3px solid var(--window-border-outer)",
                    borderRadius: 12,
                    padding: "16px 24px",
                    display: "inline-block",
                    position: "relative",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 3, left: 3, right: 3, bottom: 3,
                    border: "2px solid var(--window-border-inner)", borderRadius: 9, pointerEvents: "none",
                  }} />
                  <div style={{ fontSize: "0.7rem", color: "var(--gold)", marginBottom: 12, textShadow: "0 0 6px rgba(248,216,48,0.3)" }}>
                    ▶ コマンド
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                    <a
                      href="https://store.line.me/stickershop/product/20041022/ja"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "8px 20px",
                        fontSize: "0.8rem",
                        color: "#fff",
                        background: "linear-gradient(180deg, #06c755, #05a847)",
                        border: "2px solid #08e060",
                        borderRadius: 8,
                        textDecoration: "none",
                        fontFamily: "var(--font-dot-gothic), monospace",
                        boxShadow: "0 2px 8px rgba(6,199,85,0.3)",
                      }}
                    >
                      LINE スタンプ
                    </a>
                    <a
                      href="https://www.tiktok.com/@yamagabase/video/7566415538218470674"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "8px 20px",
                        fontSize: "0.8rem",
                        color: "#fff",
                        background: "linear-gradient(180deg, #444, #222)",
                        border: "2px solid #666",
                        borderRadius: 8,
                        textDecoration: "none",
                        fontFamily: "var(--font-dot-gothic), monospace",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      }}
                    >
                      TikTok どうが
                    </a>
                    <button
                      onClick={handleClose}
                      style={{
                        padding: "8px 20px",
                        fontSize: "0.8rem",
                        color: "var(--gold)",
                        background: "rgba(248,216,48,0.08)",
                        border: "2px solid var(--gold-dark)",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontFamily: "var(--font-dot-gothic), monospace",
                      }}
                    >
                      にげる
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes roku-shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-8px) translateY(4px); }
          20% { transform: translateX(8px) translateY(-4px); }
          30% { transform: translateX(-6px) translateY(2px); }
          40% { transform: translateX(6px) translateY(-2px); }
          50% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          70% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        @keyframes roku-text-appear {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes roku-title-glow {
          0% { text-shadow: 0 0 20px rgba(248,216,48,0.5), 0 0 40px rgba(248,216,48,0.2); }
          100% { text-shadow: 0 0 30px rgba(248,216,48,0.8), 0 0 60px rgba(248,216,48,0.3); }
        }
        @keyframes roku-char-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes roku-scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
      `}</style>

      <TriggerExporter trigger={trigger} />
    </>
  );
}

// Expose trigger via a global ref so MainSite can call it
let globalTrigger: (() => void) | null = null;
export function getRokuTrigger() { return globalTrigger; }

function TriggerExporter({ trigger }: { trigger: () => void }) {
  useEffect(() => {
    globalTrigger = trigger;
    return () => { globalTrigger = null; };
  }, [trigger]);
  return null;
}
