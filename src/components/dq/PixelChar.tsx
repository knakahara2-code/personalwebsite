"use client";

import { useEffect, useRef } from "react";

export function PixelChar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const _ = "transparent";
    const K = "#1a1028";
    const S = "#f0c8a0";
    const H = "#483018";
    const W = "#f8f8f0";
    const T = "#c83838";
    const P = "#385890";
    const B = "#d0a030";
    const G = "#40a848";
    const R = "#e04040";
    const D = "#684830";
    const Y = "#f8d830";

    const pixels = [
      [_, _, _, _, _, B, B, B, B, B, B, _, _, _, _, _],
      [_, _, _, B, B, Y, Y, Y, Y, Y, Y, B, B, _, _, _],
      [_, _, B, B, B, B, B, B, B, B, B, B, B, B, _, _],
      [_, _, _, K, H, H, H, H, H, H, H, H, K, _, _, _],
      [_, _, _, H, S, S, S, S, S, S, S, S, H, _, _, _],
      [_, _, K, S, K, S, S, S, S, K, S, S, S, K, _, _],
      [_, _, _, S, S, S, S, K, S, S, S, S, S, _, _, _],
      [_, _, _, K, S, S, S, S, S, S, S, S, K, _, _, _],
      [_, _, _, W, W, W, T, T, W, W, W, W, _, _, _, _],
      [_, _, W, W, W, W, T, T, W, W, W, W, W, _, _, _],
      [_, G, G, W, W, W, W, W, W, W, W, W, W, _, _, _],
      [_, G, R, G, W, W, W, W, W, W, W, _, W, _, _, _],
      [_, G, G, G, _, W, W, W, W, W, _, _, _, _, _, _],
      [_, _, _, _, _, P, P, P, P, P, P, _, _, _, _, _],
      [_, _, _, _, _, P, P, _, P, P, P, _, _, _, _, _],
      [_, _, _, _, D, D, D, _, D, D, D, _, _, _, _, _],
    ];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (pixels[y][x] !== _) {
          ctx.fillStyle = pixels[y][x];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={16}
      height={16}
      style={{
        width: 128,
        height: 128,
        imageRendering: "pixelated",
        border: "3px solid var(--window-border-outer)",
        borderRadius: 8,
        background: "#181848",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
      }}
    />
  );
}
