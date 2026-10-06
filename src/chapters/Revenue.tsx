import { useState } from "react";
import { Stage } from "@/components/Stage";
import { Wordmark } from "@/components/Logo";
import { REVENUE } from "@/content/pitch";
import { cn } from "@/utils/cn";

const H = 376;

export default function Revenue() {
  const [hot, setHot] = useState(0);
  const y = (i: number) => 28 + i * 64;
  const item = REVENUE[hot];

  return (
    <Stage title="Individuals scan free. Everyone who gains from the loop pays." lead="Money flows in from the groups that get leads, reports and compliance support.">
      <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_8rem_minmax(0,0.7fr)] md:gap-0">
        <ul className="flex flex-col gap-2" aria-label="Who pays">
          {REVENUE.map((r, i) => (
            <li key={r.name}>
              <button
                type="button"
                aria-pressed={hot === i}
                onMouseEnter={() => setHot(i)}
                onFocus={() => setHot(i)}
                onClick={() => setHot(i)}
                className={cn("t-body flex h-14 w-full items-center justify-between gap-3 rounded-2xl border px-4 text-left transition-colors duration-200", hot === i ? "border-teal bg-teal/10" : "border-line bg-s1")}
              >
                <span>{r.name}</span>
                <span className={cn("rounded-md border px-2 py-0.5 text-sm", r.tag === "Free" ? "border-ivory bg-ivory text-ink font-semibold" : "border-teal text-teal")}>{r.tag === "Free" ? "Free" : "Pays"}</span>
              </button>
            </li>
          ))}
        </ul>
        <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="hidden h-[376px] w-full md:block" aria-hidden>
          {REVENUE.map((r, i) => (
            <path
              key={r.name}
              d={`M0 ${y(i)} C 55 ${y(i)}, 45 ${H / 2}, 100 ${H / 2}`}
              fill="none"
              vectorEffect="non-scaling-stroke"
              strokeDasharray={r.tag === "Free" ? "4 5" : undefined}
              style={{ stroke: hot === i ? "var(--teal)" : "var(--ivory)", strokeOpacity: hot === i ? 1 : 0.2, strokeWidth: hot === i ? 2 : 1 }}
            />
          ))}
        </svg>
        <div className="frame grid min-h-40 place-items-center p-6 text-center md:h-[376px]">
          <div>
            <Wordmark className="text-4xl" />
            <p className="mt-2 text-base text-muted">Revenue sits between the people who benefit and the partners who deliver.</p>
          </div>
        </div>
      </div>
      <div aria-live="polite" className="rounded-2xl border border-line bg-s1 p-4">
        <p className="t-body">
          <span className="font-semibold">{item.name}: </span>
          {item.how}
        </p>
      </div>
    </Stage>
  );
}
