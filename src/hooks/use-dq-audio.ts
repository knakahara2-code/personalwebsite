"use client";

import { useCallback, useRef, useState } from "react";

export function useDQAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  const bgmPlayingRef = useRef(false);
  const bgmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeNodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const playNote = useCallback(
    (freq: number, duration: number, startTime: number, type: OscillatorType = "square", vol = 0.08) => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
      const node = { osc, gain };
      activeNodesRef.current.push(node);
      osc.onended = () => {
        activeNodesRef.current = activeNodesRef.current.filter((n) => n !== node);
      };
    },
    []
  );

  const playTextTick = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = Math.random() > 0.5 ? 1400 : 1200;
    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }, []);

  const playFanfare = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes: [number, number][] = [
      [523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.3],
      [932, 0.15], [1047, 0.15], [1175, 0.15], [1397, 0.5],
      [1175, 0.12], [1047, 0.12], [1175, 0.12], [1397, 0.7],
    ];
    let offset = 0;
    notes.forEach(([freq, dur]) => {
      playNote(freq, dur, t + offset, "square", 0.06);
      playNote(freq * 0.5, dur, t + offset, "triangle", 0.04);
      offset += dur;
    });
  }, [playNote]);

  const playCursorSFX = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const t = ctx.currentTime;
    playNote(880, 0.06, t, "square", 0.05);
    playNote(1320, 0.08, t + 0.03, "square", 0.04);
  }, [playNote]);

  const playSelectSFX = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const t = ctx.currentTime;
    playNote(660, 0.06, t, "square", 0.05);
    playNote(880, 0.06, t + 0.06, "square", 0.05);
    playNote(1100, 0.1, t + 0.12, "square", 0.06);
  }, [playNote]);

  const playGameOverSFX = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const t = ctx.currentTime;
    playNote(440, 0.4, t, "square", 0.06);
    playNote(370, 0.4, t + 0.4, "square", 0.06);
    playNote(330, 0.4, t + 0.8, "square", 0.06);
    playNote(262, 0.8, t + 1.2, "square", 0.06);
  }, [playNote]);

  const startBGM = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || bgmPlayingRef.current) return;
    bgmPlayingRef.current = true;

    const melody = [
      523, 587, 659, 784, 659, 587, 523, 440,
      523, 587, 659, 784, 880, 784, 659, 784,
      880, 784, 659, 523, 587, 659, 523, 440,
      392, 440, 523, 587, 523, 440, 392, 440,
      523, 659, 784, 880, 784, 659, 784, 1047,
      880, 784, 659, 523, 587, 523, 440, 523,
    ];

    const bass = [
      262, 262, 330, 330, 349, 349, 262, 262,
      262, 262, 330, 330, 349, 349, 392, 392,
      440, 440, 330, 330, 294, 294, 262, 262,
      196, 196, 220, 220, 262, 262, 196, 196,
      262, 262, 330, 330, 349, 349, 392, 392,
      440, 440, 330, 330, 294, 294, 262, 262,
    ];

    const noteDuration = 0.25;
    const totalDuration = melody.length * noteDuration;

    function scheduleLoop() {
      if (!bgmPlayingRef.current || !ctx) return;
      const startTime = ctx.currentTime + 0.05;

      for (let i = 0; i < melody.length; i++) {
        const t = startTime + i * noteDuration;
        playNote(melody[i], noteDuration * 0.85, t, "square", 0.03);
        playNote(bass[i % bass.length], noteDuration * 0.9, t, "triangle", 0.025);
        if (i % 4 === 0) {
          playNote(melody[i] * 1.5, noteDuration * 0.3, t, "sine", 0.015);
        }
      }
      bgmTimeoutRef.current = setTimeout(scheduleLoop, totalDuration * 1000 - 100);
    }

    scheduleLoop();
  }, [playNote]);

  const stopBGM = useCallback(() => {
    bgmPlayingRef.current = false;
    if (bgmTimeoutRef.current) {
      clearTimeout(bgmTimeoutRef.current);
      bgmTimeoutRef.current = null;
    }
    // Immediately silence all scheduled oscillators
    const ctx = audioCtxRef.current;
    if (ctx) {
      activeNodesRef.current.forEach(({ osc, gain }) => {
        try {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          osc.stop(ctx.currentTime + 0.01);
        } catch {
          // Already stopped
        }
      });
      activeNodesRef.current = [];
    }
  }, []);

  const initAudio = useCallback(() => {
    getCtx();
    setSoundEnabled(true);
    soundEnabledRef.current = true;
  }, [getCtx]);

  const toggleSound = useCallback(() => {
    if (!audioCtxRef.current) {
      initAudio();
      return;
    }
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEnabledRef.current = next;
      if (next) {
        startBGM();
      } else {
        stopBGM();
      }
      return next;
    });
  }, [initAudio, startBGM, stopBGM]);

  return {
    soundEnabled,
    initAudio,
    toggleSound,
    playTextTick,
    playFanfare,
    playCursorSFX,
    playSelectSFX,
    playGameOverSFX,
    startBGM,
    stopBGM,
  };
}
