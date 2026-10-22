import type { ReactNode } from "react";

type ToolCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

// Shared frame for every tool. No hooks or handlers, so it works from both
// Server and Client Components.
export default function ToolCard({ title, description, children }: ToolCardProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm dark:border-white/[.145] dark:bg-zinc-900">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        )}
      </header>
      <div className="flex flex-col gap-3 text-sm">{children}</div>
    </section>
  );
}
