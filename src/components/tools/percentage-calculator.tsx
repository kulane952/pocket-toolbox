"use client";

import { useState } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

const tileClass = "rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800";

const DASH = "—";

// Strict parse: empty or non-numeric input yields NaN (parseFloat would accept "1abc").
function parse(value: string): number {
  const trimmed = value.trim();
  return trimmed === "" ? NaN : Number(trimmed);
}

// Formats to at most 4 decimals (one rounding pass); "—" for NaN/Infinity, never "-0".
function format(n: number): string {
  if (!Number.isFinite(n)) return DASH;
  const text = n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return text === "-0" ? "0" : text;
}

// num / den as a percentage, or null when inputs are invalid or den is 0.
function ratioPercent(num: number, den: number): number | null {
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  const pct = (num / den) * 100;
  return Number.isFinite(pct) ? pct : null;
}

function whatPercent(part: number, whole: number): string {
  const pct = ratioPercent(part, whole);
  return pct === null ? DASH : `${format(pct)}%`;
}

function percentChange(a: number, b: number): string {
  const change = ratioPercent(b - a, Math.abs(a));
  if (change === null) return DASH;
  if (change === 0) return "0% (no change)";
  const magnitude = Math.abs(change);
  const text = magnitude < 0.0001 ? "<0.0001" : format(magnitude);
  return change > 0 ? `+${text}% increase` : `−${text}% decrease`;
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function Field({ label, value, onChange }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <dl className="text-center">
      <div className={tileClass}>
        <dt className="text-xs text-zinc-600 dark:text-zinc-400">{label}</dt>
        <dd className="text-lg font-semibold" aria-live="polite">
          {value}
        </dd>
      </div>
    </dl>
  );
}

export default function PercentageCalculator() {
  const [ofPercent, setOfPercent] = useState("20");
  const [ofTotal, setOfTotal] = useState("150");

  const [part, setPart] = useState("30");
  const [whole, setWhole] = useState("120");

  const [from, setFrom] = useState("80");
  const [to, setTo] = useState("100");

  const ofResult = format((parse(ofPercent) / 100) * parse(ofTotal));

  const whatResult = whatPercent(parse(part), parse(whole));

  const changeResult = percentChange(parse(from), parse(to));

  return (
    <ToolCard
      title="Percentage Calculator"
      description={'Compute "X% of Y", "X is what % of Y", and % change between two numbers.'}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-medium">X% of Y</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label="X (%)" value={ofPercent} onChange={setOfPercent} />
          <Field label="Y" value={ofTotal} onChange={setOfTotal} />
        </div>
        <Result label="Result" value={ofResult} />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-medium">X is what % of Y</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label="X" value={part} onChange={setPart} />
          <Field label="Y" value={whole} onChange={setWhole} />
        </div>
        <Result label="Percentage" value={whatResult} />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-medium">% change from A to B</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From (A)" value={from} onChange={setFrom} />
          <Field label="To (B)" value={to} onChange={setTo} />
        </div>
        <Result label="Change" value={changeResult} />
      </fieldset>
    </ToolCard>
  );
}
