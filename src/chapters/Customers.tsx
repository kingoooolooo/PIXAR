import { useRef, useState, type KeyboardEvent } from "react";
import { Stage } from "@/components/Stage";
import { EARLY_ADOPTERS, SEGMENTS } from "@/content/pitch";
import { cn } from "@/utils/cn";

export default function Customers() {
  const [i, setI] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const seg = SEGMENTS[i];

  const onKey = (e: KeyboardEvent) => {
    const n = SEGMENTS.length;
    let next = i;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else return;
    e.preventDefault();
    e.stopPropagation();
    setI(next);
    refs.current[next]?.focus();
  };

  return (
    <Stage title="Four groups, one loop" lead="People with old devices and students who need parts sit on the demand side. Partners supply the second lives.">
      <div className="grid gap-8 lg:grid-cols-12">
        <div role="tablist" aria-label="Customer segments" aria-orientation="vertical" className="flex flex-col gap-2 lg:col-span-4" onKeyDown={onKey}>
          {SEGMENTS.map((s, k) => (
            <button
              key={s.id}
              ref={(el) => {
                refs.current[k] = el;
              }}
              role="tab"
              id={`seg-tab-${s.id}`}
              aria-selected={i === k}
              aria-controls="seg-panel"
              tabIndex={i === k ? 0 : -1}
              onClick={() => setI(k)}
              className={cn("t-body min-h-14 rounded-2xl border px-4 py-2 text-left font-medium transition-colors duration-200", i === k ? "border-teal bg-teal text-ink" : "border-line bg-s1 hover:border-ivory/40")}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div id="seg-panel" role="tabpanel" aria-labelledby={`seg-tab-${seg.id}`} key={seg.id} className="pop-in space-y-6 lg:col-span-8">
          <div>
            <h2 className="t-h2 mb-1">The need</h2>
            <p className="t-lead">{seg.need}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="panel p-4">
              <h2 className="t-h2 mb-1">What PIXAR gives</h2>
              <p className="t-body">{seg.gives}</p>
            </div>
            <div className="panel p-4">
              <h2 className="t-h2 mb-1">Who pays</h2>
              <p className="t-body">{seg.pays}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line pt-4">
        <h2 className="mb-2 text-base font-semibold">Early adopters</h2>
        <ul className="flex flex-wrap gap-2">
          {EARLY_ADOPTERS.map((e) => (
            <li key={e} className="rounded-lg border border-line px-3 py-1.5 text-base">
              {e}
            </li>
          ))}
        </ul>
      </div>
    </Stage>
  );
}
