# Pocket Toolbox — tool contract

A gallery of small, independent tool widgets. Each tool is one task, tracked in `tasks/<slug>.md`.

- **One component per file:** `src/components/tools/<slug>.tsx`, default export.
- **Wrap the body in the shared card:** `ToolCard` from `src/components/tool-card.tsx`.
- **`"use client"` only if the tool is interactive** (state, effects, event handlers). App Router renders Server Components by default.
- **A task = `src/components/tools/<slug>.tsx` + `tasks/<slug>.md`.** Touch nothing else: never edit `src/app/page.tsx`, `tool-card.tsx`, or any other shared file.
- **When the tool works, change line 1 of `tasks/<slug>.md` to `status: done`.** Only your own task file, never another worker's.
