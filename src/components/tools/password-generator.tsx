"use client";

import { useEffect, useRef, useState } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

const MIN_LENGTH = 4;
const MAX_LENGTH = 64;
const DEFAULT_LENGTH = 16;

const CHAR_SETS = {
  lowercase: { label: "Lowercase (a-z)", chars: "abcdefghijklmnopqrstuvwxyz" },
  uppercase: { label: "Uppercase (A-Z)", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  digits: { label: "Digits (0-9)", chars: "0123456789" },
  symbols: { label: "Symbols (!@#…)", chars: "!@#$%^&*()-_=+[]{};:,.<>?/~" },
} as const;

type SetKey = keyof typeof CHAR_SETS;
const SET_KEYS = Object.keys(CHAR_SETS) as SetKey[];

function clampLength(value: string): number {
  if (value.trim() === "") return DEFAULT_LENGTH;
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_LENGTH;
  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, n));
}

// Uniform integer in [0, n) using rejection sampling to avoid modulo bias.
function randomInt(n: number): number {
  const range = 2 ** 32;
  const limit = range - (range % n);
  const buf = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % n;
}

function pick(chars: string): string {
  return chars[randomInt(chars.length)];
}

function generatePassword(length: number, sets: SetKey[]): string {
  const pool = sets.map((key) => CHAR_SETS[key].chars).join("");
  // One guaranteed character from each selected set, the rest from the full pool.
  const result = sets.map((key) => pick(CHAR_SETS[key].chars));
  while (result.length < length) result.push(pick(pool));
  // Fisher-Yates shuffle so the guaranteed characters are not always first.
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.join("");
}

type CopyState = "idle" | "copied" | "failed";

export default function PasswordGenerator() {
  const [length, setLength] = useState(String(DEFAULT_LENGTH));
  const [selected, setSelected] = useState<Record<SetKey, boolean>>({
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped whenever the shown password changes, so a slow clipboard write
  // can tell whether its result still applies.
  const generation = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const activeSets = SET_KEYS.filter((key) => selected[key]);
  const canGenerate = activeSets.length > 0;

  function showPassword(next: string) {
    generation.current += 1;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setPassword(next);
    setCopyState("idle");
  }

  // Options changed: drop the old password so Copy can't grab one that
  // no longer matches the settings.
  function invalidate() {
    if (password) showPassword("");
  }

  function generate() {
    if (!canGenerate) return;
    const n = clampLength(length);
    setLength(String(n));
    showPassword(generatePassword(n, activeSets));
  }

  async function copy() {
    if (!password) return;
    const gen = generation.current;
    let ok = true;
    try {
      await navigator.clipboard.writeText(password);
    } catch {
      ok = false;
    }
    if (!mounted.current || gen !== generation.current) return;
    setCopyState(ok ? "copied" : "failed");
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState("idle"), ok ? 1500 : 2500);
  }

  return (
    <ToolCard
      title="Password Generator"
      description="Generate a random password with length and character-set options, plus a copy button."
    >
      <label className="flex flex-col gap-1 text-sm">
        Length ({MIN_LENGTH}–{MAX_LENGTH})
        <input
          type="number"
          min={MIN_LENGTH}
          max={MAX_LENGTH}
          step="1"
          value={length}
          onChange={(e) => {
            setLength(e.target.value);
            invalidate();
          }}
          onBlur={() => setLength(String(clampLength(length)))}
          className={inputClass}
        />
      </label>

      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="sr-only">Character sets</legend>
        {SET_KEYS.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected[key]}
              onChange={(e) => {
                const checked = e.target.checked;
                setSelected((prev) => ({ ...prev, [key]: checked }));
                invalidate();
              }}
            />
            {CHAR_SETS[key].label}
          </label>
        ))}
      </fieldset>

      <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Password</p>
        <p className="min-h-7 break-all font-mono text-lg font-semibold" aria-live="polite">
          {password || <span className="font-normal text-zinc-500">Press Generate</span>}
        </p>
      </div>

      {!canGenerate && (
        <p className="text-xs text-red-600 dark:text-red-400">
          Select at least one character set.
        </p>
      )}

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={!canGenerate}
          className="h-10 flex-1 rounded-full bg-green-600 font-medium text-white hover:bg-green-700 disabled:opacity-40"
        >
          Generate
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!password}
          className="h-10 flex-1 rounded-full border border-black/15 font-medium hover:bg-black/5 disabled:opacity-40 dark:border-white/20 dark:hover:bg-white/10"
        >
          {copyState === "copied" ? "Copied!" : copyState === "failed" ? "Copy failed" : "Copy"}
        </button>
      </div>
    </ToolCard>
  );
}
