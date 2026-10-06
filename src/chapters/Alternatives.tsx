import { useState } from "react";
import { Stage } from "@/components/Stage";
import { GAP_PLAYERS, GAP_ROWS, type Mark } from "@/content/pitch";
import { cn } from "@/utils/cn";

const LABEL: Record<Mark, string> = { yes: "Yes", partly: "Partly", no: "No" };

function MarkIcon({ mark }: { mark: Mark }) {
  return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="8" fill="none" stroke={mark === "no" ? "var(--text-muted)" : "var(--teal)"} strokeWidth="1.5" />
      {mark === "yes" && <circle cx="10" cy="10" r="8" fill="var(--teal)" />}
      {mark === "partly" && <path d="M10 2 A8 8 0 0 1 10 18 Z" fill="var(--teal)" />}
    </svg>
  );
}

export default function Alternatives() {
  const [sel, setSel] = useState<[number, number]>([0, 5]);
  const cell = GAP_ROWS[sel[0]].cells[sel[1]];
  return (
    <Stage title="Nothing today covers the whole journey" lead="Five familiar options, five things a person actually needs. PIXAR is the only one that does all five.">
      <p className="text-sm font-medium text-muted">Our assessment</p>

      <div className="hidden md:block">
        <table className="w-full border-separate border-spacing-0 text-left">
          <caption className="sr-only">Gap matrix of alternatives against five criteria. Our assessment.</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[24%] pb-3 pr-3 text-sm font-medium text-muted">
                Criterion
              </th>
              {GAP_PLAYERS.map((p, j) => (
                <th key={p} scope="col" className={cn("px-2 pb-3 text-center text-sm font-semibold", j === 5 && "rounded-t-2xl bg-teal/10 text-teal")}>
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GAP_ROWS.map((r, i) => (
              <tr key={r.criterion}>
                <th scope="row" className="t-body border-t border-line py-2 pr-3 font-medium">
                  {r.criterion}
                </th>
                {r.cells.map((c, j) => {
                  const on = sel[0] === i && sel[1] === j;
                  return (
                    <td key={j} className={cn("border-t border-line p-1 text-center", j === 5 && "bg-teal/10", j === 5 && i === GAP_ROWS.length - 1 && "rounded-b-2xl")}>
                      <button
                        type="button"
                        aria-label={`${GAP_PLAYERS[j]}, ${r.criterion}: ${LABEL[c.mark]}`}
                        onMouseEnter={() => setSel([i, j])}
                        onFocus={() => setSel([i, j])}
                        onClick={() => setSel([i, j])}
                        className={cn("inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg px-1 text-sm transition-colors duration-200", on ? "bg-ivory/15" : "hover:bg-ivory/10")}
                      >
                        <MarkIcon mark={c.mark} />
                        {LABEL[c.mark]}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div aria-live="polite" className="mt-4 rounded-2xl border border-line bg-s1 p-3 text-base">
          <span className="font-semibold">
            {GAP_PLAYERS[sel[1]]}: {LABEL[cell.mark]}.
          </span>{" "}
          <span className="text-muted">{cell.why}</span>
        </div>
      </div>

      <div className="space-y-5 md:hidden">
        {GAP_ROWS.map((r) => (
          <div key={r.criterion}>
            <h2 className="mb-1 font-semibold">{r.criterion}</h2>
            <ul className="space-y-1 text-sm">
              {r.cells.map((c, j) => (
                <li key={j} className="flex gap-2">
                  <MarkIcon mark={c.mark} />
                  <span>
                    <strong>{GAP_PLAYERS[j]}: {LABEL[c.mark]}.</strong> <span className="text-muted">{c.why}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <ul className="flex flex-wrap gap-4 text-sm text-muted" aria-label="Legend">
        {(["yes", "partly", "no"] as Mark[]).map((m) => (
          <li key={m} className="flex items-center gap-1.5">
            <MarkIcon mark={m} /> {LABEL[m]}
          </li>
        ))}
      </ul>
    </Stage>
  );
}
