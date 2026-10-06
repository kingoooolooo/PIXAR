import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { Stage } from "@/components/Stage";
import { ADVANTAGES, FLYWHEEL } from "@/content/pitch";
import { setArrowHandler } from "@/state/presenter";
import { cn } from "@/utils/cn";

const R = 138;
const C = 200;
const NR = 46;
const n = FLYWHEEL.length;
const ang = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180);
const pt = (i: number, r = R) => ({ x: C + r * Math.cos(ang(i)), y: C + r * Math.sin(ang(i)) });

export default function Advantage() {
  const [active, setActive] = useState(0);
  const ref = useRef(0);
  ref.current = active;

  // Arrow keys step through the loop, then move on to the next chapter.
  useEffect(() => {
    setArrowHandler((dir) => {
      const a = ref.current;
      if (dir === 1 && a < n - 1) {
        setActive(a + 1);
        return true;
      }
      if (dir === -1 && a > 0) {
        setActive(a - 1);
        return true;
      }
      return false;
    });
    return () => setArrowHandler(null);
  }, []);

  const arcs = FLYWHEEL.map((_, i) => {
    const gap = (NR + 6) / R;
    const a1 = ang(i) + gap;
    const a2 = ang(i + 1) - gap;
    const p1 = { x: C + R * Math.cos(a1), y: C + R * Math.sin(a1) };
    const p2 = { x: C + R * Math.cos(a2), y: C + R * Math.sin(a2) };
    return `M ${p1.x} ${p1.y} A ${R} ${R} 0 0 1 ${p2.x} ${p2.y}`;
  });

  return (
    <Stage title="Every scan makes the next one better" lead="Agents, a trusted partner network and outcome data reinforce each other.">
      <div className="grid items-center gap-8 lg:grid-cols-12">
        <ul className="space-y-2 lg:col-span-5">
          {ADVANTAGES.map((a) => (
            <li key={a} className="t-body flex gap-3">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-teal" />
              {a}
            </li>
          ))}
        </ul>
        <div className="lg:col-span-7">
          <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
            <svg viewBox="0 0 400 400" className="mx-auto w-full max-w-[420px]" role="img" aria-label={`Flywheel of five steps. Current step: ${FLYWHEEL[active].name}.`}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 1 L9 5 L0 9" fill="none" stroke="var(--ivory)" strokeWidth="1.5" />
                </marker>
              </defs>
              {arcs.map((d, i) => (
                <path key={i} d={d} fill="none" strokeWidth={1.5} markerEnd="url(#arrow)" style={{ stroke: "var(--ivory)", strokeOpacity: i === active ? 0.9 : 0.35 }} />
              ))}
              {FLYWHEEL.map((f, i) => {
                const p = pt(i);
                const on = i === active;
                const words = f.name.split(" ");
                const mid = Math.ceil(words.length / 2);
                const lines = words.length > 2 ? [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] : words;
                return (
                  <g key={f.name} role="button" tabIndex={0} aria-label={f.name} aria-pressed={on} className="il-hot" onClick={() => setActive(i)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setActive(i))}>
                    <circle cx={p.x} cy={p.y} r={NR} style={{ fill: on ? "var(--teal)" : "var(--surface-1)", stroke: on ? "var(--teal)" : "var(--ivory)", strokeOpacity: on ? 1 : 0.5, transition: "fill 0.2s" }} strokeWidth={1.5} />
                    {lines.map((l, k) => (
                      <text key={l} x={p.x} y={p.y + (k - (lines.length - 1) / 2) * 15 + 4} textAnchor="middle" fontSize="13" fontWeight="600" style={{ fill: on ? "var(--ink)" : "var(--ivory)" }}>
                        {l}
                      </text>
                    ))}
                  </g>
                );
              })}
            </svg>
            <div className="space-y-3" aria-live="polite">
              <p className="t-h2">{FLYWHEEL[active].name}</p>
              <p className="t-body">{FLYWHEEL[active].line}</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setActive((active - 1 + n) % n)}>Previous step</Button>
                <Button variant="primary" onClick={() => setActive((active + 1) % n)}>
                  Next step
                </Button>
              </div>
              <p className={cn("text-sm text-muted")}>Step {active + 1} of {n}. Arrow keys also step through the loop.</p>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
