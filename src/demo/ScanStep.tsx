import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Check, ImageUp, ScanLine } from "lucide-react";
import { componentsFor } from "@/data/components";
import { DEVICES, SAMPLE_IDS, sampleName } from "@/data/devices";
import type { BatteryState, PowerState, SampleId, ScreenState } from "@/data/types";
import { conditionSummary } from "@/engine/appraise";
import { dec } from "@/lib/format";
import { Button, Chip, Segmented } from "@/components/ui";
import { DeviceIllustration } from "@/illustration/DeviceIllustration";
import { ScanBeam, ScanBrackets } from "@/illustration/ScanBeam";
import { useDemo } from "@/state/demo";
import { useDerived } from "@/state/derived";
import { phaseRank } from "@/state/steps";
import { usePresenter } from "@/state/presenter";
import { cn } from "@/utils/cn";
import { StepFooter, StepHeader } from "./parts";

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const KIND_MAP: { label: string; sample: SampleId }[] = [
  { label: "Phone", sample: "A" },
  { label: "Laptop", sample: "B" },
  { label: "Tablet", sample: "C" },
];

export function ScanStep() {
  const s = useDemo();
  const d = useDerived();
  const playConsole = usePresenter((x) => x.playConsole);
  const [reveal, setReveal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const pendingRef = useRef<string | null>(null);

  const kind = d.profile?.kind ?? "phone";
  const comps = componentsFor(kind);
  const n = comps.length;
  const scanning = s.phase === "scanning";
  const scanned = phaseRank(s.phase) >= phaseRank("scanned");

  useEffect(() => {
    if (!scanning) return;
    playConsole("scan");
    setReveal(0);
    const total = 3600;
    const timers: number[] = [];
    for (let i = 1; i <= n; i++) timers.push(window.setTimeout(() => setReveal(i), 500 + (i * (total - 1000)) / (n + 1)));
    timers.push(window.setTimeout(() => useDemo.getState().finishScan(), total));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [scanning, n, playConsole]);

  useEffect(
    () => () => {
      if (pendingRef.current) URL.revokeObjectURL(pendingRef.current);
    },
    []
  );

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!TYPES.includes(f.type)) {
      setError("That file is not a JPG, PNG or WebP image. Choose a photo in one of those formats.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`That photo is ${dec(f.size / 1048576, 1)} MB. Choose one under 10 MB.`);
      return;
    }
    setError(null);
    if (pendingRef.current) URL.revokeObjectURL(pendingRef.current);
    const url = URL.createObjectURL(f);
    pendingRef.current = url;
    setPending(url);
  };

  const mapKind = (sample: SampleId) => {
    if (!pending) return;
    pendingRef.current = null;
    s.selectSample(sample, pending);
    setPending(null);
  };

  const start = () => {
    if (!s.sampleId) return;
    s.beginScan();
  };
  const skip = () => {
    if (!s.sampleId) s.selectSample("A");
    const st = useDemo.getState();
    if (st.phase !== "scanning") st.beginScan();
    useDemo.getState().finishScan();
    playConsole("scan");
  };

  const visible = scanned ? n : scanning ? reveal : 0;
  const vbW = kind === "phone" ? 420 : 520;
  const vbH = 480;

  return (
    <div>
      <StepHeader title="Scan your device" lead="Pick a sample or add a photo, answer three quick questions, then let Scout look inside." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Choose a device</legend>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {SAMPLE_IDS.map((id) => {
                const p = DEVICES[id];
                const checked = s.sampleId === id && !s.photoUrl;
                return (
                  <label
                    key={id}
                    className={cn(
                      "panel flex cursor-pointer flex-col gap-1 p-3 transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal",
                      checked ? "border-teal bg-teal/10" : "hover:border-ivory/40"
                    )}
                  >
                    <input type="radio" name="sample" className="sr-only" checked={checked} disabled={scanning} onChange={() => s.selectSample(id)} />
                    <DeviceIllustration kind={p.kind} explode={0.45} label={`Line drawing of a ${p.kind}`} className="mx-auto h-24 w-full" />
                    <span className="flex items-center justify-between gap-2 font-medium">
                      {sampleName(p)}
                      {checked && <Check className="size-4 text-teal" strokeWidth={2} aria-label="Selected" />}
                    </span>
                    <span className="text-sm text-muted">Sample {id}. {p.blurb}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="panel p-4">
            <p className="mb-2 text-sm font-medium">Or use your own photo</p>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-ivory/60 px-4 text-base hover:bg-ivory/10 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal">
              <ImageUp className="size-5" strokeWidth={1.5} aria-hidden />
              Upload a photo
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} disabled={scanning} />
            </label>
            <p className="mt-2 text-sm text-muted">JPG, PNG or WebP up to 10 MB. The photo stays in this browser and is never uploaded.</p>
            {error && (
              <p role="alert" className="mt-2 rounded-lg border border-ivory p-2 text-sm">
                {error}
              </p>
            )}
            {pending && (
              <div className="mt-3">
                <p className="mb-2 text-sm font-medium">Phone, laptop or tablet?</p>
                <div className="flex flex-wrap gap-2">
                  {KIND_MAP.map((k) => (
                    <Button key={k.label} onClick={() => mapKind(k.sample)}>
                      {k.label}
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted">PIXAR maps it to the nearest sample profile.</p>
              </div>
            )}
          </div>

          <div className="panel space-y-3 p-4">
            <p className="text-sm font-medium">Condition</p>
            <Segmented<PowerState>
              label="Does it power on?"
              value={s.conditions.power}
              disabled={scanning}
              onChange={(v) => s.setCondition("power", v)}
              options={[
                { value: "on", label: "Yes" },
                { value: "off", label: "No" },
              ]}
            />
            <Segmented<ScreenState>
              label="Is the screen cracked?"
              value={s.conditions.screen}
              disabled={scanning}
              onChange={(v) => s.setCondition("screen", v)}
              options={[
                { value: "fine", label: "No" },
                { value: "cracked", label: "Yes" },
              ]}
            />
            <Segmented<BatteryState>
              label="Battery"
              value={s.conditions.battery}
              disabled={scanning}
              onChange={(v) => s.setCondition("battery", v)}
              options={[
                { value: "good", label: "Holds charge" },
                { value: "weak", label: "Weak" },
                { value: "swollen", label: "Swollen or hot" },
              ]}
            />
            <p className="text-sm text-muted">Change an answer and every later result updates.</p>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="frame relative overflow-hidden p-4">
            <div className="relative mx-auto aspect-[420/480] max-h-[56vh] w-full max-w-[520px]">
              {s.photoUrl ? (
                <>
                  <img src={s.photoUrl} alt="Your device photo, shown only in this browser" className="absolute inset-0 size-full object-contain" />
                  <svg viewBox={`0 0 ${vbW} ${vbH}`} className="absolute inset-0 size-full" aria-hidden>
                    <ScanBrackets w={vbW} h={vbH} locked={s.phase !== "idle"} />
                    {scanning && <ScanBeam key="photo-beam" w={vbW} h={vbH} />}
                  </svg>
                </>
              ) : (
                <DeviceIllustration
                  kind={kind}
                  explode={0.8}
                  hotspots={visible}
                  labels
                  label={s.sampleId ? `Exploded line drawing of a ${kind} being scanned` : "Exploded line drawing of a phone, waiting for a scan"}
                  className={cn("size-full", !s.sampleId && "opacity-40")}
                >
                  <ScanBrackets w={vbW} h={vbH} locked={s.phase !== "idle"} />
                  {scanning && <ScanBeam key="beam" w={vbW} h={vbH} />}
                </DeviceIllustration>
              )}
              {!s.sampleId && <p className="absolute inset-x-0 bottom-3 text-center text-sm text-muted">Choose a device to begin</p>}
            </div>
            {s.photoUrl && visible > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Components Scout located">
                {comps.slice(0, visible).map((c) => (
                  <li key={c.id}>
                    <Chip>
                      <Check className="size-3.5 text-teal" strokeWidth={2} aria-hidden />
                      {c.short}
                    </Chip>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={start} disabled={!s.sampleId || scanning}>
              <ScanLine className="size-5" strokeWidth={1.5} aria-hidden />
              {scanned ? "Scan again" : "Start scan"}
            </Button>
            <Button onClick={skip}>Skip animation</Button>
          </div>

          {scanned && d.profile && d.appraisal && (
            <div className="pop-in panel space-y-2 p-4" role="status">
              <p className="font-semibold">Scout found a {d.profile.kind === "phone" ? "smartphone" : "laptop"}</p>
              <div className="flex flex-wrap gap-1.5">
                <Chip>{d.profile.kind === "phone" ? "Smartphone" : "Laptop"}</Chip>
                <Chip>About {d.profile.year}</Chip>
                <Chip>{conditionSummary(d.appraisal.conditions)}</Chip>
                <Chip title="Confidence is scripted for this prototype">Confidence {dec(d.profile.confidence, 2)} (simulated)</Chip>
              </div>
            </div>
          )}
        </div>
      </div>
      <StepFooter next="appraise" nextLabel="Appraise components" nextDisabled={!scanned} />
    </div>
  );
}
