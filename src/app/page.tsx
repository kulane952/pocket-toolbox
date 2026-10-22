import type { ComponentType } from "react";
import TipCalculator from "@/components/tools/tip-calculator";
import Stopwatch from "@/components/tools/stopwatch";
import AgeCalculator from "@/components/tools/age-calculator";
import BmiCalculator from "@/components/tools/bmi-calculator";
import CaseConverter from "@/components/tools/case-converter";
import ColorConverter from "@/components/tools/color-converter";
import DiceRoller from "@/components/tools/dice-roller";
import PasswordGenerator from "@/components/tools/password-generator";
import PercentageCalculator from "@/components/tools/percentage-calculator";
import TemperatureConverter from "@/components/tools/temperature-converter";
import UnitConverter from "@/components/tools/unit-converter";
import WordCounter from "@/components/tools/word-counter";

// Finished tools are added here by the integrator, never by tool workers
// (see CLAUDE.md). Each entry is a default export from src/components/tools/.
const tools: ComponentType[] = [
  TipCalculator,
  Stopwatch,
  AgeCalculator,
  BmiCalculator,
  CaseConverter,
  ColorConverter,
  DiceRoller,
  PasswordGenerator,
  PercentageCalculator,
  TemperatureConverter,
  UnitConverter,
  WordCounter,
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Pocket Toolbox</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          A gallery of small, independent tools.
        </p>
      </header>

      {tools.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/[.15] p-8 text-center text-zinc-500 dark:border-white/[.2]">
          No tools yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((Tool, i) => (
            <Tool key={i} />
          ))}
        </div>
      )}
    </main>
  );
}
