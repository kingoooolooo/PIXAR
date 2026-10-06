import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Source, Stage } from "@/components/Stage";
import { PROBLEMS, PROBLEM_INTRO } from "@/content/pitch";
import { STATS } from "@/content/stats";
import { cn } from "@/utils/cn";

const FORMAL = 22;

function UnitChart() {
  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[340px]" role="img" aria-label={`Unit chart of 100 squares. ${FORMAL} are documented as formally collected and recycled. ${100 - FORMAL} are undocumented.`}>
      {Array.from({ length: 100 }, (_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        const formal = i < FORMAL;
        return (
          <rect
            key={i}
            x={col * 22 + 1}
            y={row * 22 + 1}
            width={19}
            height={19}
            rx={3}
            style={{
              fill: formal ? "var(--teal)" : "color-mix(in srgb, var(--ivory) 7%, transparent)",
              stroke: formal ? "var(--teal)" : "color-mix(in srgb, var(--ivory) 45%, transparent)",
              strokeWidth: 1,
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: `sq-in 0.32s var(--ease-out) ${(formal ? i : 22 + (i - FORMAL) * 0.6) * 18}ms both`,
            }}
          />
        );
      })}
    </svg>
  );
}

export default function Problem() {
  const [open, setOpen] = useState<number | null>(null);
  const facts = [STATS.generated, STATS.projection, STATS.resources, STATS.indiaGenerated];
  return (
    <Stage title="Most old devices never reach documented recycling" lead={PROBLEM_INTRO}>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <UnitChart />
          <ul className="mt-3 space-y-1 text-base">
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-4 rounded-sm bg-teal" />
              <span>
                <strong>{FORMAL}</strong> documented as formally collected and recycled
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-4 rounded-sm border border-ivory/60 bg-ivory/10" />
              <span>
                <strong>{100 - FORMAL}</strong> undocumented
              </span>
            </li>
          </ul>
          <p className="mt-2 text-sm text-muted">Each square is 1% of e-waste mass, not one device.</p>
          <Source>
            {STATS.formalShare.display}% of {STATS.generated.display} million tonnes in {STATS.formalShare.year}. Source: {STATS.formalShare.source}.
          </Source>
        </div>

        <div className="lg:col-span-7">
          <h2 className="t-h2 mb-3">In the user&apos;s words</h2>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-s1">
            {PROBLEMS.map((p, i) => (
              <li key={p.quote}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={open === i}
                    aria-controls={`problem-${i}`}
                    onClick={() => setOpen(open === i ? null : i)}
                    className="t-body flex min-h-14 w-full items-center justify-between gap-4 px-4 py-2 text-left hover:bg-ivory/5"
                  >
                    <span>&ldquo;{p.quote}&rdquo;</span>
                    <ChevronDown className={cn("size-5 shrink-0 transition-transform duration-200", open === i && "rotate-180")} strokeWidth={1.5} aria-hidden />
                  </button>
                </h3>
                {open === i && (
                  <p id={`problem-${i}`} className="pop-in px-4 pb-3 text-base text-muted">
                    {p.detail}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl className="grid gap-x-8 gap-y-3 border-t border-line pt-4 sm:grid-cols-2 xl:grid-cols-4">
        {facts.map((f) => (
          <div key={f.id}>
            <dt className="text-sm text-muted">{f.label}</dt>
            <dd className="mt-0.5">
              <span className="font-display text-2xl font-bold">
                {f.display} {f.unit}
              </span>
              <span className="block text-xs text-muted">
                {f.year}. {f.source}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </Stage>
  );
}
