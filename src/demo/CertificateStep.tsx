import { useEffect, useRef, useState } from "react";
import { Copy, Download, Printer } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui";
import { Wordmark } from "@/components/Logo";
import { DEMO_CONFIG } from "@/content/config";
import { CO2E_DISCLAIMER, computeImpact, valueKeptInUse } from "@/engine/impact";
import { ROUTE_META } from "@/engine/routes";
import { dec, inr, kg, num } from "@/lib/format";
import { useCountUp } from "@/lib/hooks";
import { go } from "@/lib/nav";
import { sampleName } from "@/data/devices";
import { useDemo } from "@/state/demo";
import { useDerived } from "@/state/derived";
import { toast } from "@/state/presenter";
import { StepFooter, StepHeader } from "./parts";

function Counter({ label, value, format }: { label: string; value: number; format: (n: number) => string }) {
  const v = useCountUp(value, 1000);
  return (
    <div className="panel p-4">
      <p className="font-display text-3xl font-bold">{format(v)}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function CertificateStep() {
  const issue = useDemo((s) => s.issueCertificate);
  const certificate = useDemo((s) => s.certificate);
  const reservation = useDemo((s) => s.reservation);
  const route = useDemo((s) => s.route);
  const dataSafety = useDemo((s) => s.dataSafety);
  const reset = useDemo((s) => s.reset);
  const d = useDerived();
  const ref = useRef<HTMLDivElement>(null);
  const [qr, setQr] = useState<string>("");
  const link = certificate ? `${DEMO_CONFIG.verifyBaseUrl}${certificate.id}` : "";

  useEffect(() => {
    issue();
  }, [issue]);

  useEffect(() => {
    if (!link) return;
    let alive = true;
    QRCode.toDataURL(link, { margin: 1, width: 240, color: { dark: "#031211", light: "#E8E4D3" } })
      .then((u) => alive && setQr(u))
      .catch(() => alive && setQr(""));
    return () => {
      alive = false;
    };
  }, [link]);

  if (!certificate || !d.profile || !d.appraisal || !route) return <p className="text-muted">Issuing certificate…</p>;

  const impact = computeImpact(d.profile.kind, route, d.profile.weightKg);
  const reservedIds = reservation?.partIds ?? [];
  const reservedNames = d.appraisal.items.filter((i) => reservedIds.includes(i.def.id)).map((i) => i.def.short);
  const value = valueKeptInUse(d.appraisal, route, reservedIds);
  const date = new Date(certificate.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const sanitise = dataSafety === "skipped" ? "Owner skipped the data-safety checklist. Partner wipe pending (simulated)." : "Owner confirmed the data-safety checklist. Partner wipe verified (simulated).";

  const download = async () => {
    if (!ref.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(ref.current, { pixelRatio: 2, backgroundColor: "#E8E4D3" });
      const a = document.createElement("a");
      a.href = url;
      a.download = `pixar-certificate-${certificate.id}.png`;
      a.click();
      toast("Certificate PNG downloaded");
    } catch {
      toast("Could not create the PNG. Use Print or save as PDF instead.");
    }
  };
  const print = () => {
    document.body.classList.add("printing-cert");
    const clear = () => {
      document.body.classList.remove("printing-cert");
      window.removeEventListener("afterprint", clear);
    };
    window.addEventListener("afterprint", clear);
    window.print();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const t = document.createElement("textarea");
      t.value = link;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    toast("Verification link copied");
  };

  const rows: [string, string][] = [
    ["Device", sampleName(d.profile)],
    ["Second life", ROUTE_META[route].name],
    ["Partner", d.partner?.name ?? "Not chosen"],
    ["Date", date],
    ["Weight", kg(d.profile.weightKg)],
    ["Reserved parts", reservedNames.length ? reservedNames.join(", ") : "None"],
  ];

  return (
    <div>
      <StepHeader title="Second-Life Certificate" lead="Certifier has issued your certificate and added this device to the session impact." />
      <div ref={ref} className="cert-sheet ivory-sheet mx-auto w-full max-w-[1000px] rounded-[28px] p-3 sm:p-4">
        <div className="rounded-[20px] border-2 border-deep p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Wordmark dark className="text-3xl" />
            <p className="font-mono text-sm text-deep" aria-label="Certificate ID">
              {certificate.id}
            </p>
          </div>
          <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-5xl">Second-Life Certificate</h2>
          <p className="mt-1 text-base text-ink/80">This device was given a second life through PIXAR, {DEMO_CONFIG.city}.</p>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto]">
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-sm font-semibold text-deep">{k}</dt>
                  <dd className="text-base">{v}</dd>
                </div>
              ))}
              <dt className="text-sm font-semibold text-deep">CO₂e avoided</dt>
              <dd className="text-base">
                {dec(impact.co2eAvoidedKg, 1)} kg <span className="text-sm">(illustrative)</span>
              </dd>
              <dt className="text-sm font-semibold text-deep">Data sanitisation</dt>
              <dd className="text-base">{sanitise}</dd>
            </dl>
            <div className="flex flex-col items-center gap-1">
              {qr ? <img src={qr} alt={`QR code for ${link}`} className="size-32 sm:size-36" /> : <div className="size-32 sm:size-36" />}
              <p className="max-w-36 text-center text-xs break-all">{link.replace("https://", "")}</p>
            </div>
          </div>
          <p className="mt-5 text-xs text-ink/80">{CO2E_DISCLAIMER}</p>
          <p className="mt-2 border-t border-ink/20 pt-2 text-xs font-medium">Simulated certificate for demonstration. Not a legal document.</p>
        </div>
      </div>

      <div className="cert-hide mt-5 flex flex-wrap gap-2">
        <Button variant="primary" onClick={download}>
          <Download className="size-5" strokeWidth={1.5} aria-hidden /> Download PNG
        </Button>
        <Button onClick={print}>
          <Printer className="size-5" strokeWidth={1.5} aria-hidden /> Print or save as PDF
        </Button>
        <Button onClick={copy}>
          <Copy className="size-5" strokeWidth={1.5} aria-hidden /> Copy verification link
        </Button>
      </div>

      <div className="cert-hide mt-6">
        <h2 className="mb-2 text-base font-semibold">Impact of this device</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Counter label="kg diverted" value={impact.kgDiverted} format={(n) => dec(n, 2)} />
          <Counter label="kg CO₂e avoided (illustrative)" value={impact.co2eAvoidedKg} format={(n) => dec(n, 1)} />
          <Counter label="value kept in use (illustrative)" value={value} format={(n) => inr(n)} />
          <Counter label="parts reserved" value={reservedIds.length} format={(n) => num(n)} />
        </div>
      </div>

      <StepFooter back="pickup">
        <Button onClick={() => go("/metrics")}>Open Key metrics</Button>
        <Button
          variant="primary"
          onClick={() => {
            reset(true);
            go("/demo/scan");
            toast("Ready to scan another device");
          }}
        >
          Scan another device
        </Button>
      </StepFooter>
    </div>
  );
}
