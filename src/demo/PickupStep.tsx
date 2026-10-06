import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Circle, Loader2, TriangleAlert } from "lucide-react";
import { Banner, Button, Field, inputCls, Segmented } from "@/components/ui";
import { Dialog } from "@/components/Dialog";
import { partnerById } from "@/data/partners";
import { buildSlots } from "@/engine/slots";
import { useDemo } from "@/state/demo";
import { toast } from "@/state/presenter";
import { cn } from "@/utils/cn";
import { StepFooter, StepHeader } from "./parts";

const CHECKLIST = [
  "Sign out of all accounts",
  "Back up photos and files",
  "Turn off the anti-theft lock",
  "Remove the SIM and memory card",
  "Factory reset the device",
];
const TIMELINE = ["Scheduled", "Partner assigned", "On the way", "Picked up", "Processed"];

interface Errors {
  name?: string;
  mobile?: string;
  address?: string;
  pincode?: string;
  slot?: string;
}

export function PickupStep() {
  const dataSafety = useDemo((s) => s.dataSafety);
  const setDataSafety = useDemo((s) => s.setDataSafety);
  const booking = useDemo((s) => s.booking);
  const confirmBooking = useDemo((s) => s.confirmBooking);
  const advanceBooking = useDemo((s) => s.advanceBooking);
  const skipBooking = useDemo((s) => s.skipBooking);
  const partnerId = useDemo((s) => s.partnerId);
  const partner = partnerById(partnerId);

  const slots = useMemo(() => buildSlots(), []);
  const [ticks, setTicks] = useState<boolean[]>(CHECKLIST.map(() => false));
  const [warn, setWarn] = useState(false);
  const [mode, setMode] = useState<"pickup" | "dropoff">("pickup");
  const [day, setDay] = useState(0);
  const [windowId, setWindowId] = useState<string>("w2");
  const [form, setForm] = useState({ name: "Demo User", mobile: "9876543210", address: "Sample address, Vijay Nagar", pincode: "452010" });
  const [errors, setErrors] = useState<Errors>({});

  // Timeline advances by itself, about 10 seconds end to end.
  useEffect(() => {
    if (!booking || booking.progress >= 4) return;
    const t = window.setInterval(advanceBooking, 2400);
    return () => window.clearInterval(t);
  }, [booking, advanceBooking]);

  const allTicked = ticks.every(Boolean);
  const verb = mode === "pickup" ? "pickup" : "drop-off";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Errors = {};
    if (form.name.trim().length < 2) err.name = "Enter your full name, at least 2 letters.";
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) err.mobile = "Enter a 10-digit mobile number starting with 6, 7, 8 or 9, with no spaces.";
    if (mode === "pickup" && form.address.trim().length < 8) err.address = "Enter the address where the partner should collect it, at least 8 characters.";
    if (!/^\d{6}$/.test(form.pincode.trim())) err.pincode = "Enter a 6-digit pincode, for example 452010.";
    const w = slots[day].windows.find((x) => x.id === windowId);
    if (!w || !w.available) err.slot = "Choose a time window that is available.";
    setErrors(err);
    if (Object.keys(err).length || !w) return;
    confirmBooking({
      mode,
      dateISO: slots[day].iso,
      dateLabel: slots[day].label,
      windowId,
      windowLabel: w.label,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      address: mode === "pickup" ? form.address.trim() : "Drop-off at partner",
      pincode: form.pincode.trim(),
    });
    toast(mode === "pickup" ? "Pickup booked" : "Drop-off booked");
  };

  const selectDay = (i: number) => {
    setDay(i);
    const first = slots[i].windows.find((w) => w.available);
    if (!slots[i].windows.find((w) => w.id === windowId)?.available && first) setWindowId(first.id);
  };

  return (
    <div>
      <StepHeader title="Book pickup" lead="Scheduler books a slot with your partner and tracks it until the device is processed." />

      {!booking && !dataSafety && (
        <div className="panel max-w-2xl space-y-3 p-5">
          <h2 className="t-h2">Protect your data first</h2>
          <p className="text-muted">Tick each item before the device leaves your hands.</p>
          <ul className="space-y-1.5">
            {CHECKLIST.map((c, i) => (
              <li key={c}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-line px-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal">
                  <input type="checkbox" className="size-5 accent-teal" checked={ticks[i]} onChange={() => setTicks(ticks.map((t, j) => (j === i ? !t : t)))} />
                  {c}
                </label>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="primary" disabled={!allTicked} onClick={() => setDataSafety("done")}>
              Continue to scheduling
            </Button>
            <Button onClick={() => setWarn(true)}>Skip with warning</Button>
          </div>
          <Dialog open={warn} onClose={() => setWarn(false)} title="Skip the data-safety checklist?">
            <p className="text-muted">Your photos, messages or accounts may stay on the device. Partners wipe devices, but the safest wipe is yours.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => setWarn(false)}>Go back and tick items</Button>
              <Button
                variant="primary"
                onClick={() => {
                  setWarn(false);
                  setDataSafety("skipped");
                }}
              >
                Skip with warning
              </Button>
            </div>
          </Dialog>
        </div>
      )}

      {!booking && dataSafety && (
        <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            {dataSafety === "skipped" && (
              <Banner tone="hazard" title="Checklist skipped">
                Your data may remain on the device. The certificate will say so.
              </Banner>
            )}
            <Segmented<"pickup" | "dropoff"> label="How will the device reach the partner?" value={mode} onChange={setMode} options={[{ value: "pickup", label: "Pickup at my door" }, { value: "dropoff", label: "I will drop it off" }]} />
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Day</legend>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                {slots.map((s, i) => (
                  <button
                    key={s.iso}
                    type="button"
                    aria-pressed={day === i}
                    onClick={() => selectDay(i)}
                    className={cn("min-h-14 rounded-lg border px-1 py-1 text-center text-sm transition-colors duration-200", day === i ? "border-teal bg-teal font-semibold text-ink" : "border-line hover:bg-ivory/10")}
                  >
                    <span className="block text-xs">{i === 0 ? "Tomorrow" : s.weekday}</span>
                    <span className="block text-base font-semibold">{s.day}</span>
                    <span className="block text-xs">{s.month}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Time window</legend>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {slots[day].windows.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    disabled={!w.available}
                    aria-pressed={windowId === w.id}
                    onClick={() => setWindowId(w.id)}
                    className={cn("min-h-11 rounded-lg border px-2 text-sm", windowId === w.id && w.available ? "border-teal bg-teal font-semibold text-ink" : "border-line hover:bg-ivory/10", !w.available && "text-muted line-through")}
                  >
                    {w.label}
                    {!w.available && <span className="block text-xs no-underline">Unavailable</span>}
                  </button>
                ))}
              </div>
              {errors.slot && (
                <p role="alert" className="mt-1 text-sm">
                  <span className="font-semibold">Fix: </span>
                  {errors.slot}
                </p>
              )}
            </fieldset>
          </div>

          <div className="space-y-3 lg:col-span-5">
            <div className="panel space-y-3 p-4">
              <Field label="Full name" htmlFor="pk-name" error={errors.name}>
                <input id="pk-name" className={inputCls} value={form.name} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "pk-name-err" : undefined} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Mobile number" htmlFor="pk-mobile" error={errors.mobile}>
                <input id="pk-mobile" className={inputCls} inputMode="numeric" value={form.mobile} autoComplete="tel-national" aria-invalid={!!errors.mobile} aria-describedby={errors.mobile ? "pk-mobile-err" : undefined} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              </Field>
              {mode === "pickup" && (
                <Field label="Address" htmlFor="pk-address" error={errors.address}>
                  <input id="pk-address" className={inputCls} value={form.address} autoComplete="street-address" aria-invalid={!!errors.address} aria-describedby={errors.address ? "pk-address-err" : undefined} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </Field>
              )}
              <Field label="Pincode" htmlFor="pk-pin" error={errors.pincode}>
                <input id="pk-pin" className={inputCls} inputMode="numeric" value={form.pincode} autoComplete="postal-code" aria-invalid={!!errors.pincode} aria-describedby={errors.pincode ? "pk-pin-err" : undefined} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </Field>
              <p className="text-sm text-muted">Partner: {partner?.name ?? "not chosen yet"}. Demo only. Nothing leaves this browser.</p>
              <Button type="submit" variant="primary" className="w-full">
                {mode === "pickup" ? "Book pickup" : "Book drop-off"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {booking && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel space-y-2 p-5">
            <h2 className="t-h2">{booking.mode === "pickup" ? "Pickup booked" : "Drop-off booked"}</h2>
            <p className="font-mono text-lg text-teal" aria-label="Booking ID">
              {booking.id}
            </p>
            <p>
              {booking.dateLabel}, {booking.windowLabel}
            </p>
            <p className="text-muted">
              {partner?.name}. {booking.mode === "pickup" ? booking.address : "You will drop the device at the partner."} {booking.pincode}
            </p>
            <p className="text-sm text-muted">Demo only. Nothing leaves this browser.</p>
            {dataSafety === "skipped" && (
              <p className="flex items-center gap-2 text-sm">
                <TriangleAlert className="size-4" strokeWidth={1.5} aria-hidden /> Data-safety checklist was skipped.
              </p>
            )}
          </div>
          <div className="panel p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Status</h2>
              <Button onClick={skipBooking} disabled={booking.progress >= 4}>
                Skip ahead
              </Button>
            </div>
            <ol className="space-y-3" aria-label={`Status timeline for ${verb}`}>
              {TIMELINE.map((t, i) => {
                const done = i < booking.progress || booking.progress >= 4;
                const now = i === booking.progress && booking.progress < 4;
                return (
                  <li key={t} className="flex items-center gap-3" aria-current={now ? "step" : undefined}>
                    {done ? <Check className="size-5 text-teal" strokeWidth={2} aria-hidden /> : now ? <Loader2 className="spin size-5 text-teal" strokeWidth={1.5} aria-hidden /> : <Circle className="size-5 text-muted" strokeWidth={1.5} aria-hidden />}
                    <span className={cn(!done && !now && "text-muted")}>{t}</span>
                    <span className="ml-auto text-sm text-muted">{done ? "Done" : now ? "In progress" : "Next"}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}

      <StepFooter back="parts" next="certificate" nextLabel="Get certificate" nextDisabled={!booking} />
    </div>
  );
}
