import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Circle, Loader2, PanelRightClose, PanelRightOpen, RotateCcw, Terminal } from "lucide-react";
import { buildScript, type ScriptCtx } from "@/agent/script";
import { AGENTS } from "@/content/pitch";
import { useReducedMotion } from "@/lib/hooks";
import { useDemo } from "@/state/demo";
import { useDerived } from "@/state/derived";
import { usePresenter } from "@/state/presenter";
import { stepIndex, type StepId } from "@/state/steps";
import { cn } from "@/utils/cn";

export function AgentConsole({ step }: { step: StepId }) {
  const open = usePresenter((s) => s.consoleOpen);
  const setOpen = usePresenter((s) => s.setConsoleOpen);
  const run = usePresenter((s) => s.run);
  const speed = usePresenter((s) => s.speed);
  const setSpeed = usePresenter((s) => s.setSpeed);
  const playConsole = usePresenter((s) => s.playConsole);
  const reduced = useReducedMotion();
  const d = useDerived();
  const route = useDemo((s) => s.route);
  const booking = useDemo((s) => s.booking);
  const certificate = useDemo((s) => s.certificate);
  const reservation = useDemo((s) => s.reservation);
  const [shown, setShown] = useState(0);
  const logRef = useRef<HTMLOListElement>(null);

  const ctx: ScriptCtx = {
    profile: d.profile,
    appraisal: d.appraisal,
    ranking: d.ranking,
    route,
    partner: d.partner,
    partnerCount: d.partnerCount,
    booking,
    certificate,
    reservedCount: reservation?.partIds.length ?? 0,
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const script = useMemo(() => buildScript(step, ctx), [step, d.profile, d.appraisal, d.ranking, route, d.partner, d.partnerCount, booking, certificate, reservation]);
  const n = script.lines.length;
  const active = run.step === step;

  useEffect(() => {
    if (!active) {
      setShown(0);
      return;
    }
    if (reduced) {
      setShown(n);
      return;
    }
    setShown(0);
    let i = 0;
    let t = 0;
    const tick = () => {
      i += 1;
      setShown(i);
      if (i < n) t = window.setTimeout(tick, 520 / speed);
    };
    t = window.setTimeout(tick, 220 / speed);
    return () => window.clearTimeout(t);
  }, [active, run.runId, speed, n, reduced]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown]);

  const finished = active && shown >= n;
  const cur = stepIndex(step);

  const agentStatus = (agentId: string, agentStep: StepId): "idle" | "working" | "done" => {
    const idx = stepIndex(agentStep);
    if (idx < cur) return "done";
    if (idx > cur || !active) return "idle";
    const mine = script.lines.map((l, i) => (l.agent === agentId ? i : -1)).filter((i) => i >= 0);
    if (!mine.length) return "idle";
    if (shown > mine[mine.length - 1]) return "done";
    if (shown > mine[0] - 0 && shown >= mine[0] + 1) return "working";
    return "idle";
  };

  if (!open) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open agent console"
          className="no-print fixed bottom-16 right-3 z-30 grid size-12 place-items-center rounded-full border border-teal bg-s2 text-teal shadow-[0_0_24px_var(--teal-glow)] lg:hidden"
        >
          <Terminal className="size-5" strokeWidth={1.5} />
        </button>
        <aside aria-label="Agent console (collapsed)" className="no-print hidden w-12 shrink-0 flex-col items-center border-l border-line bg-s1 py-3 lg:flex">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open agent console" className="grid size-11 place-items-center rounded-lg hover:bg-ivory/10">
            <PanelRightOpen className="size-5" strokeWidth={1.5} />
          </button>
          <span className="mt-4 text-sm text-muted [writing-mode:vertical-rl]">Agent console</span>
        </aside>
      </>
    );
  }

  return (
    <aside
      aria-label="Agent console"
      className="no-print fixed inset-x-0 bottom-14 z-40 flex max-h-[62dvh] flex-col rounded-t-[28px] border-t border-line bg-s1 lg:static lg:max-h-none lg:w-[340px] lg:shrink-0 lg:rounded-none lg:border-l lg:border-t-0 xl:w-[380px]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <h2 className="text-base font-semibold">Agent console</h2>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => playConsole(step)} aria-label="Replay this step's log" title="Replay" className="grid size-11 place-items-center rounded-lg hover:bg-ivory/10">
            <RotateCcw className="size-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setSpeed(speed === 1 ? 2 : 1)}
            aria-label={`Playback speed ${speed} times. Switch to ${speed === 1 ? 2 : 1} times`}
            className="grid h-11 min-w-11 place-items-center rounded-lg border border-line px-2 text-sm font-semibold hover:bg-ivory/10"
          >
            {speed}×
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Collapse agent console" className="grid size-11 place-items-center rounded-lg hover:bg-ivory/10">
            <PanelRightClose className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-0.5 border-b border-line px-3 py-2 sm:grid-cols-2 lg:grid-cols-1">
        {AGENTS.map((a) => {
          const st = agentStatus(a.id, a.step);
          return (
            <li key={a.id} className="flex items-center gap-2 py-0.5 text-sm">
              {st === "done" ? (
                <CheckCircle2 className="size-4 shrink-0 text-teal" strokeWidth={1.5} aria-hidden />
              ) : st === "working" ? (
                <Loader2 className="spin size-4 shrink-0 text-teal" strokeWidth={1.5} aria-hidden />
              ) : (
                <Circle className="size-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden />
              )}
              <span className={cn("font-medium", st === "idle" && "text-muted")}>{a.name}</span>
              <span className="ml-auto text-muted">{st}</span>
            </li>
          );
        })}
      </ul>

      <ol ref={logRef} aria-label="Agent log" className="min-h-28 flex-1 space-y-2 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-snug">
        {!active && <li className="text-muted">Waiting. The log plays when this step runs.</li>}
        {script.lines.slice(0, shown).map((l, i) => (
          <li key={i} className="fade-in">
            <span className="mr-2 rounded border border-teal/60 px-1.5 py-px text-teal">{l.tool}</span>
            <span className="text-ivory/90">{l.text}</span>
          </li>
        ))}
      </ol>

      {/* Only each step's final result is announced, not every log line. */}
      <div className="sr-only" aria-live="polite">
        {finished ? script.result : ""}
      </div>
      {finished && <p className="border-t border-line px-4 py-2 text-sm text-muted">{script.result}</p>}
    </aside>
  );
}
