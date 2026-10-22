"use client";

import { useState } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

// Split on spaces, punctuation, underscores, hyphens and case boundaries
// ("fooBar" -> foo, Bar; "XMLHttp" -> XML, Http). Apostrophes inside words
// are dropped so "don't" stays one word.
function splitWords(text: string): string[] {
  return text
    .normalize("NFC")
    .replace(/([\p{L}\p{N}]\p{M}*)['’](?=\p{L})/gu, "$1")
    .replace(/([\p{Ll}\p{N}]\p{M}*)(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu}\p{M}*)(\p{Lu}\p{M}*\p{Ll})/gu, "$1 $2")
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean);
}

function capitalize(word: string): string {
  const [first = "", ...rest] = word;
  return first.toUpperCase() + rest.join("").toLowerCase();
}

export default function CaseConverter() {
  const [text, setText] = useState("Hello world, fooBar_baz-qux");

  const words = splitWords(text);
  const lower = words.map((w) => w.toLowerCase());

  const results = [
    { label: "UPPER", value: text.toUpperCase() },
    { label: "lower", value: text.toLowerCase() },
    { label: "Title Case", value: words.map(capitalize).join(" ") },
    {
      label: "camelCase",
      value: lower.map((w, i) => (i === 0 ? w : capitalize(w))).join(""),
    },
    { label: "snake_case", value: lower.join("_") },
    { label: "kebab-case", value: lower.join("-") },
  ];

  return (
    <ToolCard
      title="Case Converter"
      description="Convert text to UPPER, lower, Title, camelCase, snake_case and kebab-case."
    >
      <label className="flex flex-col gap-1 text-sm">
        Text
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={inputClass}
        />
      </label>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {results.map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
            <dt className="text-xs text-zinc-600 dark:text-zinc-400">{label}</dt>
            <dd className="whitespace-pre-wrap break-all font-mono text-sm">{value || " "}</dd>
          </div>
        ))}
      </dl>
    </ToolCard>
  );
}
