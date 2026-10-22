"use client";

import { useState } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
// Text that could still become a valid hex color as the user keeps typing.
const PARTIAL_HEX_PATTERN = /^#?[0-9a-f]{0,6}$/i;

// Normalizes "#abc", "abc", "#AABBCC" etc. to lowercase "#aabbcc", or null if invalid.
function normalizeHex(value: string): string | null {
  const match = HEX_PATTERN.exec(value.trim());
  if (!match) return null;
  let digits = match[1].toLowerCase();
  if (digits.length === 3) {
    digits = digits
      .split("")
      .map((d) => d + d)
      .join("");
  }
  return `#${digits}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return [Math.round(h) % 360, Math.round(s * 100), Math.round(l * 100)];
}

export default function ColorConverter() {
  const [hex, setHex] = useState("#3b82f6");
  const [hexText, setHexText] = useState("#3b82f6");

  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  // Flag only text that can never become a hex color, not a half-typed value.
  const hexTextValid = PARTIAL_HEX_PATTERN.test(hexText.trim());

  function handlePicker(value: string) {
    const normalized = normalizeHex(value);
    if (!normalized) return;
    setHex(normalized);
    setHexText(normalized);
  }

  // Apply live only once a full 6-digit value is typed, so a 3-digit prefix of
  // a longer value (e.g. "#1e4" on the way to "#1e40af") doesn't flash a wrong color.
  function handleHexText(value: string) {
    setHexText(value);
    if (value.trim().replace(/^#/, "").length === 6) {
      const normalized = normalizeHex(value);
      if (normalized) setHex(normalized);
    }
  }

  // On blur, accept 3-digit shorthand too; otherwise revert to the current color.
  function handleHexBlur() {
    const normalized = normalizeHex(hexText);
    if (normalized) setHex(normalized);
    setHexText(normalized ?? hex);
  }

  return (
    <ToolCard
      title="Color Converter"
      description="Pick a color; shows HEX, RGB and HSL values with a swatch preview."
    >
      <div className="grid grid-cols-[auto_1fr] items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Picker
          <input
            type="color"
            value={hex}
            onChange={(e) => handlePicker(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-lg border border-black/10 bg-transparent p-1 dark:border-white/15"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Hex
          <input
            type="text"
            value={hexText}
            onChange={(e) => handleHexText(e.target.value)}
            onBlur={handleHexBlur}
            spellCheck={false}
            aria-invalid={!hexTextValid}
            className={`${inputClass} font-mono ${hexTextValid ? "" : "border-red-500 dark:border-red-500"}`}
          />
        </label>
      </div>
      <div
        aria-label={`Swatch preview of ${hex}`}
        role="img"
        className="h-16 w-full rounded-lg border border-black/10 dark:border-white/15"
        style={{ backgroundColor: hex }}
      />
      <dl className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">HEX</dt>
          <dd className="font-mono text-sm font-semibold">{hex}</dd>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">RGB</dt>
          <dd className="font-mono text-sm font-semibold">{`rgb(${r}, ${g}, ${b})`}</dd>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">HSL</dt>
          <dd className="font-mono text-sm font-semibold">{`hsl(${h}, ${s}%, ${l}%)`}</dd>
        </div>
      </dl>
    </ToolCard>
  );
}
