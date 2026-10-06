import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import { Wordmark } from "@/components/Logo";
import { Button } from "@/components/ui";
import { DEMO_CONFIG } from "@/content/config";
import { CANVAS } from "@/content/pitch";
import { go } from "@/lib/nav";
import { cn } from "@/utils/cn";

function Block({ title, items, className, children }: { title: string; items?: string[]; className?: string; children?: ReactNode }) {
  return (
    <section className={cn("overflow-hidden rounded-[0.6em] border border-ink/25 p-[0.7em]", className)}>
      <h2 className="font-display font-bold text-deep" style={{ fontSize: "1.15em" }}>
        {title}
      </h2>
      {items && (
        <ul className="mt-[0.35em] space-y-[0.25em]">
          {items.map((i) => (
            <li key={i} className="flex gap-[0.5em] leading-snug">
              <span aria-hidden className="mt-[0.5em] size-[0.35em] shrink-0 rounded-full bg-deep" />
              {i}
            </li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}

export default function CanvasPage() {
  return (
    <div className="stage-pad">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="t-h1" style={{ fontSize: "clamp(1.6rem, 1rem + 2vw, 3rem)" }}>
            Lean Canvas
          </h1>
          <p className="text-muted">All nine blocks on one sheet. Prints on one A4 landscape page.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => go("/sdg")}>Back to the pitch</Button>
          <Button variant="primary" onClick={() => window.print()}>
            <Printer className="size-5" strokeWidth={1.5} aria-hidden /> Print or save as PDF
          </Button>
        </div>
      </div>

      <article aria-label="PIXAR Lean Canvas" className="canvas-sheet ivory-sheet mx-auto w-full max-w-[1280px] rounded-[20px] p-[1.2em] [--cs:clamp(12px,0.95vw,15px)]" style={{ fontSize: "var(--cs)" }}>
        <header className="mb-[0.8em] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-[0.8em]">
            <Wordmark dark className="text-[2.2em]" />
            <span style={{ fontSize: "1em" }} className="font-semibold">
              Lean Canvas: Scan it. Give it a second life.
            </span>
          </div>
          <span className="text-[0.9em]">
            {DEMO_CONFIG.teamName}, {DEMO_CONFIG.collegeName}. Simulated prototype. Figures are illustrative.
          </span>
        </header>
        <div className="grid gap-[0.6em] md:h-[calc(100%-3.4em)] md:grid-cols-10 md:grid-rows-[1fr_1fr_0.85fr]">
          <Block title="Problem" items={CANVAS.problem} className="md:col-span-2 md:row-span-2">
            <h3 className="mt-[0.8em] font-semibold text-deep">Existing alternatives</h3>
            <p className="mt-[0.2em] leading-snug">{CANVAS.alternatives.join(", ")}.</p>
          </Block>
          <Block title="Solution" items={CANVAS.solution} className="md:col-span-2" />
          <Block title="Unique value proposition" className="md:col-span-2 md:row-span-2">
            <p className="mt-[0.4em] font-display font-semibold leading-snug" style={{ fontSize: "1.2em" }}>
              {CANVAS.uvp[0]}
            </p>
            <h3 className="mt-[0.8em] font-semibold text-deep">High-level concept</h3>
            <p className="mt-[0.2em] leading-snug">{CANVAS.concept}</p>
          </Block>
          <Block title="Unfair advantage" items={CANVAS.advantage} className="md:col-span-2" />
          <Block title="Customer segments" items={CANVAS.segments} className="md:col-span-2 md:row-span-2" />
          <Block title="Key metrics" items={CANVAS.metrics} className="md:col-span-2" />
          <Block title="Channels" items={CANVAS.channels} className="md:col-span-2" />
          <Block title="Cost structure" items={CANVAS.cost} className="md:col-span-5" />
          <Block title="Revenue streams" items={CANVAS.revenue} className="md:col-span-5" />
        </div>
      </article>
    </div>
  );
}
