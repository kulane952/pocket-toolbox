"use client";

import { useState } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

type Unit = "metric" | "imperial";

// Empty fields count as 0; anything non-numeric or negative is invalid (NaN).
function toNumber(value: string): number {
  if (value.trim() === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

function categoryFor(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export default function BmiCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [cm, setCm] = useState("170");
  const [kg, setKg] = useState("65");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("7");
  const [pounds, setPounds] = useState("145");

  let heightM: number;
  let weightKg: number;
  if (unit === "metric") {
    heightM = toNumber(cm) / 100;
    weightKg = toNumber(kg);
  } else {
    heightM = (toNumber(feet) * 12 + toNumber(inches)) * 0.0254;
    weightKg = toNumber(pounds) * 0.45359237;
  }

  // NaN means a field holds a negative or non-numeric value.
  const hasInvalid = Number.isNaN(heightM) || Number.isNaN(weightKg);
  // Round once and classify the displayed value, matching the one-decimal
  // ranges in the spec (18.5–24.9, 25–29.9) so number and label always agree.
  const bmi =
    !hasInvalid && heightM > 0 && weightKg > 0
      ? Number((weightKg / (heightM * heightM)).toFixed(1))
      : null;
  const category = bmi === null ? null : categoryFor(bmi);

  const toggleClass = (active: boolean) =>
    `flex-1 rounded-md px-3 py-1.5 text-sm ${
      active
        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
        : "text-zinc-600 dark:text-zinc-400"
    }`;

  return (
    <ToolCard
      title="BMI Calculator"
      description="Enter height and weight (metric/imperial toggle); shows BMI value and category."
    >
      <div
        role="group"
        aria-label="Units"
        className="flex gap-1 rounded-lg border border-black/10 p-1 dark:border-white/15"
      >
        <button
          type="button"
          aria-pressed={unit === "metric"}
          onClick={() => setUnit("metric")}
          className={toggleClass(unit === "metric")}
        >
          Metric
        </button>
        <button
          type="button"
          aria-pressed={unit === "imperial"}
          onClick={() => setUnit("imperial")}
          className={toggleClass(unit === "imperial")}
        >
          Imperial
        </button>
      </div>

      {unit === "metric" ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Height (cm)
            <input
              type="number"
              min="0"
              step="any"
              value={cm}
              onChange={(e) => setCm(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Weight (kg)
            <input
              type="number"
              min="0"
              step="any"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Height (ft)
            <input
              type="number"
              min="0"
              step="1"
              value={feet}
              onChange={(e) => setFeet(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Height (in)
            <input
              type="number"
              min="0"
              step="any"
              value={inches}
              onChange={(e) => setInches(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Weight (lb)
            <input
              type="number"
              min="0"
              step="any"
              value={pounds}
              onChange={(e) => setPounds(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      )}

      <dl aria-live="polite" className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">BMI</dt>
          <dd className="text-lg font-semibold">{bmi === null ? "—" : bmi.toFixed(1)}</dd>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">Category</dt>
          <dd className="text-lg font-semibold">{category ?? "—"}</dd>
        </div>
      </dl>
      {bmi === null && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {hasInvalid
            ? "Values can't be negative."
            : "Enter a height and weight greater than zero."}
        </p>
      )}
    </ToolCard>
  );
}
