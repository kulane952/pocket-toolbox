"use client";

import { useState } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

type Unit = "C" | "F" | "K";

const UNITS: { unit: Unit; label: string }[] = [
  { unit: "C", label: "Celsius (°C)" },
  { unit: "F", label: "Fahrenheit (°F)" },
  { unit: "K", label: "Kelvin (K)" },
];

function toCelsius(value: number, unit: Unit): number {
  if (unit === "F") return ((value - 32) * 5) / 9;
  if (unit === "K") return value - 273.15;
  return value;
}

function fromCelsius(celsius: number, unit: Unit): number {
  if (unit === "F") return (celsius * 9) / 5 + 32;
  if (unit === "K") return celsius + 273.15;
  return celsius;
}

function format(value: number): string {
  // Round to 2 decimals and drop trailing zeros; avoid "-0".
  const rounded = Math.round(value * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

export default function TemperatureConverter() {
  const [source, setSource] = useState<{ unit: Unit; raw: string }>({
    unit: "C",
    raw: "20",
  });

  const trimmed = source.raw.trim();
  const parsed = trimmed === "" ? NaN : Number(trimmed);
  const celsius = Number.isFinite(parsed) ? toCelsius(parsed, source.unit) : NaN;
  // Compare with a small tolerance so exact 0 K entered via °C/°F isn't flagged.
  const belowAbsoluteZero = Number.isFinite(celsius) && celsius < -273.15 - 1e-9;

  function valueFor(unit: Unit): string {
    if (unit === source.unit) return source.raw;
    if (!Number.isFinite(celsius)) return "";
    return format(fromCelsius(celsius, unit));
  }

  return (
    <ToolCard
      title="Temperature Converter"
      description="Live-convert between Celsius, Fahrenheit and Kelvin."
    >
      <div className="grid grid-cols-3 gap-3">
        {UNITS.map(({ unit, label }) => (
          <label key={unit} className="flex flex-col gap-1 text-sm">
            {label}
            <input
              type="number"
              step="any"
              inputMode="decimal"
              value={valueFor(unit)}
              onChange={(e) => setSource({ unit, raw: e.target.value })}
              className={inputClass}
            />
          </label>
        ))}
      </div>
      {belowAbsoluteZero && (
        <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">
          That&apos;s below absolute zero (0 K / −273.15 °C / −459.67 °F), which is
          physically impossible.
        </p>
      )}
    </ToolCard>
  );
}
