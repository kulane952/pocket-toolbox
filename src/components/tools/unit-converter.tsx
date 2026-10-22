"use client";

import { useState } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

type Category = "Length" | "Weight" | "Volume";

// Factor to convert one unit into the category's base unit (m, g, mL).
const UNITS: Record<Category, Record<string, number>> = {
  Length: {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
  },
  Weight: {
    mg: 0.001,
    g: 1,
    kg: 1000,
    oz: 28.349523125,
    lb: 453.59237,
    st: 6350.29318,
  },
  Volume: {
    mL: 1,
    L: 1000,
    tsp: 4.92892159375,
    tbsp: 14.78676478125,
    "fl oz": 29.5735295625,
    cup: 236.5882365,
    pt: 473.176473,
    qt: 946.352946,
    "gal (US)": 3785.411784,
  },
};

const DEFAULTS: Record<Category, [string, string]> = {
  Length: ["m", "ft"],
  Weight: ["kg", "lb"],
  Volume: ["L", "gal (US)"],
};

const CATEGORIES = Object.keys(UNITS) as Category[];

function formatResult(n: number) {
  const abs = Math.abs(n);
  const scientific = abs !== 0 && (abs < 1e-3 || abs >= 1e12);
  return n.toLocaleString("en-US", {
    maximumSignificantDigits: 6,
    notation: scientific ? "scientific" : "standard",
  });
}

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>("Length");
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(DEFAULTS.Length[0]);
  const [to, setTo] = useState(DEFAULTS.Length[1]);

  const units = UNITS[category];
  const parsed = value.trim() === "" ? NaN : Number(value);
  // Negative lengths, weights and volumes are meaningless; treat them as no input.
  const amount = parsed >= 0 ? parsed : NaN;
  const result = (amount * units[from]) / units[to];

  function changeCategory(next: Category) {
    setCategory(next);
    setFrom(DEFAULTS[next][0]);
    setTo(DEFAULTS[next][1]);
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const unitOptions = Object.keys(units).map((u) => (
    <option key={u} value={u}>
      {u}
    </option>
  ));

  return (
    <ToolCard
      title="Unit Converter"
      description="Convert length, weight and volume between common units."
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Category
          <select
            value={category}
            onChange={(e) => changeCategory(e.target.value as Category)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Value
          <input
            type="number"
            min="0"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          From
          <select value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass}>
            {unitOptions}
          </select>
        </label>
        <button
          type="button"
          onClick={swap}
          aria-label="Swap units"
          className="h-10 rounded-full border border-black/15 px-4 font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          ⇄
        </button>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          To
          <select value={to} onChange={(e) => setTo(e.target.value)} className={inputClass}>
            {unitOptions}
          </select>
        </label>
      </div>
      <dl className="rounded-lg bg-zinc-100 p-3 text-center dark:bg-zinc-800">
        <dt className="text-xs text-zinc-600 dark:text-zinc-400">Result</dt>
        <dd className="text-lg font-semibold" aria-live="polite">
          {Number.isFinite(result) ? `${formatResult(result)} ${to}` : "—"}
        </dd>
      </dl>
    </ToolCard>
  );
}
