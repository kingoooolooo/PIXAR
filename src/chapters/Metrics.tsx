import { useState } from "react";
import { Button } from "@/components/ui";
import { Stage } from "@/components/Stage";
import { LEADERBOARD, PILOT, ROUTE_MIX, WEEKLY_SCANS, pilotDerived } from "@/data/dashboard";
import type { RouteId } from "@/data/types";
import { ROUTE_META, ROUTE_ORDER } from "@/engine/routes";
import { dec, inr, num } from "@/lib/format";
import { useCountUp } from "@/lib/hooks";
import { go } from "@/lib/nav";
import { startAutoplay } from "@/state/autoplay";
import { useDemo } from "@/state/demo";
import { cn } from "@/utils/cn";

function Tile({ label, value, fmt, sub }: { label: string; value: number; fmt: (n: number) => string; sub?: string }) {
  const v = useCountUp(value, 900);
  return (
    <div className="panel p-3">
      <p className="font-display text-2xl font-bold leading-none xl:text-3xl">{fmt(v)}</p>
      <p className="mt-1.5 text-sm">{label}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

const PATTERN_ID: Record<RouteId, string> = { repair: "mix-solid", resell: "mix-stripe", donate: "mix-dots", parts: "mix-outline", recycle: "mix-soft" };

function Patterns() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <pattern id="mix-solid" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="var(--teal)" />
        </pattern>
        <pattern id="mix-stripe" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="var(--ink)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--teal)" strokeWidth="3" />
        </pattern>
        <pattern id="mix-dots" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="var(--ink)" />
          <circle cx="3" cy="3" r="1.6" fill="var(--ivory)" />
        </pattern>
        <pattern id="mix-outline" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="var(--ink)" />
        </pattern>
        <pattern id="mix-soft" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="var(--ivory)" fillOpacity="0.4" />
        </pattern>
      </defs>
    </svg>
  );
}

function ScansChart({ mode }: { mode: "weekly" | "monthly" }) {
  const data = mode === "weekly" ? WEEKLY_SCANS : [0, 1, 2].map((m) => WEEKLY_SCANS.slice(m * 4, m * 4 + 4).reduce((a, b) => a + b, 0));
  const labels = mode === "weekly" ? data.map((_, i) => `W${i + 1}`) : ["Month 1", "Month 2", "Month 3"];
  const max = Math.max(...data);
  const W = 420;
  const H = 190;
  const bw = W / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" role="img" aria-label={`Bar chart of ${mode} scans, 90-day pilot targets. ${data.map((d, i) => `${labels[i]} ${d}`).join(", ")}.`}>
      {data.map((d, i) => {
        const h = (d / max) * (H - 24);
        return (
          <g key={i}>
            <rect x={i * bw + bw * 0.15} y={H - h} width={bw * 0.7} height={h} rx={3} style={{ fill: "var(--teal)", transition: "all 0.32s var(--ease-out)" }} />
            <text x={i * bw + bw / 2} y={H - h - 5} textAnchor="middle" fontSize="11" style={{ fill: "var(--ivory)" }}>
              {d}
            </text>
            <text x={i * bw + bw / 2} y={H + 16} textAnchor="middle" fontSize="11" style={{ fill: "var(--text-muted)" }}>
              {labels[i]}
            </text>
          </g>
        );
      })}
      <line x1="0" x2={W} y1={H} y2={H} stroke="var(--line)" />
    </svg>
  );
}

