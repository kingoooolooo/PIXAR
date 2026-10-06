import { useEffect, useRef, useState } from "react";
import { Stage } from "@/components/Stage";
import { BEATS, ONE_LINER, PROMISE } from "@/content/pitch";
import { setArrowHandler } from "@/state/presenter";
import { cn } from "@/utils/cn";

export default function Value() {
  const [lit, setLit] = useState(0);
  const litRef = useRef(0);
  litRef.current = lit;

  // Arrow keys light the beats first, then move on to the next chapter.
  useEffect(() => {
    setArrowHandler((dir) => {
      const l = litRef.current;
      if (dir === 1 && l < BEATS.length) {
        setLit(l + 1);
        return true;
      }
      if (dir === -1 && l > 0) {
        setLit(l - 1);
        return true;
      }
      return false;
    });
    return () => setArrowHandler(null);
  }, []);

  return (
    <Stage title="One promise" lead={PROMISE}>
      <p className="t-body max-w-3xl text-muted">{ONE_LINER}</p>
      <ol className="mt-2 flex flex-col gap-1">
        {BEATS.map((b, i) => {
          const on = i < lit;
          return (
            <li key={b.word} className="grid items-center gap-x-8 gap-y-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setLit(on && i === lit - 1 ? i : i + 1)}
                className={cn("flex items-center gap-4 text-left transition-colors duration-320 ease-out", on ? "text-ivory" : "text-ivory/50 hover:text-ivory/75")}
              >
                <span aria-hidden className={cn("h-[0.8em] w-1.5 shrink-0 rounded-full transition-colors duration-200", on ? "bg-teal" : "bg-transparent")} style={{ fontSize: "clamp(2.5rem, 1rem + 5.5vw, 7rem)" }} />
                <span className="t-display" style={{ fontSize: "clamp(2.5rem, 1rem + 5.5vw, 7rem)" }}>
                  {b.word}
                </span>
              </button>
              <p className={cn("t-body transition-opacity duration-320", on ? "opacity-100" : "opacity-0")} aria-hidden={!on}>
                {b.line}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="text-sm text-muted">Press the right arrow key, or click a beat, to light the next one.</p>
    </Stage>
  );
}
