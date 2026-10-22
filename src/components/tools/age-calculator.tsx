"use client";

import { useState, useSyncExternalStore } from "react";
import ToolCard from "@/components/tool-card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15";

const MS_PER_DAY = 86_400_000;

type YMD = { y: number; m: number; d: number }; // m is 0-based

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Today's local date as "YYYY-MM-DD".
function readToday() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Cached so getSnapshot is stable between calls; refreshed at local midnight
// and whenever the tab becomes visible again.
let cachedToday: string | null = null;

function getTodaySnapshot() {
  if (cachedToday === null) cachedToday = readToday();
  return cachedToday;
}

// No "today" on the server, so server and first client render match.
function getServerSnapshot() {
  return null;
}

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const refresh = () => {
    const next = readToday();
    if (next !== cachedToday) {
      cachedToday = next;
      onChange();
    }
  };
  const schedule = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = setTimeout(() => {
      refresh();
      schedule();
    }, midnight.getTime() - now.getTime() + 1000);
  };
  refresh();
  schedule();
  document.addEventListener("visibilitychange", refresh);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", refresh);
  };
}

// Date.UTC maps years 0-99 to 1900-1999, so set the full year explicitly.
function utcMs(y: number, m: number, d: number) {
  const date = new Date(0);
  date.setUTCFullYear(y, m, d);
  return date.getTime();
}

function daysInMonth(y: number, m: number) {
  return new Date(utcMs(y, m + 1, 0)).getUTCDate();
}

function toUtc({ y, m, d }: YMD) {
  return utcMs(y, m, d);
}

function parseDate(value: string): YMD | null {
  const match = /^(\d{4,6})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  if (m < 0 || m > 11 || d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

// The date `months` months after `start`, clamping the day to the target
// month's length (so a Feb 29 birthday falls on Feb 28 in non-leap years).
function addMonthsClamped(start: YMD, months: number): YMD {
  const total = start.m + months;
  const y = start.y + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  return { y, m, d: Math.min(start.d, daysInMonth(y, m)) };
}

function computeAge(birth: YMD, today: YMD) {
  const todayMs = toUtc(today);
  let months = (today.y - birth.y) * 12 + (today.m - birth.m);
  let lastMonthly = addMonthsClamped(birth, months);
  if (toUtc(lastMonthly) > todayMs) {
    months -= 1;
    lastMonthly = addMonthsClamped(birth, months);
  }
  const days = Math.round((todayMs - toUtc(lastMonthly)) / MS_PER_DAY);

  // This year's birthday if it hasn't passed yet, otherwise next year's.
  const thisYear = addMonthsClamped(birth, (today.y - birth.y) * 12);
  const nextBirthday =
    toUtc(thisYear) >= todayMs
      ? thisYear
      : addMonthsClamped(birth, (today.y + 1 - birth.y) * 12);
  const daysUntil = Math.round((toUtc(nextBirthday) - todayMs) / MS_PER_DAY);

  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days,
    daysUntil,
    isBirthday: daysUntil === 0,
  };
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const todayStr = useSyncExternalStore(subscribe, getTodaySnapshot, getServerSnapshot);

  const today = todayStr ? parseDate(todayStr) : null;
  const birth = parseDate(birthDate);
  const isFuture = !!(today && birth && toUtc(birth) > toUtc(today));
  const result = today && birth && !isFuture ? computeAge(birth, today) : null;
  const isLeapDay = birth?.m === 1 && birth.d === 29;

  return (
    <ToolCard
      title="Age Calculator"
      description="Enter a birth date; shows exact age in years/months/days and days until next birthday."
    >
      <label className="flex flex-col gap-1 text-sm">
        Birth date
        <input
          type="date"
          value={birthDate}
          max={todayStr ?? undefined}
          onChange={(e) => setBirthDate(e.target.value)}
          className={inputClass}
        />
      </label>
      {isFuture && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          That date is in the future. Pick a birth date on or before today.
        </p>
      )}
      <dl className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">Age</dt>
          <dd className="text-lg font-semibold">
            {result
              ? `${plural(result.years, "year")}, ${plural(result.months, "month")}, ${plural(result.days, "day")}`
              : "—"}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">Next birthday</dt>
          <dd className="text-lg font-semibold">
            {result
              ? result.isBirthday
                ? "Today! Happy birthday"
                : `in ${plural(result.daysUntil, "day")}`
              : "—"}
          </dd>
        </div>
      </dl>
      {result && isLeapDay && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Born on Feb 29: in non-leap years the birthday is counted on Feb 28.
        </p>
      )}
    </ToolCard>
  );
}
