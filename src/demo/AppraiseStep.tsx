import { useEffect, useState } from "react";
import { Banner, Button, Chip, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import type { Status } from "@/data/types";
import { inrRange, kg } from "@/lib/format";
import { useCountUp } from "@/lib/hooks";
import { DeviceIllustration } from "@/illustration/DeviceIllustration";
import { useDemo } from "@/state/demo";
import { useDerived } from "@/state/derived";
import { usePresenter } from "@/state/presenter";
import { cn } from "@/utils/cn";
import { StepFooter, StepHeader } from "./parts";

function ScoreRing({ score }: { score: number }) {
  const v = useCountUp(score, 1000);
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-36 shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={`Reuse score ${score} out of 100`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="9" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--teal)" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-4xl font-bold leading-none">{Math.round(v)}</p>
          <p className="text-sm text-muted">Reuse score</p>
        </div>
      </div>
    </div>
  );
}

const FILTERS: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "reusable", label: "Reusable" },
  { value: "repairable", label: "Repairable" },
  { value: "recyclable", label: "Recyclable" },
  { value: "hazardous", label: "Hazardous" },
];

export function AppraiseStep() {
  const enterAppraise = useDemo((s) => s.enterAppraise);
  const d = useDerived();
  const forced = usePresenter((s) => s.forced);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [student, setStudent] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  useEffect(() => {
    enterAppraise();
  }, [enterAppraise]);

  const a = d.appraisal;
  if (!a || !d.profile) return null;
  const activeId = hover ?? pinned ?? forced;
  const present = new Set(a.items.map((i) => i.status));
  const visible = a.items.filter((i) => (filter === "all" || i.status === filter) && (!student || i.def.studentUse));
  const statuses = Object.fromEntries(a.items.map((i) => [i.def.id, i.status])) as Record<string, Status>;

  return (
    <div>
      <StepHeader title="What is inside" lead="Appraiser checks every component. Hover or focus a part to see it in the drawing and the list." />
      {a.hazardous && (
        <div className="mb-5">
          <Banner tone="hazard" title="Hazardous: certified handling only">
            The battery is swollen or hot, which is a fire risk. Do not charge, open or carry it loose. Only a certified recycler should handle this device.
          </Banner>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="frame p-4">
            <DeviceIllustration
              kind={a.kind}
              explode={1}
              activeId={activeId}
              onActive={setHover}
              statuses={statuses}
              label={`Exploded drawing of a ${a.kind} with ${a.items.length} components`}
              className="mx-auto max-h-[52vh] w-full"
            />
          </div>
          <div className="panel flex flex-wrap items-center gap-5 p-4">
            <ScoreRing score={a.score} />
            <div className="min-w-0 flex-1 space-y-1 text-sm">
              <p>
                <span className="text-muted">Estimated value: </span>
                <span className="font-semibold">{inrRange(a.valueRange)}</span>
              </p>
              <p>
                <span className="text-muted">Weight: </span>
                <span className="font-semibold">{kg(a.weightKg)}</span>
              </p>
              <p className="text-muted">Values are illustrative.</p>
            </div>
          </div>
          <div className="panel p-4">
            <h2 className="text-base font-semibold">Why this score</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {a.factors.map((f) => (
                <li key={f.id}>
                  <span className="font-semibold">{f.name}</span> {f.direction} {f.points} points. <span className="text-muted">{f.reason}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">Recoverable materials</p>
            <div className="flex flex-wrap gap-1.5">
              {a.materials.map((m) => (
                <Chip key={m}>{m}</Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
              {FILTERS.filter((f) => f.value === "all" || present.has(f.value)).map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={filter === f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn("min-h-11 rounded-lg border px-3 text-sm transition-colors duration-200", filter === f.value ? "border-teal bg-teal text-ink font-semibold" : "border-line hover:bg-ivory/10")}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="ml-auto flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal">
              <input type="checkbox" className="size-4 accent-teal" checked={student} onChange={(e) => setStudent(e.target.checked)} />
              Student-reusable only
            </label>
          </div>
          {visible.length === 0 ? (
            <EmptyState
              title="No components match these filters."
              action={
                <Button
                  onClick={() => {
                    setFilter("all");
                    setStudent(false);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2">
              {visible.map((i) => {
                const active = activeId === i.def.id;
                return (
                  <li key={i.def.id}>
                    <button
                      type="button"
                      aria-pressed={pinned === i.def.id}
                      onMouseEnter={() => setHover(i.def.id)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(i.def.id)}
                      onBlur={() => setHover(null)}
                      onClick={() => setPinned((p) => (p === i.def.id ? null : i.def.id))}
                      className={cn("w-full rounded-2xl border p-3 text-left transition-colors duration-200", active ? "border-teal bg-teal/10" : "border-line bg-s1 hover:border-ivory/40")}
                    >
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{i.def.name}</span>
                        <StatusBadge status={i.status} />
                      </span>
                      <span className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
                        <span>{i.def.note}</span>
                        <span className="font-semibold text-ivory">{i.status === "hazardous" ? "No value" : inrRange(i.value)}</span>
                      </span>
                      {active && (
                        <span className="pop-in mt-2 block border-t border-line pt-2 text-sm">
                          <span className="block">{i.reason}</span>
                          {i.def.studentUse ? (
                            <span className="mt-1 block text-muted">Student use: {i.def.studentUse.difficulty}. {i.def.studentUse.tags.join(", ")}.</span>
                          ) : (
                            <span className="mt-1 block text-muted">Not a student part. Technician only.</span>
                          )}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <StepFooter back="scan" next="route" nextLabel="Find the best route" />
    </div>
  );
}
