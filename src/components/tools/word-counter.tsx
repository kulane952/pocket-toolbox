"use client";

import { useState } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

const WORDS_PER_MINUTE = 200;

export default function WordCounter() {
  const [text, setText] = useState("");

  const words = text.split(/\s+/).filter(Boolean).length;
  // Count code points so emoji and other astral characters count once.
  const characters = Array.from(text).length;
  // A sentence ends at a run of . ! ? that follows a non-space, non-terminator char.
  const sentences = (text.match(/[^\s.!?][.!?]+/g) ?? []).length;
  const minutes = Math.round(words / WORDS_PER_MINUTE);
  const readingTime = minutes < 1 ? "< 1 min" : `${minutes} min`;

  const stats = [
    { label: "Words", value: words },
    { label: "Characters", value: characters },
    { label: "Sentences", value: sentences },
    { label: "Reading time", value: readingTime },
  ];

  return (
    <ToolCard
      title="Word Counter"
      description="Paste text; shows word, character and sentence counts and estimated reading time."
    >
      <label className="flex flex-col gap-1 text-sm">
        Text
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text here…"
          className={inputClass}
        />
      </label>
      <dl className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
            <dt className="text-xs text-zinc-600 dark:text-zinc-400">{label}</dt>
            <dd className="text-lg font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </ToolCard>
  );
}
