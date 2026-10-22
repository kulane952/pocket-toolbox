"use client";

import { useState } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

export default function TipCalculator() {
  const [bill, setBill] = useState("50");
  const [tipPercent, setTipPercent] = useState("15");
  const [people, setPeople] = useState("1");

  const billAmount = parseFloat(bill);
  const tip = billAmount * (parseFloat(tipPercent) / 100);
  const total = billAmount + tip;
  const perPerson = total / parseInt(people, 10);

  return (
    <ToolCard
      title="Tip Calculator"
      description="Enter a bill amount, tip % and party size; shows tip, total and per-person share."
    >
      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Bill ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tip (%)
          <input
            type="number"
            min="0"
            value={tipPercent}
            onChange={(e) => setTipPercent(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          People
          <input
            type="number"
            min="1"
            step="1"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <dl className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">Tip</dt>
          <dd className="text-lg font-semibold">${tip.toFixed(2)}</dd>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">Total</dt>
          <dd className="text-lg font-semibold">${total.toFixed(2)}</dd>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">Per person</dt>
          <dd className="text-lg font-semibold">${perPerson.toFixed(2)}</dd>
        </div>
      </dl>
    </ToolCard>
  );
}
