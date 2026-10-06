import { BadgeCheck, CalendarCheck, MapPin, Route as RouteIcon, Scale, ScanEye, Wrench } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui";
import { Stage } from "@/components/Stage";
import { AGENTS, CAPABILITIES, type AgentInfo } from "@/content/pitch";
import { go } from "@/lib/nav";
import { startAutoplay } from "@/state/autoplay";

const ICONS: Record<AgentInfo["id"], ComponentType<{ className?: string; strokeWidth?: number }>> = {
  scout: ScanEye,
  appraiser: Scale,
  router: RouteIcon,
  matchmaker: MapPin,
  mentor: Wrench,
  scheduler: CalendarCheck,
  certifier: BadgeCheck,
};

export default function Solution() {
  return (
    <Stage title="Scan it once. Seven agents do the rest." lead="Each agent has one job. Together they take a device from your drawer to a certificate.">
      <div className="grid gap-8 lg:grid-cols-12">
        <ol className="relative space-y-1 lg:col-span-7" aria-label="The seven agents">
          <span aria-hidden className="absolute bottom-6 left-[22px] top-6 w-px bg-line" />
          {AGENTS.map((a) => {
            const Icon = ICONS[a.id];
            return (
              <li key={a.id} className="relative flex items-start gap-4 py-1.5">
                <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full border border-teal bg-ink text-teal">
                  <Icon className="size-5" strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <p className="t-body font-semibold">{a.name}</p>
                  <p className="text-base text-muted">{a.job}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="space-y-6 lg:col-span-5">
          <div className="frame space-y-4 p-6">
            <h2 className="t-h2">See it work</h2>
            <p className="t-body text-muted">Scan a sample device, appraise it, route it, book a pickup and receive a certificate.</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" className="min-h-12 px-6 text-lg" onClick={() => go("/demo/scan")}>
                Launch live demo
              </Button>
              <Button className="min-h-12 px-6 text-lg" onClick={() => void startAutoplay()}>
                Play demo for me
              </Button>
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-base font-semibold">What it does</h2>
            <ul className="flex flex-wrap gap-2">
              {CAPABILITIES.map((c) => (
                <li key={c} className="rounded-lg border border-line px-3 py-1.5 text-base">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Stage>
  );
}
