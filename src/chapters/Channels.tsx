import { useState } from "react";
import { Stage } from "@/components/Stage";
import { ACQUISITION, CHANNEL_LINKS, DISTRIBUTION } from "@/content/pitch";
import { cn } from "@/utils/cn";

type Hot = { side: "a" | "d"; i: number } | null;
const H = 440;

export default function Channels() {
  const [hot, setHot] = useState<Hot>(null);
  const aY = (i: number) => 28 + i * 64;
  const dY = (j: number) => 55 + j * 110;

  const related = (side: "a" | "d", i: number): boolean => {
    if (!hot) return true;
    if (hot.side === side) return hot.i === i;
    return hot.side === "a" ? CHANNEL_LINKS[hot.i].includes(i) : CHANNEL_LINKS[i].includes(hot.i);
  };
  const lineOn = (a: number, d: number) => (!hot ? false : hot.side === "a" ? hot.i === a : hot.i === d);

  const item = (side: "a" | "d", i: number, text: string, extra?: string) => (
    <li key={text} className={extra}>
      <button
        type="button"
        onMouseEnter={() => setHot({ side, i })}
        onMouseLeave={() => setHot(null)}
        onFocus={() => setHot({ side, i })}
        onBlur={() => setHot(null)}
        className={cn("t-body flex h-14 w-full items-center rounded-2xl border px-4 text-left transition-[opacity,border-color] duration-200", related(side, i) ? "border-line bg-s1 opacity-100" : "border-line opacity-35", hot?.side === side && hot.i === i && "border-teal bg-teal/10")}
      >
        {text}
      </button>
    </li>
  );

  return (
    <Stage title="Reach people where old devices already sit" lead="Acquisition brings people in. Distribution is how they scan, hand over and stay connected.">
      <div className="grid items-start gap-4 md:grid-cols-[1fr_9rem_1fr] md:gap-0">
        <div>
          <h2 className="t-h2 mb-3">Acquisition</h2>
          <ul className="flex flex-col gap-2">{ACQUISITION.map((a, i) => item("a", i, a))}</ul>
        </div>
        <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="mt-[3.25rem] hidden h-[440px] w-full md:block" aria-hidden>
          {CHANNEL_LINKS.flatMap((ds, a) =>
            ds.map((d) => {
              const on = lineOn(a, d);
              return (
                <path
                  key={`${a}-${d}`}
                  d={`M0 ${aY(a)} C 50 ${aY(a)}, 50 ${dY(d)}, 100 ${dY(d)}`}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  style={{ stroke: on ? "var(--teal)" : "var(--ivory)", strokeOpacity: on ? 1 : hot ? 0.06 : 0.2, strokeWidth: on ? 2 : 1, transition: "stroke-opacity 0.2s" }}
                />
              );
            })
          )}
        </svg>
        <div>
          <h2 className="t-h2 mb-3">Distribution</h2>
          <ul className="flex flex-col gap-2 md:h-[440px] md:justify-around md:gap-0">{DISTRIBUTION.map((d, j) => item("d", j, d))}</ul>
        </div>
      </div>
      <p className="text-sm text-muted">Hover or focus an item to see what it connects to.</p>
    </Stage>
  );
}
