"use client";

import { useState } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

const DIE_SIDES = [4, 6, 8, 10, 12, 20] as const;
const MIN_DICE = 1;
const MAX_DICE = 20;

// Returns the clamped count, or null if the input isn't a usable number.
function parseCount(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return null;
  return Math.min(MAX_DICE, Math.max(MIN_DICE, n));
}

type Result = { sides: number; values: number[] };

export default function DiceRoller() {
  const [count, setCount] = useState("2");
  const [lastValidCount, setLastValidCount] = useState(2);
  const [sides, setSides] = useState<number>(6);
  const [result, setResult] = useState<Result | null>(null);

  function updateCount(value: string) {
    setCount(value);
    const n = parseCount(value);
    if (n !== null) setLastValidCount(n);
  }

  function normalizeCount() {
    const n = parseCount(count) ?? lastValidCount;
    setCount(String(n));
    setLastValidCount(n);
    return n;
  }

  // Randomness lives only in the click handler so server and client renders match.
  function roll() {
    const n = normalizeCount();
    setResult({
      sides,
      values: Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1),
    });
  }

  const total = result ? result.values.reduce((sum, r) => sum + r, 0) : 0;

  return (
    <ToolCard
      title="Dice Roller"
      description="Roll N dice of a chosen type (d4–d20); shows each roll and the total."
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Number of dice
          <input
            type="number"
            min={MIN_DICE}
            max={MAX_DICE}
            step="1"
            value={count}
            onChange={(e) => updateCount(e.target.value)}
            onBlur={normalizeCount}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Die type
          <select
            value={sides}
            onChange={(e) => setSides(Number(e.target.value))}
            className={`${inputClass} dark:bg-zinc-900`}
          >
            {DIE_SIDES.map((s) => (
              <option key={s} value={s}>
                d{s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={roll}
        className="h-10 rounded-full bg-green-600 font-medium text-white hover:bg-green-700"
      >
        Roll
      </button>

      <div aria-live="polite">
        {result && (
          <dl className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
              <dt className="text-xs text-zinc-600 dark:text-zinc-400">
                Rolls ({result.values.length}d{result.sides})
              </dt>
              <dd className="text-lg font-semibold tabular-nums break-words">
                {result.values.join(", ")}
              </dd>
            </div>
            <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
              <dt className="text-xs text-zinc-600 dark:text-zinc-400">Total</dt>
              <dd className="text-lg font-semibold tabular-nums">{total}</dd>
            </div>
          </dl>
        )}
      </div>
    </ToolCard>
  );
}
