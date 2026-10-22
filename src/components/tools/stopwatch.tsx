"use client";

import { useEffect, useRef, useState } from "react";
import ToolCard from "@/components/tool-card";

function formatTime(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centis = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  // Wall-clock time the current run started, minus time already banked.
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now() - elapsed;
    let frame = requestAnimationFrame(function tick() {
      setElapsed(performance.now() - startRef.current);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
    // elapsed is only read when a run begins; including it would restart the loop every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function toggle() {
    if (running) setElapsed(performance.now() - startRef.current);
    setRunning(!running);
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  }

  function lap() {
    const now = performance.now() - startRef.current;
    setElapsed(now);
    setLaps((prev) => [now, ...prev]);
  }

  return (
    <ToolCard title="Stopwatch" description="Start/stop/reset stopwatch with lap times.">
      <p
        className="text-center font-mono text-5xl tabular-nums"
        role="timer"
        aria-live="off"
      >
        {formatTime(elapsed)}
      </p>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className={`h-10 flex-1 rounded-full font-medium text-white ${running ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
        >
          {running ? "Stop" : "Start"}
        </button>
        <button
          type="button"
          onClick={lap}
          disabled={!running}
          className="h-10 flex-1 rounded-full border border-black/15 font-medium hover:bg-black/5 disabled:opacity-40 dark:border-white/20 dark:hover:bg-white/10"
        >
          Lap
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={running || elapsed === 0}
          className="h-10 flex-1 rounded-full border border-black/15 font-medium hover:bg-black/5 disabled:opacity-40 dark:border-white/20 dark:hover:bg-white/10"
        >
          Reset
        </button>
      </div>

      {laps.length > 0 && (
        <ol className="w-full divide-y divide-black/10 font-mono tabular-nums dark:divide-white/10">
          {laps.map((total, i) => {
            const n = laps.length - i;
            const split = total - (laps[i + 1] ?? 0);
            return (
              <li key={n} className="flex justify-between py-2">
                <span>Lap {n}</span>
                <span className="text-zinc-500">{formatTime(split)}</span>
                <span>{formatTime(total)}</span>
              </li>
            );
          })}
        </ol>
      )}
    </ToolCard>
  );
}
