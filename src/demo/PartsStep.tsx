import { useState, type FormEvent } from "react";
import { Check, Lock } from "lucide-react";
import { Banner, Button, Chip, EmptyState, Field, inputCls } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { DEMO_CONFIG } from "@/content/config";
import { PROJECTS, INTERESTS } from "@/data/projects";
import { DEFAULT_PARTS, useDemo } from "@/state/demo";
import { useDerived } from "@/state/derived";
import { toast } from "@/state/presenter";
import { cn } from "@/utils/cn";
import { go } from "@/lib/nav";
import { StepFooter, StepHeader } from "./parts";

interface Errors {
  name?: string;
  college?: string;
  project?: string;
  parts?: string;
}

export function PartsStep() {
  const route = useDemo((s) => s.route);
  const reservation = useDemo((s) => s.reservation);
  const reserve = useDemo((s) => s.reserve);
  const clearReservation = useDemo((s) => s.clearReservation);
  const d = useDerived();
  const [interest, setInterest] = useState<string>("All");
  const [picked, setPicked] = useState<string[] | null>(null);
  const [form, setForm] = useState({ name: reservation?.name ?? "Demo Student", college: reservation?.college ?? DEMO_CONFIG.collegeName, project: reservation?.project ?? "Vibration alert band" });
  const [errors, setErrors] = useState<Errors>({});

  const a = d.appraisal;
  if (!a) return null;
  const swollen = a.hazardous;
  const canReserve = route === "parts" && !swollen;
  const salvage = a.items.filter((i) => i.def.studentUse && i.status !== "hazardous");
  const defaults = DEFAULT_PARTS[a.kind].filter((id) => salvage.some((s) => s.def.id === id));
  const selected = picked ?? defaults;
  const toggle = (id: string) => setPicked((selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]));
  const has = (tag: string) => salvage.some((s) => s.def.studentUse?.tags.some((t) => t === tag));
  const projects = PROJECTS.filter((p) => interest === "All" || p.interest === interest);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Errors = {};
    if (form.name.trim().length < 2) err.name = "Enter your full name, at least 2 letters.";
    if (form.college.trim().length < 2) err.college = "Enter your college name so the lab can match your request.";
    if (form.project.trim().length < 3) err.project = "Name your project in a few words, for example Vibration alert band.";
    if (selected.length === 0) err.parts = "Tick at least one part to reserve.";
    setErrors(err);
    if (Object.keys(err).length) return;
    reserve({ name: form.name.trim(), college: form.college.trim(), project: form.project.trim(), partIds: selected });
    toast("Parts reserved");
  };

  const reservedNames = reservation ? salvage.filter((s) => reservation.partIds.includes(s.def.id)).map((s) => s.def.short) : [];

  return (
    <div>
      <StepHeader title="Student Parts Lab" lead="Maker Mentor shows which parts could power college projects. This step is optional." />
      <div className="mb-5 space-y-3">
        <Banner title="Safety first">Batteries and screens are never opened at home. The partner extracts parts safely, then hands them over.</Banner>
        {swollen && (
          <Banner tone="hazard" title="Reservation disabled">
            The battery is swollen or hot, so parts are shown for reference only. Only a certified recycler should handle this device.
          </Banner>
        )}
        {!swollen && route !== "parts" && (
          <Banner title="Preview only for this route">Reserving parts is enabled only when the chosen route is Student parts. Go back to Route to switch.</Banner>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <h2 className="text-base font-semibold">Parts that could be salvaged</h2>
          {salvage.length === 0 ? (
            <EmptyState title="No parts can be salvaged from this device." action={<Button onClick={() => go("/demo/pickup")}>Hand over the whole device</Button>} />
          ) : (
            <ul className="space-y-2">
              {salvage.map((i) => {
                const u = i.def.studentUse!;
                const isChecked = reservation ? reservation.partIds.includes(i.def.id) : selected.includes(i.def.id);
                return (
                  <li key={i.def.id} className={cn("rounded-2xl border p-3", isChecked && canReserve ? "border-teal bg-teal/10" : "border-line bg-s1")}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold">{i.def.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Chip>{u.difficulty}</Chip>
                          {u.tags.map((t) => (
                            <Chip key={t} className="text-muted">
                              {t}
                            </Chip>
                          ))}
                          <StatusBadge status={i.status} compact />
                        </div>
                      </div>
                      {canReserve && !reservation ? (
                        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal">
                          <input type="checkbox" className="size-4 accent-teal" checked={selected.includes(i.def.id)} onChange={() => toggle(i.def.id)} />
                          Reserve
                        </label>
                      ) : reservation && isChecked ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal">
                          <Check className="size-4" strokeWidth={2} aria-hidden /> Reserved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-muted">
                          <Lock className="size-4" strokeWidth={1.5} aria-hidden /> {swollen ? "Reference only" : "Not available for this route"}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm">{u.what}</p>
                    <p className="mt-1 text-sm text-muted">Tools: {u.tools.join(", ")}.</p>
                    <p className="mt-1 text-sm text-muted">Safety: {u.safety}</p>
                  </li>
                );
              })}
            </ul>
          )}
          {errors.parts && (
            <p role="alert" className="text-sm">
              <span className="font-semibold">Fix: </span>
              {errors.parts}
            </p>
          )}

          {canReserve && !reservation && salvage.length > 0 && (
            <form onSubmit={submit} noValidate className="panel space-y-3 p-4">
              <h2 className="text-base font-semibold">Reserve {selected.length} {selected.length === 1 ? "part" : "parts"}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Student name" htmlFor="stu-name" error={errors.name}>
                  <input id="stu-name" className={inputCls} value={form.name} aria-invalid={!!errors.name} aria-describedby={errors.name ? "stu-name-err" : undefined} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
                </Field>
                <Field label="College" htmlFor="stu-college" error={errors.college}>
                  <input id="stu-college" className={inputCls} value={form.college} aria-invalid={!!errors.college} aria-describedby={errors.college ? "stu-college-err" : undefined} onChange={(e) => setForm({ ...form, college: e.target.value })} />
                </Field>
              </div>
              <Field label="Project title" htmlFor="stu-project" error={errors.project}>
                <input id="stu-project" className={inputCls} value={form.project} aria-invalid={!!errors.project} aria-describedby={errors.project ? "stu-project-err" : undefined} onChange={(e) => setForm({ ...form, project: e.target.value })} />
              </Field>
              <Button type="submit" variant="primary">
                Reserve parts
              </Button>
            </form>
          )}

          {reservation && (
            <div className="pop-in rounded-2xl border border-teal bg-teal/10 p-4" role="status">
              <p className="font-semibold">Parts reserved for {reservation.name}</p>
              <p className="mt-1 text-sm">{reservedNames.join(", ")}.</p>
              <p className="mt-1 text-sm text-muted">Project: {reservation.project}. These parts will appear on your certificate.</p>
              <Button className="mt-3" onClick={clearReservation}>
                Change reservation
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <h2 className="text-base font-semibold">Project ideas</h2>
          <div role="group" aria-label="Filter by interest" className="my-2 flex flex-wrap gap-1.5">
            {["All", ...INTERESTS].map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={interest === k}
                onClick={() => setInterest(k)}
                className={cn("min-h-11 rounded-lg border px-3 text-sm", interest === k ? "border-teal bg-teal font-semibold text-ink" : "border-line hover:bg-ivory/10")}
              >
                {k}
              </button>
            ))}
          </div>
          <ul className="space-y-2">
            {projects.map((p) => {
              const have = p.needs.filter(has).length;
              return (
                <li key={p.id} className="rounded-2xl border border-line bg-s1 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{p.name}</p>
                    <Chip>{p.difficulty}</Chip>
                  </div>
                  <p className="mt-1 text-sm">{p.blurb}</p>
                  <p className="mt-1 text-sm text-muted">
                    {p.interest}. About {p.time}. Skills: {p.skills.join(", ")}.
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    You would have {have} of {p.needs.length} parts
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <StepFooter back="route" next="pickup" nextLabel="Continue to pickup">
        <Button onClick={() => go("/demo/pickup")}>Skip, hand over the whole device</Button>
      </StepFooter>
    </div>
  );
}