export default function Metrics() {
  const [mode, setMode] = useState<"weekly" | "monthly">("weekly");
  const session = useDemo((s) => s.session);
  const dv = pilotDerived();
  const maxBoard = Math.max(...LEADERBOARD.map((l) => l.devices));

  return (
    <Stage title="Key metrics" lead="90-day pilot targets (illustrative, not results).">
      <Patterns />
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:col-span-8 xl:grid-cols-5">
          <Tile label="Devices scanned" value={PILOT.devicesScanned} fmt={num} />
          <Tile label="Scan-to-pickup conversion" value={PILOT.conversion * 100} fmt={(n) => `${Math.round(n)}%`} />
          <Tile label="Pickups completed" value={dv.pickups} fmt={num} />
          <Tile label="kg diverted from informal channels" value={dv.kgDiverted} fmt={num} sub="Derived from route mix" />
          <Tile label="Repair and reuse rate" value={dv.reuseRate * 100} fmt={(n) => `${Math.round(n)}%`} sub="Repair, resell, donate" />
          <Tile label="kg CO₂e avoided" value={dv.co2eKg} fmt={num} sub="Illustrative until validated" />
          <Tile label="Student parts reserved and projects built" value={PILOT.studentParts} fmt={num} sub="Parts target" />
          <Tile label="On-time pickups and partner reply" value={PILOT.onTime * 100} fmt={(n) => `${Math.round(n)}%`} sub={`Reply under ${PILOT.replyMinutes} min`} />
          <Tile label="Repeat users and NPS" value={PILOT.repeat * 100} fmt={(n) => `${Math.round(n)}%`} sub={`NPS ${PILOT.nps}`} />
          <Tile label="Institutions onboarded" value={PILOT.institutions} fmt={num} />
        </div>

        <section aria-labelledby="session-h" className="frame p-4 xl:col-span-4">
          <h2 id="session-h" className="t-h2">
            This session
          </h2>
          {session.completions === 0 ? (
            <div className="mt-2 space-y-3">
              <p className="text-muted">No devices completed yet. Run the demo and this counter moves.</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => go("/demo/scan")}>
                  Open live demo
                </Button>
                <Button onClick={() => void startAutoplay()}>Play demo for me</Button>
              </div>
            </div>
          ) : (
            <dl className="mt-3 grid grid-cols-2 gap-3" aria-live="polite">
              <div>
                <dt className="text-sm text-muted">Devices completed</dt>
                <dd className="font-display text-3xl font-bold">{session.completions}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">kg diverted</dt>
                <dd className="font-display text-3xl font-bold">{dec(session.kg, 2)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">kg CO₂e (illustrative)</dt>
                <dd className="font-display text-3xl font-bold">{dec(session.co2e, 1)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Value kept in use</dt>
                <dd className="font-display text-3xl font-bold">{inr(session.value)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Parts reserved</dt>
                <dd className="font-display text-3xl font-bold">{session.parts}</dd>
              </div>
            </dl>
          )}
        </section>

        <section aria-labelledby="scans-h" className="panel p-4 xl:col-span-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 id="scans-h" className="text-base font-semibold">
              Scans per {mode === "weekly" ? "week" : "month"}
            </h2>
            <div role="group" aria-label="Chart period" className="flex gap-1">
              {(["weekly", "monthly"] as const).map((m) => (
                <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={cn("min-h-11 rounded-lg border px-3 text-sm capitalize", mode === m ? "border-teal bg-teal font-semibold text-ink" : "border-line hover:bg-ivory/10")}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <ScansChart mode={mode} />
        </section>

        <section aria-labelledby="mix-h" className="panel p-4 xl:col-span-4">
          <h2 id="mix-h" className="mb-3 text-base font-semibold">
            Route mix
          </h2>
          <svg viewBox="0 0 300 36" className="w-full" role="img" aria-label={`Route mix: ${ROUTE_ORDER.map((r) => `${ROUTE_META[r].name} ${Math.round(ROUTE_MIX[r] * 100)}%`).join(", ")}`}>
            {(() => {
              let x = 0;
              return ROUTE_ORDER.map((r) => {
                const w = ROUTE_MIX[r] * 300;
                const el = <rect key={r} x={x + 0.5} y={0.5} width={w - 1} height={35} rx={3} fill={`url(#${PATTERN_ID[r]})`} stroke={r === "repair" ? "var(--teal)" : "var(--ivory)"} strokeOpacity={r === "repair" ? 1 : 0.6} />;
                x += w;
                return el;
              });
            })()}
          </svg>
          <ul className="mt-3 space-y-1.5 text-sm">
            {ROUTE_ORDER.map((r) => (
              <li key={r} className="flex items-center gap-2">
                <svg width="22" height="14" aria-hidden>
                  <rect x="0.5" y="0.5" width="21" height="13" rx="2" fill={`url(#${PATTERN_ID[r]})`} stroke="var(--ivory)" strokeOpacity="0.7" />
                </svg>
                <span>{ROUTE_META[r].name}</span>
                <span className="ml-auto font-semibold">{Math.round(ROUTE_MIX[r] * 100)}%</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="board-h" className="panel p-4 xl:col-span-3">
          <h2 id="board-h" className="text-base font-semibold">
            Campus leaderboard
          </h2>
          <p className="mb-2 text-xs text-muted">Fictional groups, illustrative devices pledged.</p>
          <ol className="space-y-2">
            {LEADERBOARD.map((l) => (
              <li key={l.name} className="text-sm">
                <div className="flex justify-between gap-2">
                  <span>{l.name}</span>
                  <span className="font-semibold">{l.devices}</span>
                </div>
                <div className="mt-0.5 h-1.5 rounded-full bg-ivory/10">
                  <div className="h-full rounded-full bg-teal" style={{ width: `${(l.devices / maxBoard) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Stage>
  );
}
