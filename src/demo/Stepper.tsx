import { Check } from "lucide-react";
import { go } from "@/lib/nav";
import { useDemo } from "@/state/demo";
import { phaseRank, STEPS, stepIndex, type StepId } from "@/state/steps";
import { cn } from "@/utils/cn";

export function Stepper({ step }: { step: StepId }) {
  const phase = useDemo((s) => s.phase);
  const current = stepIndex(step);
  return (
    <nav aria-label="Demo steps" className="no-print border-b border-line bg-ink/80 px-3 py-3 backdrop-blur sm:px-6 lg:px-10">
      <ol className="flex items-center gap-1 sm:gap-2">
        {STEPS.map((s, i) => {
          const reachable = phaseRank(phase) >= phaseRank(s.needs);
          const isCurrent = i === current;
          const done = i < current;
          return (
            <li key={s.id} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <button
                type="button"
                disabled={!reachable}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => go(`/demo/${s.id}`)}
                className={cn(
                  "flex min-h-11 min-w-11 items-center gap-2 rounded-lg px-1.5 text-left text-sm transition-colors duration-200 sm:px-2.5",
                  isCurrent ? "text-ivory" : reachable ? "text-ivory/80 hover:text-ivory" : "text-muted opacity-70"
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border text-sm font-semibold",
                    isCurrent ? "border-teal bg-teal text-ink" : done ? "border-teal text-teal" : "border-line"
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={2} aria-label="Done" /> : i + 1}
                </span>
                <span className={cn("truncate", isCurrent ? "inline" : "hidden md:inline")}>
                  {s.label}
                  {s.optional && <span className="ml-1 hidden text-muted xl:inline">(optional)</span>}
                </span>
              </button>
              {i < STEPS.length - 1 && <span aria-hidden className={cn("h-px flex-1", done ? "bg-teal" : "bg-line")} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
