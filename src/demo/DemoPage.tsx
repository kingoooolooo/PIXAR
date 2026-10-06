import { useEffect } from "react";
import { hydrationGuard, useDemo } from "@/state/demo";
import { usePresenter } from "@/state/presenter";
import { phaseRank, STEPS, stepIndex, type StepId } from "@/state/steps";
import { AgentConsole } from "./AgentConsole";
import { AppraiseStep } from "./AppraiseStep";
import { CertificateStep } from "./CertificateStep";
import { PartsStep } from "./PartsStep";
import { PickupStep } from "./PickupStep";
import { RouteStep } from "./RouteStep";
import { ScanStep } from "./ScanStep";
import { Stepper } from "./Stepper";

function Body({ step }: { step: StepId }) {
  switch (step) {
    case "scan":
      return <ScanStep />;
    case "appraise":
      return <AppraiseStep />;
    case "route":
      return <RouteStep />;
    case "parts":
      return <PartsStep />;
    case "pickup":
      return <PickupStep />;
    case "certificate":
      return <CertificateStep />;
  }
}

export default function DemoPage({ step }: { step: StepId }) {
  const phase = useDemo((s) => s.phase);
  const hydrateTo = useDemo((s) => s.hydrateTo);
  const playConsole = usePresenter((s) => s.playConsole);
  const ready = phaseRank(phase) >= phaseRank(STEPS[stepIndex(step)].needs);

  // Deep links: hydrate sample A fast-forwarded to this step if state is missing.
  useEffect(() => {
    if (!ready && Date.now() > hydrationGuard.until) hydrateTo(step);
  }, [ready, step, hydrateTo]);

  useEffect(() => {
    if (!ready) return;
    const ph = useDemo.getState().phase;
    if (step === "scan" && (ph === "idle" || ph === "scanning")) return;
    playConsole(step);
  }, [step, ready, playConsole]);

  return (
    <div className="demo-root flex min-h-full flex-col lg:h-full lg:flex-row">
      <div className="demo-main flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
        <Stepper step={step} />
        <div key={step} className="fade-in stage-pad flex-1 pb-24 lg:pb-10">
          {ready && <Body step={step} />}
        </div>
      </div>
      <AgentConsole step={step} />
    </div>
  );
}
