import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { DEMO_CONFIG } from "@/content/config";
import { PHONE_COMPONENTS } from "@/data/components";
import { DeviceIllustration } from "@/illustration/DeviceIllustration";
import { ScanBeam, ScanBrackets } from "@/illustration/ScanBeam";
import { useInView } from "@/lib/hooks";
import { go, gotoChapter } from "@/lib/nav";

export default function Cover() {
  const [active, setActive] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const act = PHONE_COMPONENTS.find((d) => d.id === active);

  return (
    <section className="stage-pad grid min-h-full items-center gap-8 lg:grid-cols-12 bg-[#07090a] text-[#efe6cf]">
      <div className="relative z-10 lg:col-span-7">
        {/* Banner pill linking to the dedicated Hero Page */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => go("/hero")}
            className="group inline-flex items-center gap-2 rounded-full border border-[#efe6cf]/30 bg-[#16181b] px-3.5 py-1.5 text-xs font-mono uppercase tracking-widest text-[#efe6cf] transition-all hover:border-[#efe6cf] hover:bg-[#efe6cf]/10"
          >
            <Sparkles className="size-3.5 text-[#efe6cf] transition-transform group-hover:rotate-12" />
            <span>Launch Standalone Interactive Hero Page</span>
            <span className="text-[#efe6cf]/60">→</span>
          </button>
        </div>

        <h1 className="t-display text-[#efe6cf]">
          <span className="text-outline block">Scan it.</span>
          <span className="block">Give it a second life.</span>
        </h1>
        <p className="t-lead mt-6 max-w-[36ch] text-[#efe6cf]/90 font-sans">
          PIXAR is an AI agent that scans an old phone or laptop, finds its best second life, books the pickup and proves it with a certificate.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="primary" className="min-h-12 px-6 text-lg bg-[#efe6cf] text-[#07090a] hover:bg-[#faf6ee]" onClick={() => gotoChapter(1)}>
            Start the pitch
          </Button>
          <Button className="min-h-12 px-6 text-lg border border-[#efe6cf]/40 text-[#efe6cf] hover:border-[#efe6cf] hover:bg-[#efe6cf]/10" onClick={() => go("/demo/scan")}>
            Jump to live demo
          </Button>
          <Button className="min-h-12 px-6 text-lg border border-[#efe6cf]/25 text-[#efe6cf]/80 hover:text-[#efe6cf] hover:border-[#efe6cf]/60" onClick={() => go("/hero")}>
            Full Hero View
          </Button>
        </div>
        <p className="mt-10 max-w-xl text-sm text-[#efe6cf]/60 font-sans">
          {DEMO_CONFIG.teamName}, {DEMO_CONFIG.collegeName}. {DEMO_CONFIG.programme}. {DEMO_CONFIG.sdg}.
          {DEMO_CONFIG.presenters.length > 0 && ` Presented by ${DEMO_CONFIG.presenters.join(" and ")}.`}
        </p>
      </div>

      <div ref={ref} className="relative lg:col-span-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-10%] rounded-full opacity-50"
          style={{ background: "radial-gradient(closest-side, rgba(239, 230, 207, 0.18), transparent 72%)" }}
        />
        <DeviceIllustration
          kind="phone"
          explode={0.95}
          hotspots="all"
          interactive
          activeId={active}
          onActive={setActive}
          label="Exploded line drawing of a phone being scanned by a warm ivory beam, with a hotspot on each component"
          className="relative mx-auto max-h-[68vh] w-full max-w-[520px]"
        >
          <ScanBrackets w={420} h={480} locked />
          <ScanBeam w={420} h={480} loop running={inView} duration={4.2} />
        </DeviceIllustration>
        <div
          role="tooltip"
          aria-live="polite"
          className="relative mx-auto mt-2 min-h-16 max-w-[520px] rounded-2xl border border-[#efe6cf]/20 bg-[#16181b] p-3 text-sm text-[#efe6cf]"
        >
          {act ? (
            <>
              <p className="font-semibold">{act.name}</p>
              <p className="text-[#efe6cf]/70">{act.note}</p>
            </>
          ) : (
            <p className="text-[#efe6cf]/60">Hover or focus a hotspot to see what is inside.</p>
          )}
        </div>
      </div>
    </section>
  );
}
